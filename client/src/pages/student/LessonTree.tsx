import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import { useAuth } from '../../store/auth';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lesson, Progress } from '../../types/api';
import { Card, Badge } from '../../components/ui';

export default function LessonTree() {
  const { langId } = useParams();
  const navigate = useNavigate();
  const { isDemo } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  useEffect(() => {
    api.get<Lesson[]>(API.languages.lessons(langId!)).then(setLessons).catch(() => {});
    api.get<Progress[]>(API.progress.my).then(setProgress).catch(() => {});
  }, [langId]);

  const getProgress = (lessonId: string) => progress.find(p => p.lessonId === lessonId);
  const isCompleted = (lessonId: string) => progress.some(p => p.lessonId === lessonId && p.completed);

  const isUnlocked = (index: number) => {
    if (isDemo) return true;
    if (index === 0) return true;
    return isCompleted(lessons[index - 1].id);
  };

  return (
    <div className="p-6 md:p-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
        <ChevronLeft className="w-4 h-4" /> Languages
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lessons</h1>

      {lessons.length === 0 ? (
        <p className="text-gray-400 py-12 text-center">No lessons available yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {lessons.sort((a, b) => a.order - b.order).map((lesson, i) => {
            const completed = isCompleted(lesson.id);
            const unlocked = isUnlocked(i);
            const isCurrent = unlocked && !completed;
            const lessonProgress = getProgress(lesson.id);

            return (
              <Card
                key={lesson.id}
                onClick={() => unlocked && navigate(`/lessons/${lesson.id}/play`, { state: { langId } })}
                clickable={unlocked}
                className={!unlocked ? 'opacity-60 cursor-default border-gray-100' : ''}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      completed
                        ? 'bg-brand'
                        : isCurrent
                          ? 'bg-warning'
                          : 'bg-gray-300'
                    }`} />
                    <div className="min-w-0">
                      <h3 className={`font-semibold truncate ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                  {unlocked && (
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {completed && lessonProgress && (
                    <Badge variant="brand">{lessonProgress.score}%</Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="warning">Start</Badge>
                  )}
                  {!unlocked && (
                    <span className="text-xs text-gray-400">Locked</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
