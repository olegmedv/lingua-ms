/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProgressDto } from '../models/ProgressDto';
import type { StatsDto } from '../models/StatsDto';
import type { SubmitProgressRequest } from '../models/SubmitProgressRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProgressService {
    /**
     * @returns ProgressDto OK
     * @throws ApiError
     */
    public static postApiProgressSubmit({
        requestBody,
    }: {
        requestBody?: SubmitProgressRequest,
    }): CancelablePromise<ProgressDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Progress/submit',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ProgressDto OK
     * @throws ApiError
     */
    public static getApiProgressMy(): CancelablePromise<Array<ProgressDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Progress/my',
        });
    }
    /**
     * @returns StatsDto OK
     * @throws ApiError
     */
    public static getApiProgressStats(): CancelablePromise<StatsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Progress/stats',
        });
    }
}
