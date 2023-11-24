/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import bodyParser from "body-parser";
import express from 'express';
import bunyanMiddleware from "express-bunyan-logger";
import helmet from "helmet";
import { useExpressServer, useContainer as routingUseContainer, getMetadataArgsStorage } from "routing-controllers";
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUI from "swagger-ui-express";
import { Container, Inject, Service } from "typedi";

import config from "./config";
import { AirQualityJob } from "./jobs/air-quality";
import ErrorHandler from './middlewares/errorHandler';
import { DatabaseService } from './services'
import { logger } from "./utils";

@Service()
export class App {
    public readonly expressApplication: express.Application;
    private swaggerDoc: object;
    private routingControllersOptions: object;

    @Inject()
    private readonly databaseService: DatabaseService

    @Inject()
    private readonly airQualityJob: AirQualityJob

    constructor() {
        this.routingControllersOptions = {
            controllers: [__dirname + "/controllers/*.ts"],
            middlewares: [ErrorHandler],
            defaultErrorHandler: false,
        };
        this.expressApplication = express();
        this.initializeMiddleware();
        this.initializeControllers();
        this.configureSwagger();
        this.initializeSwagger();
        this.configureDependencyInjection();
    }

    private initializeMiddleware(): void {
        this.expressApplication.use(helmet({ hidePoweredBy: true }));
        this.expressApplication.use(bodyParser.json());

        if (config.env !== 'test') {
            this.expressApplication.use(bunyanMiddleware({
                logger,
                parseUA: false,
                excludes: ['response-hrtime', 'req-headers', 'res-headers'],
                format: ':incoming :method :url :status-code',
            }));
        }
    }

    private configureSwagger(): void {
        // Parse class-validator classes into JSON Schema:
        // Parse routing-controllers classes into OpenAPI spec:
        const storage = getMetadataArgsStorage()
        this.swaggerDoc = routingControllersToSpec(storage, this.routingControllersOptions)
    }

    private initializeSwagger(): void {
        this.expressApplication.use('/docs', swaggerUI.serve);
        this.expressApplication.get('/docs', swaggerUI.setup(this.swaggerDoc));
    }

    private configureDependencyInjection(): void {
        routingUseContainer(Container);
    }

    private initializeControllers(): void {
        useExpressServer(this.expressApplication, this.routingControllersOptions);
    }

    public startExpressServer(): void {
        try {
            this.databaseService.initializeAndConnectDB().then(async () => {
                logger.info(`Hey! I'm connected to database...`);
                const server = this.expressApplication.listen(config.server.port);
                if (server) {
                    logger.info(`Hey! I'm listening on port: ${config.server.port} ... API Documentation is available at /docs`);
                    this.airQualityJob.scheduleAirQualityJob();
                }
            }).catch(function (err: any) {
                logger.error('ERROR: ' + err)
            });
        }
        catch (err) {
            logger.error('ERROR: ' + err)
        }
    }
}
