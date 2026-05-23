/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateExerciseRequest } from '../models/CreateExerciseRequest';
import type { ExerciseDto } from '../models/ExerciseDto';
import type { UpdateExerciseRequest } from '../models/UpdateExerciseRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExercisesService {
    /**
     * @returns ExerciseDto OK
     * @throws ApiError
     */
    public static getApiLessonsExercises({
        lessonId,
    }: {
        lessonId: string,
    }): CancelablePromise<Array<ExerciseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lessons/{lessonId}/exercises',
            path: {
                'lessonId': lessonId,
            },
        });
    }
    /**
     * @returns ExerciseDto OK
     * @throws ApiError
     */
    public static postApiLessonsExercises({
        lessonId,
        requestBody,
    }: {
        lessonId: string,
        requestBody?: CreateExerciseRequest,
    }): CancelablePromise<ExerciseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lessons/{lessonId}/exercises',
            path: {
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ExerciseDto OK
     * @throws ApiError
     */
    public static putApiExercises({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: UpdateExerciseRequest,
    }): CancelablePromise<ExerciseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/exercises/{id}',
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
    public static deleteApiExercises({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/exercises/{id}',
            path: {
                'id': id,
            },
        });
    }
}
