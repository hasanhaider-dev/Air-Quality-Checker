import "reflect-metadata";

import { Client } from 'pg'
import { Service } from "typedi";

import config from "../config";
import { logger } from "../utils";

@Service()
export class DatabaseService {
    private client: Client;

    public async initializeAndConnectDB(): Promise<any> {
        try {
            const client = new Client({
                user: config.database.username,
                host: config.database.host,
                database: config.database.name,
                password: config.database.password,
                port: config.database.port,
            })

            await client.connect()
            client.query("DROP TABLE IF EXISTS airquality")
            client.query("CREATE TABLE IF NOT EXISTS airquality(ID UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),zone VARCHAR(50) NOT NULL,aqius VARCHAR(50) NOT NULL, mainus VARCHAR(50) NOT NULL, aqicn VARCHAR(50) NOT NULL, maincn VARCHAR(50) NOT NULL, timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW())", (err, res) => {
                if (err != null) {
                    logger.error(
                        "DATABASE_SERVICE.initializeAndConnectDB: Error creating assets table: ",
                        err
                    );
                }
                logger.info("created tables successfully")
            });

            this.client = client;
        } catch (err) {
            logger.error(
                "DATABASE_SERVICE.initializeAndConnectDB: Error connecting to Database: ",
                err
            );
        }
    }
    public getDBClient(): Client {
        return this.client;
    }
}
