/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExerciseType } from './ExerciseType';
export type ExerciseDto = {
    id?: string;
    lessonId?: string;
    type?: ExerciseType;
    contentJson?: string | null;
    audioUrl?: string | null;
    order?: number;
};

