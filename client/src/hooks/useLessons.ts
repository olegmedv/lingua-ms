import { useMemo } from 'react';
import '../api/openapi-config';
import { LessonsService } from '../api/generated';
import type { CreateLessonRequest, UpdateLessonRequest } from '../api/generated';

export function useLessons() {
  return useMemo(() => ({
    listForLanguage: (langId: string) =>
      LessonsService.getApiLanguagesLessons({ langId }),
    byId: (id: string) => LessonsService.getApiLessons({ id }),
    create: (langId: string, data: CreateLessonRequest) =>
      LessonsService.postApiLanguagesLessons({ langId, requestBody: data }),
    update: (id: string, data: UpdateLessonRequest) =>
      LessonsService.putApiLessons({ id, requestBody: data }),
    remove: (id: string) => LessonsService.deleteApiLessons({ id }),
  }), []);
}
