import "reflect-metadata";
import axios from 'axios'
import { Inject, Service } from "typedi";

import config from "../config";
import { ERROR_RECORDS_NOT_EXIST } from "../constants";
import { AirQuality, ResponseModel } from "../models";
import { AirQualityRepo } from "../repositories";
import { logger } from "../utils";

@Service()
export class AirQualityService {
    @Inject()
        airQualityRepo: AirQualityRepo

    public async getAirQuality(longitude: number, latitude: number): Promise<ResponseModel<any>> {
        try {
            const airQualityConfig = config.airQualityClient;
            const airQualityParams = {
                key: airQualityConfig.apiKey,
                lat: latitude,
                lon: longitude,
            }

            const response = await axios.get(`${airQualityConfig.url}/${airQualityConfig.endpoints.nearestCity}`, {
                params: airQualityParams,
            })
            return {
                hasError: false,
                payload: response.data.data.current,
            };
        }
        catch (err) {
            logger.error(
                "AirQualityService.getAirQuality: Error querying air quality ",
                err
            );
            return {
                hasError: true,
                payload: null,
                message: err,
            };
        }
    }

    public async insertAirQuality(airQuality: AirQuality): Promise<ResponseModel<any>> {
        try {
            const response = await this.airQualityRepo.insert(airQuality);
            if (response.success) {
                return {
                    hasError: false,
                    payload: response.payload,
                };
            } else {
                return {
                    hasError: true,
                    payload: null,
                };
            }
        }
        catch (err) {
            logger.error(
                "AirQualityService.getAirQuality: Error inserting air quality ",
                err
            );
            return {
                hasError: true,
                payload: null,
                message: err,
            };
        }
    }
    public async getMostPollutedTime(zone: string): Promise<ResponseModel<Date>> {
        try {
            const airquality = await this.airQualityRepo.getByZone(zone);
            if (airquality.success){
                const sortedRecords = airquality.payload.sort((a, b) => parseInt(b.aqius, 10) - parseInt(a.aqius, 10));

                const mostPopulatedTime = sortedRecords[0].timestamp;

                return {
                    hasError: false,
                    payload: mostPopulatedTime,
                };
            } else {
                return {
                    hasError: true,
                    payload: null,
                    message: ERROR_RECORDS_NOT_EXIST,
                };
            }
        }
        catch (err) {
            logger.error(
                "AirQualityService.getAirQuality: Error querying air quality ",
                err
            );
            return {
                hasError: true,
                payload: null,
                message: err,
            };
        }
    }
}
