/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLessonRequest } from '../models/CreateLessonRequest';
import type { LessonDto } from '../models/LessonDto';
import type { UpdateLessonRequest } from '../models/UpdateLessonRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LessonsService {
    /**
     * @returns LessonDto OK
     * @throws ApiError
     */
    public static getApiLanguagesLessons({
        langId,
    }: {
        langId: string,
    }): CancelablePromise<Array<LessonDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/languages/{langId}/lessons',
            path: {
                'langId': langId,
            },
        });
    }
    /**
     * @returns LessonDto OK
     * @throws ApiError
     */
    public static postApiLanguagesLessons({
        langId,
        requestBody,
    }: {
        langId: string,
        requestBody?: CreateLessonRequest,
    }): CancelablePromise<LessonDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/languages/{langId}/lessons',
            path: {
                'langId': langId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns LessonDto OK
     * @throws ApiError
     */
    public static getApiLessons({
        id,
    }: {
        id: string,
    }): CancelablePromise<LessonDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lessons/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns LessonDto OK
     * @throws ApiError
     */
    public static putApiLessons({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: UpdateLessonRequest,
    }): CancelablePromise<LessonDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/lessons/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiLessons({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/lessons/{id}',
            path: {
                'id': id,
            },
        });
    }
}
