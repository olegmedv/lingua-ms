import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import { ChevronRight } from 'lucide-react';
import type { Language, Lesson } from '../../types/api';
import { Card } from '../../components/ui';

export default function DemoLessonTree() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<Language>(API.languages.demo)
      .then(lang => {
        setLanguage(lang);
        return api.get<Lesson[]>(API.languages.lessons(lang.id));
      })
      .then(setLessons)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="p-6 md:p-10 text-center">
        <p className="text-gray-400 py-12">No demo course available.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      {language && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{language.name}</h1>
          {language.description && <p className="text-gray-500">{language.description}</p>}
        </div>
      )}

      {lessons.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">Loading...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {lessons.sort((a, b) => a.order - b.order).map(lesson => (
            <Card
              key={lesson.id}
              onClick={() => navigate(`/demo/lessons/${lesson.id}/play`, { state: { langId: language?.id, demo: true } })}
              clickable
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0 bg-warning" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
