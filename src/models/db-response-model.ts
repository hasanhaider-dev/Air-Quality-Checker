/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DbResponseModel<T> {
    success: boolean;
    payload: T;
    error?: any;
}
