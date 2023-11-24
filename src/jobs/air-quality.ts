import cron from 'node-cron';
import { Inject, Service } from 'typedi';

import { ZONE_TO_COORDINATES } from '../constants';
import { AirQualityService } from '../services';
import { logger } from '../utils/logger';

@Service()
export class AirQualityJob {
    @Inject()
    private airQualityService: AirQualityService

    private async getAirQuality() {
        try {
            // Get air quality for Paris zone
            const coordinates = ZONE_TO_COORDINATES["paris"];
            const response = await this.airQualityService.getAirQuality(coordinates.lon, coordinates.lat);
            if (response.hasError) {
                logger.error('Error fetching air quality:', response.message);
            } else {
                const result = await this.airQualityService.insertAirQuality({ zone: "paris", ...response.payload.pollution })
                if (result.hasError){
                    logger.error('Unable to insert air quality', ...response.payload.pollution);
                } else {
                    logger.info('Inserted air quality:', result.payload);
                }
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    }

    public scheduleAirQualityJob() {
        const cronJobSchedule = '*/1 * * * *';
        cron.schedule(cronJobSchedule, () => this.getAirQuality(), {
            scheduled: true,
            timezone: 'UTC',
        });

        logger.info('Cron job started. Will run every minute.');
    }
}
