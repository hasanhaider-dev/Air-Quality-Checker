import { Application } from 'express';
import request from 'supertest';
import { Container } from "typedi";

import { App } from '../../src/app';
import { DatabaseService } from '../../src/services';
import { AirQualityService } from '../../src/services/air-quality-service'; // Import the actual service

describe('AirQualityController Integration Tests', () => {
    let expressApp: Application;
    beforeAll(async () => {
        expressApp = Container.get(App).expressApplication;
    });

    describe('GET /airquality', () => {
        it('should return air quality data for valid coordinates', async () => {
            const response = await request(expressApp)
                .get('/airquality')
                .query({ lat: 40.7128, lon: -74.0060 });

            expect(response.status).toBe(200);
            expect(response.body.result).toBeDefined();
        });

        it('should handle validation errors for invalid coordinates', async () => {
            const response = await request(expressApp)
                .get('/airquality')
                .query({ lat: 'invalid', lon: 'invalid' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBeDefined();
        });

        it('should handle server', async () => {
            jest.spyOn(AirQualityService.prototype, 'getAirQuality').mockRejectedValue(new Error('Mock error'));

            const response = await request(expressApp)
                .get('/airquality')
                .query({ lat: 40.7128, lon: -74.0060 });

            expect(response.status).toBe(500);
            expect(response.body.message).toBeDefined();

            jest.restoreAllMocks();
        });
    })

    describe('GET /pollutedtime', () => {
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

        const mockDatabaseService = {
            getDBClient: jest.fn(),
            initializeAndConnectDB: jest.fn().mockImplementationOnce(() => {}),
        };

        const mockDBClient = {
            query: jest.fn().mockResolvedValueOnce({rows: [airQuality]}),
        };

        mockDatabaseService.getDBClient.mockReturnValue(mockDBClient);
        Container.set(DatabaseService, mockDatabaseService);


        it('should return most polluted time for paris zone', async () => {
            const response = await request(expressApp)
                .get('/pollutedtime')
                .query({ zone: "paris" });

            expect(response.status).toBe(200);
            expect(new Date(response.body.result)).toEqual(new Date(timestamp));
        });

        it('should handle server', async () => {
            jest.spyOn(AirQualityService.prototype, 'getMostPollutedTime').mockRejectedValue(new Error('Mock error'));

            const response = await request(expressApp)
                .get('/pollutedtime')
                .query({ zone: "paris" });

            expect(response.status).toBe(500);
            expect(response.body.message).toBeDefined();

            jest.restoreAllMocks();
        });
    })
});
