import { useMemo } from 'react';
import '../api/openapi-config';
import { LanguagesService } from '../api/generated';
import type { CreateLanguageRequest, UpdateLanguageRequest } from '../api/generated';

export function useLanguages() {
  return useMemo(() => ({
    list: () => LanguagesService.getApiLanguages(),
    byId: (id: string) => LanguagesService.getApiLanguages1({ id }),
    create: (data: CreateLanguageRequest) =>
      LanguagesService.postApiLanguages({ requestBody: data }),
    update: (id: string, data: UpdateLanguageRequest) =>
      LanguagesService.putApiLanguages({ id, requestBody: data }),
    remove: (id: string) => LanguagesService.deleteApiLanguages({ id }),
    demo: () => LanguagesService.getApiLanguagesDemo(),
  }), []);
}
