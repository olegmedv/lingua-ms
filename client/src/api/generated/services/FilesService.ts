/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UploadFileResponse } from '../models/UploadFileResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FilesService {
    /**
     * @returns UploadFileResponse OK
     * @throws ApiError
     */
    public static postApiFilesUpload({
        formData,
    }: {
        formData?: {
            file?: Blob;
        },
    }): CancelablePromise<UploadFileResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Files/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiFiles({
        url,
    }: {
        url?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/Files',
            query: {
                'url': url,
            },
        });
    }
}
