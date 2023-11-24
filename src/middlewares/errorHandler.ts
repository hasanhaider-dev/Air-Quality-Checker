import { Boom } from "@hapi/boom";
import { Request, Response, NextFunction } from "express";
import { Middleware, ExpressErrorMiddlewareInterface } from "routing-controllers";
import { Service } from "typedi";

import config from "../config";

@Service()
@Middleware({ type: "after" })
export default class ErrorHandler implements ExpressErrorMiddlewareInterface {
    error(err: any, req: Request, res: Response, next: NextFunction): void {
        if (err.details) {
            const validationError = {
                message: 'Validation failed',
                details: Array.from(err.details).map(([key, value]) => {
                    return {
                        key: key,
                        message: value.message,
                    };
                }),
            };
            res.status(400).json(validationError);

            return next();
        }

        const boomErr = err as Boom;
        if (boomErr.isBoom) {
            res.status(boomErr.output.statusCode).send({ message: boomErr.message });
            return next();
        }

        switch (err.name) {
        default:
            req.log.error(err, 'Something not handled well');
            res.status(500).send({
                message: err.message,
                detail: err.name,
                stack: config.env === 'development' ? err.stack : undefined,
            });
            return next();
        }
    }
}
