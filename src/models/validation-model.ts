"use strict";
import { Joi } from "celebrate";

const getAirQualityValidation = {
    query: Joi.object({
        lat: Joi.number().required(),
        lon: Joi.number().required(),
    }),
};

const getMostPollutedTimeValidation = {
    query: Joi.object({
        zone: Joi.string().required(),
    }),
};


const Models = { getAirQualityValidation, getMostPollutedTimeValidation };
export default Models;
