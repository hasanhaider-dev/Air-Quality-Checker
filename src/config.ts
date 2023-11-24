import convict from "convict";

const conf = convict({
    env: {
        format: ['development', 'production', 'test'],
        default: 'development',
        env: 'NODE_ENV',
    },
    server: {
        port: {
            format: 'port',
            default: 3005,
            env: 'APP_PORT',
        },
    },
    database: {
        host: {
            format: '*',
            default: 'localhost',
            env: 'DB_HOSTNAME',
        },
        port: {
            format: 'port',
            default: 5432,
            env: 'DB_PORT',
        },
        name: {
            format: '*',
            default: 'postgres',
            env: 'DB_NAME',
        },
        username: {
            format: '*',
            default: 'postgres',
            env: 'DB_USERNAME',
        },
        password: {
            format: '*',
            default: 'admin',
            env: 'DB_PASSWORD',
        },
        poolSize: {
            format: '*',
            default: 10,
            env: 'POOL_SIZE',
        },
    },
    airQualityClient: {
        url: {
            format: '*',
            default: "http://api.airvisual.com/v2",
            env: 'AIR_QUALITY_URL',
        },
        endpoints: {
            nearestCity: {
                format: '*',
                default: "nearest_city",
                env: 'NEAREST_CITY',
            },
        },
        apiKey: {
            format: '*',
            default: "6ba26158-5728-4840-941b-e7eb7e94d53f",
            env: 'API_KEY',
        },
    },
});

conf.validate({ allowed: 'strict' });

export default conf.getProperties();
