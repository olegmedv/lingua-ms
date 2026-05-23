import { useMemo } from 'react';
import '../api/openapi-config';
import { ProgressService } from '../api/generated';
import type { SubmitProgressRequest } from '../api/generated';

export function useProgress() {
  return useMemo(() => ({
    submit: (data: SubmitProgressRequest) =>
      ProgressService.postApiProgressSubmit({ requestBody: data }),
    my: () => ProgressService.getApiProgressMy(),
    stats: () => ProgressService.getApiProgressStats(),
  }), []);
}
