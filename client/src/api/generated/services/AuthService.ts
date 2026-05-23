/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { UserDto } from '../models/UserDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static postApiAuthRegister({
        requestBody,
    }: {
        requestBody?: RegisterRequest,
    }): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static postApiAuthLogin({
        requestBody,
    }: {
        requestBody?: LoginRequest,
    }): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AuthResponse OK
     * @throws ApiError
     */
    public static postApiAuthDemo(): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Auth/demo',
        });
    }
    /**
     * @returns UserDto OK
     * @throws ApiError
     */
    public static getApiAuthMe(): CancelablePromise<UserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Auth/me',
        });
    }
}
