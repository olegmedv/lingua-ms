export const API = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
  },
  languages: {
    list: '/api/languages',
    demo: '/api/languages/demo',
    byId: (id: string) => `/api/languages/${id}`,
    lessons: (langId: string) => `/api/languages/${langId}/lessons`,
  },
  lessons: {
    byId: (id: string) => `/api/lessons/${id}`,
    exercises: (lessonId: string) => `/api/lessons/${lessonId}/exercises`,
  },
  exercises: {
    byId: (id: string) => `/api/exercises/${id}`,
  },
  progress: {
    submit: '/api/progress/submit',
    my: '/api/progress/my',
    stats: '/api/progress/stats',
  },
  files: {
    upload: '/api/files/upload',
    delete: (url: string) => `/api/files?url=${encodeURIComponent(url)}`,
  },
};
