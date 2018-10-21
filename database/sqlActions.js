var db = require('./db');
var mysql = require('mysql');
var uniqueString = require('unique-string');
const constants = require('@config');

var rp = require('request-promise');
var turf = require('@turf/turf');

module.exports = {
    insert: {
        addObject: function (database, jsonObject, successCB, failCB) {
            db.getConnection(function (err, connection) {
                connection.query('INSERT INTO ' + connection.escapeId(database) + ' SET ?', jsonObject, function (error, results, fields) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else
                        successCB(results);
                });
            });
        },
        addSpots: function (points, successCB, failCB) {
            db.getConnection(function (err, connection) {
                mappedSpots = []
                points.forEach(function (currentSpot) {
                    mappedSpots.push([currentSpot.lng, currentSpot.lat, currentSpot.block_id]);
                })
                var sql = 'INSERT INTO `parking` (`lng`, `lat`, `block_id`) VALUES ?';
                connection.query(sql, [mappedSpots], function (error, results, fields) {
                    if (error)
                        failCB(error);
                    else
                        successCB(results);
                });
                connection.release();
            });
        }
    },
    select: {
        databasePermissionCheck: function (database, auth_key, permission, successCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = "SELECT * FROM " + connection.escapeId(database) + " WHERE `auth_key` = ? AND `permission` LIKE ?";
                connection.query(sql, [auth_key, "%" + permission + "%"], function (error, rows) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else if (rows.length == 1)
                        successCB();
                    else
                        failCB();
                });
            });
        },
        authKeyPermissionCheck: function (database, username, permission, successCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = "SELECT * FROM " + connection.escapeId(database) + " WHERE `username` = ? AND `auth_key_permissions` LIKE ?";
                connection.query(sql, [username, "%" + permission + "%"], function (error, rows) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else if (rows.length == 1)
                        successCB(rows);
                    else
                        failCB();
                });
            });
        },
        tempAuthKeyCheck: function (database, username, genKey, permission, successCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = "SELECT * FROM " + connection.escapeId(database) + " WHERE `request_user` = ? AND `temp_key` = ? AND `permissions` LIKE ?";
                connection.query(sql, [username, genKey, "%" + permission + "%"], function (error, rows) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else if (rows.length == 1)
                        successCB(rows);
                    else
                        failCB();
                });
            });
        },
        regularSelect: function (database, selection, keys, operators, values, numResults, successCB, noneFoundCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = 'SELECT ';
                if (selection == null || selection == "*") {
                    sql += '*';
                } else {
                    sql += selection[0] + ' ';
                    for (index = 1; index < selection.length; index++) {
                        sql += ', ' + selection[index]
                    }
                }
                sql += ' FROM ' + connection.escapeId(database) + ' WHERE ';
                if (keys.length != operators.length || operators.length != values.length)
                    return failCB('Key length must match value length.');
                for (var index = 0; index < keys.length; index++) {
                    if (index < keys.length - 1)
                        sql += "`" + keys[index] + "` " + operators[index] + " ? AND ";
                    else
                        sql += "`" + keys[index] + "` " + operators[index] + " ?";
                }
                connection.query(sql, values, function (error, rows) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else if (numResults == null)
                        successCB(rows)
                    else if (numResults != null && rows.length == 0)
                        noneFoundCB();
                    else
                        successCB(rows);
                });
            });
        },
        selectRadius: function (database, lat, lng, miles, successCB, noneFoundCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = "SELECT *, ( 3959 * acos( cos( radians(?) ) * cos( radians( `lat` ) ) * cos( radians( `lng` ) - radians(?) ) + sin( radians(?) ) * sin(radians(`lat`)) ) ) AS distance FROM " + connection.escapeId(database) + "  HAVING distance < ?"
                connection.query(sql, [lat, lng, lat, miles], function (error, rows) {
                    connection.release();
                    if (error) {
                        // console.log(error)
                        failCB(error);
                    }
                    if (rows.length == 0) {
                        // console.log('None found.')
                        noneFoundCB();
                    } else
                        successCB(rows)
                });
            });
        }
    },
    remove: {
        regularDelete: function (database, keys, values, successCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = "DELETE FROM " + connection.escapeId(database) + " WHERE ";
                if (keys.length != values.length)
                    return failCB('Key length must match value length.');
                for (var index = 0; index < keys.length; index++)
                    if (index < keys.length - 1)
                        sql += "`" + keys[index] + "` = ? AND ";
                    else
                        sql += "`" + keys[index] + "` = ?";
                connection.query(sql, values, function (error, rows) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else
                        successCB(rows);
                });
            });
        },
        deleteVerificationCode: function (phoneNumber, deviceId, successCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = "DELETE FROM `user_verify_codes` WHERE `phone_number` = ? AND `device_id` = ?";
                connection.query(sql, [phoneNumber, deviceId], function (error, rows) {
                    connection.release();
                    if (error)
                        return failCB(error);
                    else
                        successCB(rows);
                });
            });
        }
    },
    update: {
        updateSpotStatus(spot_id, occupied, successCB, noExistCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = "UPDATE `parking` SET `occupied` = ? WHERE `spot_id` = ?";
                connection.query(sql, [occupied, spot_id], function (error, results, fields) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else if (results.affectedRows == 1)
                        successCB();
                    else
                        noExistCB();
                });
            });
        },
        updateProfilePic(accessCode, deviceId, successCB, failCB) { //return profileID to use for s3 upload
            db.getConnection(function (err, connection) {
                var sql = "SELECT * FROM `user_access_codes` WHERE `access_code` = ? AND `device_id` = ?";
                connection.query(sql, [accessCode, deviceId], function (error, rows) {
                    if (error)
                        failCB(error);
                    if (rows.length == 0) {
                        failCB('INVALID_ACCESS_CODE');
                    } else {
                        var sql = "SELECT * FROM `users` WHERE `user_id` = ?";
                        connection.query(sql, [rows[0].user_id], function (error, rows) {
                            if (error)
                                failCB(error);
                            if (rows.length == 0) {
                                failCB('INVALID_ACCESS_CODE');
                            } else {
                                if (rows[0].profile_pic == null) {
                                    var profilePicID = uniqueString();
                                    var sql = 'UPDATE `users` SET `profile_pic` = ? WHERE `user_id` = ?';
                                    connection.query(sql, [profilePicID, rows[0].user_id], function (error, results, fields) {
                                        if (error)
                                            failCB(error);
                                        if (results.affectedRows == 0)
                                            failCB('INVALID_ACCESS_CODE');
                                        else
                                            successCB(profilePicID);
                                    });
                                } else {
                                    successCB(rows[0].profile_pic);
                                }
                            }
                        });
                    }
                });
                connection.release();
            });
        },
        locationUpdate: function (currLng, currLat, sessionId, successCB, failCB) {
            db.getConnection(function (err, connection) {
                var sql = 'UPDATE `routing_sessions` SET `last_location` = ?, `counter` = 0 WHERE `session_id` = ?;';
                sql += 'SELECT `parking_dest`,`remaining_bikes`,`remaining_scoots`, `mode` FROM `routing_sessions` WHERE `session_id` = ?;';
                connection.query(sql, [currLng + "," + currLat, sessionId, sessionId], function (error, rows) {
                    connection.release();
                    if (error)
                        failCB(error);
                    else if (rows.length == 0)
                        noneFoundCB();
                    else {
                        var dest = rows[1][0].parking_dest.split(',');
                        var commuteMode = rows[1][0].mode;
                        // This conditional checks if user has arrived at their destination
                        // Fedor idea: Instead of turf.distance use time remaining as proximity metric!!
                        if (turf.distance([parseFloat(currLng), parseFloat(currLat)], [parseFloat(dest[0]), parseFloat(dest[1])], {
                                units: 'miles'
                            }) < constants.reroute.proximity_threshold) {
                            sql = 'UPDATE `routing_sessions` SET `status` = 1 WHERE `session_id` = ?;';
                            connection.query(sql, [sessionId], function (error, results) {
                                if (error)
                                    failCB(error);
                            });
                        // This conditional checks if too many bike/scooters have been taken from user's parking dest
                        } else if (commuteMode == 'bike' && ((turf.distance([parseFloat(currLng), parseFloat(currLat)], [parseFloat(dest[0]), parseFloat(dest[1])], {
                                        units: 'miles'
                                    }) > constants.reroute.distant_threshold &&
                                    rows[1][0].remaining_bikes + rows[1][0].remaining_scoots < constants.reroute.last_mile_options_threshold) ||
                                rows[1][0].remaining_bikes + rows[1][0].remaining_scoots < 1)) {
                            // If this happens, we'll re-route the user
                            // Note: we'll only have to re-route if user is using last-mile transport, i.e. mode=='bike'
                            var options = {
                                method: 'POST',
                                // uri: 'http://localhost:3000/get_drive_' + commuteMode + '_route',
                                uri: 'https://routing-dev.trya.space/v1/get_drive_' + commuteMode + '_route',
                                qs: {
                                    origin_lat: currLat,
                                    origin_lng: currLng,
                                    dest_lat: dest[1],
                                    dest_lng: dest[0],
                                    session_starting: '0'
                                },
                                json: true
                            };
                            rp(options)
                                .then(function (body) {
                                    var new_dest = body.res_content.routes[0][0].dest.lng.toString() + "," + body.res_content.routes[0][0].dest.lat.toString();
                                    sql = 'UPDATE `routing_sessions` SET `parking_dest` = ? WHERE `session_id` = ?;';
                                    connection.query(sql, [new_dest, sessionId], function (error, results) {
                                        if (error)
                                            failCB(error);
                                    });
                                    return
                                })
                                .catch(function (err) {
                                    return failCB(err);
                                })
                        }
                        successCB(rows);
                    }
                });
            });
        }
    }
}