import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';

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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  useEffect(() => {
    api.get<Lesson[]>(`/api/languages/${langId}/lessons`).then(setLessons).catch(() => {});
    api.get<Progress[]>('/api/progress/my').then(setProgress).catch(() => {});
  }, [langId]);

  const isCompleted = (lessonId: string) => progress.some(p => p.lessonId === lessonId && p.completed);

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    return isCompleted(lessons[index - 1].id);
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lessons</h1>
      <div className="flex flex-col items-center gap-6">
        {lessons.map((lesson, i) => {
          const completed = isCompleted(lesson.id);
          const unlocked = isUnlocked(i);
          const isCurrent = unlocked && !completed;

          return (
            <div key={lesson.id} className="flex flex-col items-center">
              {i > 0 && <div className={`w-1 h-8 -mt-6 mb-2 ${unlocked ? 'bg-green-400' : 'bg-gray-300'}`} />}
              {unlocked ? (
                <Link
                  to={`/lessons/${lesson.id}/play`}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                    completed
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-yellow-400 text-white animate-pulse'
                        : 'bg-blue-500 text-white'
                  }`}
                >
                  {completed ? <CheckCircle className="w-10 h-10" /> : <PlayCircle className="w-10 h-10" />}
                </Link>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <p className={`mt-2 text-sm font-medium ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {lesson.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
