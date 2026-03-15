import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  order: number;
  passThreshold: number;
}

interface Progress {
  lessonId: string;
  completed: boolean;
  score: number;
}

export default function LessonTree() {
  const { langId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  useEffect(() => {
    api.get<Lesson[]>(`/api/languages/${langId}/lessons`).then(setLessons).catch(() => {});
    api.get<Progress[]>('/api/progress/my').then(setProgress).catch(() => {});
  }, [langId]);

  const getProgress = (lessonId: string) => progress.find(p => p.lessonId === lessonId);
  const isCompleted = (lessonId: string) => progress.some(p => p.lessonId === lessonId && p.completed);

  const isUnlocked = (index: number) => {
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
              <div
                key={lesson.id}
                onClick={() => unlocked && navigate(`/lessons/${lesson.id}/play`)}
                className={`bg-white rounded-xl border p-5 transition-all ${
                  unlocked
                    ? 'border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm group'
                    : 'border-gray-100 opacity-60 cursor-default'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      completed
                        ? 'bg-green-500'
                        : isCurrent
                          ? 'bg-yellow-400'
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
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                      {lessonProgress.score}%
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600">
                      Start
                    </span>
                  )}
                  {!unlocked && (
                    <span className="text-xs text-gray-400">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
