import "reflect-metadata";

import { Inject, Service } from "typedi";

import { DbResponseModel } from "../models";
import { AirQuality } from "../models/air-quality";
import { DatabaseService } from "../services";
import { logger } from "../utils";

@Service()
export class AirQualityRepo {
    @Inject()
    private databaseService: DatabaseService

    public async insert(airQuality: AirQuality): Promise<DbResponseModel<AirQuality>> {
        try {
            const query = `INSERT INTO airquality(zone, aqius, mainus, aqicn, maincn) VALUES($1, $2, $3, $4, $5) RETURNING *`;
            const values = [airQuality.zone, airQuality.aqius, airQuality.mainus, airQuality.aqicn, airQuality.maincn];
            logger.info("AirQualityRepo.insert: Adding new item in AirQuality: ", airQuality, query);
            const result = (await this.databaseService.getDBClient().query(query, values)).rows;

            return {
                success: true,
                payload: {
                    aqicn: result[0].aqicn,
                    id: result[0].id,
                    aqius: result[0].aqius,
                    maincn: result[0].maincn,
                    mainus: result[0].mainus,
                    timestamp: result[0].timestamp,
                    zone: result[0].zone,
                },
            };
        } catch (error) {
            logger.error(
                "AirQualityRepo.addItem: Error occured while adding item in AirQuality: ",
                error
            );

            return {
                success: false,
                payload: null,
                error: error,
            };
        }
    }

    public async getByZone(zone: string): Promise<DbResponseModel<AirQuality[]>> {
        try {
            logger.info(
                "AirQualityRepo.getByZone: get most populated time of a zone ",
                zone
            );
            const query = `Select * FROM airquality where zone = $1`;
            const result = (await this.databaseService.getDBClient().query(query, [zone])).rows;
            if (result.length == 0) {
                return {
                    success: false,
                    payload: null,
                    error: null,
                };
            }
            else {
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "AirQualityRepo.addItem: Error occured while getting item from AirQuality: ",
                error
            );

            return {
                success: false,
                payload: null,
                error: error,
            };
        }
    }
}
