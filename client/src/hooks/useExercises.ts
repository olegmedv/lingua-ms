import { useMemo } from 'react';
import '../api/openapi-config';
import { ExercisesService } from '../api/generated';
import type { CreateExerciseRequest, UpdateExerciseRequest } from '../api/generated';

export function useExercises() {
  return useMemo(() => ({
    listForLesson: (lessonId: string) =>
      ExercisesService.getApiLessonsExercises({ lessonId }),
    create: (lessonId: string, data: CreateExerciseRequest) =>
      ExercisesService.postApiLessonsExercises({ lessonId, requestBody: data }),
    update: (id: string, data: UpdateExerciseRequest) =>
      ExercisesService.putApiExercises({ id, requestBody: data }),
    remove: (id: string) => ExercisesService.deleteApiExercises({ id }),
  }), []);
}
