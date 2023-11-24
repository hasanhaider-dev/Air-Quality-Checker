import "reflect-metadata";
import { Response, Request } from "express";
import { JsonController, Req, Res, Get } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Service } from "typedi";

import { ResponseModel } from '../models';

@JsonController()
@Service()
export class DefaultController {
    @Get("/")
    @OpenAPI({
        description:
        "Health check controller to make sure that the app is running.",
        responses: {
            "400": {
                description: "Bad request",
            },
            "200": {
                description: "Success Response",
            },
        },
    })
    public healthCheck(
        @Req() req: Request,
        @Res() res: Response
    ): Response<ResponseModel<unknown>> {
        return res.send({ message: "Hello World from the health check!!" });
    }
}
