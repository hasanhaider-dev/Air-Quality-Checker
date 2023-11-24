import { StatusCodes } from "http-status-codes";
export interface ResponseModel<T> {
  message?: string;
  payload?: T;
  statusCode?: StatusCodes;
  hasError: boolean;
}
