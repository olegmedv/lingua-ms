import { useMemo } from 'react';
import '../api/openapi-config';
import { FilesService } from '../api/generated';

export function useFiles() {
  return useMemo(() => ({
    upload: (file: File) =>
      FilesService.postApiFilesUpload({ formData: { file } }),
    remove: (url: string) => FilesService.deleteApiFiles({ url }),
  }), []);
}
