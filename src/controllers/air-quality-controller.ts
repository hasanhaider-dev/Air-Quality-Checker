import "reflect-metadata";
import { celebrate } from "celebrate";
import { Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { JsonController, Req, Res, Get, UseBefore } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";

import { ERROR_RECORDS_NOT_EXIST } from "../constants";
import { ResponseModel } from '../models';
import Models from '../models/validation-model';
import { AirQualityService } from "../services/air-quality-service";
import { logger } from "../utils";

@JsonController()
@Service()
export class AirQualityController {
    @Inject()
        airQualityService: AirQualityService

    @Get("/airquality")
    @UseBefore(celebrate(Models.getAirQualityValidation))
    @OpenAPI({
        description:
            "Controller to check air quality from the provided coordinates.",
        parameters: [
            {
                in: "query",
                name: "lat",
                required: true,
                schema: {
                    type: "number",
                },
                description: "Latitude of the location",
            },
            {
                in: "query",
                name: "lon",
                required: true,
                schema: {
                    type: "number",
                },
                description: "Longitude of the location",
            },
        ],
        responses: {
            "400": {
                description: "Bad request",
            },
            "200": {
                description: "Success Response",
            },
        },
    })
    public async GetAirQuality(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<Response<ResponseModel<unknown>>> {
        try {
            const response = await this.airQualityService.getAirQuality(Number(req.query.lon), Number(req.query.lat))
            if (response.hasError){
                return res.send({ status: StatusCodes.INTERNAL_SERVER_ERROR, message: response.message });
            } else {
                return res.send({ result: response.payload });
            }
        } catch (error) {
            logger.error('Error in GetAirQuality controller:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
        }
    }

    @Get("/pollutedtime")
    @UseBefore(celebrate(Models.getMostPollutedTimeValidation))
    @OpenAPI({
        description:
            "Controller to get the time when air quality is most populated of a provided zone.",
        parameters: [
            {
                in: "query",
                name: "zone",
                required: true,
                schema: {
                    type: "string",
                },
                description: "name of the zone",
            },
        ],
        responses: {
            "400": {
                description: "Bad request",
            },
            "200": {
                description: "Success Response",
            },
        },
    })
    public async GetMostPollutedTime(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<Response<ResponseModel<unknown>>> {
        try {
            const response = await this.airQualityService.getMostPollutedTime(String(req.query.zone))
            if (response.hasError && response.message == ERROR_RECORDS_NOT_EXIST){
                return res.send({ status: StatusCodes.NOT_FOUND, message: response.message });
            } else {
                return res.send({ result: response.payload });
            }
        } catch (error) {
            logger.error('Error in GetMostPollutedTime controller:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
        }
    }
}
