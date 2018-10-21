module.exports = {
    express: {
        RESPONSE_TIMEOUT_MILLI: 30000
    },
    mysql_config: {
        ADMIN_TABLE: 'aspace_admins'
    },
    slack: {
        webhook: 'https://hooks.slack.com/services/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'
    },
    db: {
        DATABASE_USER: 'api',
        DATABASE_PASSWORD: '~aspace-Express-Server001!',
        DATABASE_NAME: 'aspace',
        DATABASE_IP: '165.227.30.227',
        DATABASE_PORT: '3306'
    },
    fs_paths: {
        profile_pics: 'uploads/profile_pic_temp/'
    },
    geojson: {
        settings: {
            Point: ['lat', 'lng']
        }
    },
    mapbox: {
        API_KEY: 'pk.eyJ1IjoiZmVkb3ItYXNwYWNlIiwiYSI6ImNqa2E3ZXdvajBhNDMzdnFqeG1wazd6bDAifQ.qa2V7gEDnMpguAOZdeZB8w'
    },
    optimize: {
        DRIVE_PARK: 'ec562e3c-5e37-5a92-a50f-a036b7319ac4',
        PARK_BIKE: '0f24f35e-ec77-5482-89b9-de18cb43d3fb',
        PARK_WALK: 'e0e23ab7-eb94-54d9-a7c3-473874a0fd84',
        time_threshold: 600,
        cluster_distance_threshold: 0.1
    },
    reroute: {
        proximity_threshold: 0.05,
        distant_threshold: 0.75,
        last_mile_options_threshold: 2
    }
}