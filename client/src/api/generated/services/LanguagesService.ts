/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLanguageRequest } from '../models/CreateLanguageRequest';
import type { LanguageDto } from '../models/LanguageDto';
import type { UpdateLanguageRequest } from '../models/UpdateLanguageRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LanguagesService {
    /**
     * @returns LanguageDto OK
     * @throws ApiError
     */
    public static getApiLanguages(): CancelablePromise<Array<LanguageDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/languages',
        });
    }
    /**
     * @returns LanguageDto OK
     * @throws ApiError
     */
    public static postApiLanguages({
        requestBody,
    }: {
        requestBody?: CreateLanguageRequest,
    }): CancelablePromise<LanguageDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/languages',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns LanguageDto OK
     * @throws ApiError
     */
    public static getApiLanguagesDemo(): CancelablePromise<LanguageDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/languages/demo',
        });
    }
    /**
     * @returns LanguageDto OK
     * @throws ApiError
     */
    public static getApiLanguages1({
        id,
    }: {
        id: string,
    }): CancelablePromise<LanguageDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/languages/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns LanguageDto OK
     * @throws ApiError
     */
    public static putApiLanguages({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: UpdateLanguageRequest,
    }): CancelablePromise<LanguageDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/languages/{id}',
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
    public static deleteApiLanguages({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/languages/{id}',
            path: {
                'id': id,
            },
        });
    }
}
