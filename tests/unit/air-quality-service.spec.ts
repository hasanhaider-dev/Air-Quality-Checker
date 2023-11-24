import "reflect-metadata";
import axios from "axios";
import { Container } from "typedi";

import { ERROR_RECORDS_NOT_EXIST } from "../../src/constants";
import { AirQuality, DbResponseModel } from "../../src/models";
import { ResponseModel } from "../../src/models/response-model";

import { AirQualityService } from "./../../src/services";

jest.mock("axios");

describe("AirQualityService", () => {
    let airQualityService: AirQualityService;
    const timestamp = new Date()
    const airQuality = {
        zone: 'TestZone',
        aqius: '10',
        mainus: 'TestMainUS',
        aqicn: '20',
        maincn: 'TestMainCN',
        id: 'one',
        timestamp: timestamp,
    };

    beforeEach(() => {
        airQualityService = Container.get(AirQualityService);
    });

    describe("getAirQuality", () => {
        it("should get air quality successfully", async () => {
            const mockResponse = {
                data: {
                    data: {
                        current: {
                            "pollution": {
                                "ts": "2023-11-22T17:00:00.000Z",
                                "aqius": 78,
                                "mainus": "p2",
                                "aqicn": 36,
                                "maincn": "p2",
                            },
                            "weather": {
                                "ts": "2023-11-22T17:00:00.000Z",
                                "tp": 12,
                                "pr": 1016,
                                "hu": 88,
                                "ws": 1.9,
                                "wd": 198,
                                "ic": "01n",
                            },
                        },
                    },
                },
            };

            (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(
                mockResponse
            );

            const result: ResponseModel<any> = await airQualityService.getAirQuality(
                123,
                456
            );

            expect(result.hasError).toBeFalsy();
            expect(result.payload).toEqual(mockResponse.data.data.current);
        });

        it("should handle error when querying air quality", async () => {
            const errorMessage = "Network error";

            // Mocking axios.get to throw an error
            (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValueOnce(
                errorMessage
            );

            const result: ResponseModel<any> = await airQualityService.getAirQuality(
                123,
                456
            );

            expect(result.hasError).toBeTruthy();
            expect(result.payload).toBeNull();
            expect(result.message).toEqual(errorMessage);
        });
    })

    describe("insertAirQuality", () => {
        it('should return success response when insertion is successful', async () => {
            const mockResponse = { success: true, payload: airQuality };
            jest.spyOn(airQualityService.airQualityRepo, 'insert').mockResolvedValueOnce(mockResponse);

            const result = await airQualityService.insertAirQuality(airQuality);

            expect(result.hasError).toBeFalsy();
            expect(result.payload).toEqual(mockResponse.payload);
        });

        it('should handle errors during air quality insertion', async () => {
            const errorMessage = 'Error inserting air quality';
            jest.spyOn(airQualityService.airQualityRepo, 'insert').mockRejectedValueOnce(errorMessage);

            const result = await airQualityService.insertAirQuality(airQuality);

            expect(result.hasError).toBeTruthy();
            expect(result.payload).toBeNull();
            expect(result.message).toEqual(errorMessage);
        });
    });

    describe('getMostPollutedTime', () => {
        it('should return the most polluted time for a given zone', async () => {
            const mockAirQuality = { success: true, payload: [airQuality] };
            jest.spyOn(airQualityService.airQualityRepo, 'getByZone').mockResolvedValueOnce(mockAirQuality);

            const result = await airQualityService.getMostPollutedTime('zone');

            expect(result.hasError).toBeFalsy();
            expect(result.payload).toEqual(mockAirQuality.payload[0].timestamp);
        });

        it('should handle when no records exist for a specific zone', async () => {
            const mockAirQuality: DbResponseModel<AirQuality[]> = { success: false, payload: null };
            jest.spyOn(airQualityService.airQualityRepo, 'getByZone').mockResolvedValueOnce(mockAirQuality);

            const result = await airQualityService.getMostPollutedTime('zone');

            expect(result.hasError).toBeTruthy();
            expect(result.payload).toBeNull();
            expect(result.message).toEqual(ERROR_RECORDS_NOT_EXIST);
        });

        it('should handle errors while getting air quality by zone', async () => {
            const errorMessage = 'Error querying air quality';
            jest.spyOn(airQualityService.airQualityRepo, 'getByZone').mockRejectedValueOnce(errorMessage);

            const result = await airQualityService.getMostPollutedTime('zone');

            expect(result.hasError).toBeTruthy();
            expect(result.payload).toBeNull();
            expect(result.message).toEqual(errorMessage);
        });
    });
});
