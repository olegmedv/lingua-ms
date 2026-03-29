import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import ProgressBar from '../../components/ProgressBar';
import MultipleChoice from '../../components/exercises/MultipleChoice';
import ListenAndSelect from '../../components/exercises/ListenAndSelect';
import ListenAndType from '../../components/exercises/ListenAndType';
import MatchPairs from '../../components/exercises/MatchPairs';
import ImageSelect from '../../components/exercises/ImageSelect';
import WordBank from '../../components/exercises/WordBank';
import FillInBlank from '../../components/exercises/FillInBlank';
import Flashcard from '../../components/exercises/Flashcard';
import { X, CheckCircle, XCircle } from 'lucide-react';
import type { Exercise, Lesson } from '../../types/api';

interface Feedback {
  correct: boolean;
  correctAnswer?: string;
}

export default function ExercisePlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { langId?: string; demo?: boolean } | null;
  const langId = state?.langId;
  const isDemo = state?.demo === true;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    api.get<Exercise[]>(API.lessons.exercises(lessonId!)).then(setExercises).catch(() => {});
    api.get<Lesson>(API.lessons.byId(lessonId!)).then(setLesson).catch(() => {});
  }, [lessonId]);

  const isFlashcard = exercises[current]?.type === 7;

  const handleAnswer = useCallback((correct: boolean, correctAnswer?: string) => {
    if (feedback) return;
    if (!isFlashcard && correct) setCorrectCount(c => c + 1);
    setFeedback({ correct, correctAnswer });
  }, [feedback, isFlashcard]);

  const handleContinue = () => {
    setFeedback(null);
    if (current + 1 >= exercises.length) {
      const finalCorrect = correctCount;
      const scoredExercises = exercises.filter(e => e.type !== 7);
      const totalScored = scoredExercises.length;
      const score = totalScored > 0 ? Math.round((finalCorrect / totalScored) * 100) : 100;
      const passThreshold = lesson?.passThreshold ?? 80;
      const completeState = { score, total: totalScored, correct: finalCorrect, passThreshold, langId, demo: isDemo };
      if (isDemo) {
        navigate(`/demo/lessons/${lessonId}/complete`, { state: completeState });
      } else {
        api.post(API.progress.submit, { lessonId, score }).then(() => {
          navigate(`/lessons/${lessonId}/complete`, { state: completeState });
        });
      }
    } else {
      setCurrent(c => c + 1);
    }
  };

  if (exercises.length === 0)
    return <div className="fixed inset-0 flex items-center justify-center bg-white text-gray-400 z-100">Loading...</div>;

  const ex = exercises[current];

  const data = JSON.parse(ex.contentJson);

  const renderExercise = () => {
    switch (ex.type) {
      case 0: return <MultipleChoice data={data} onAnswer={handleAnswer} />;
      case 1: return <ListenAndSelect data={data} audioUrl={ex.audioUrl ?? undefined} onAnswer={handleAnswer} />;
      case 2: return <ListenAndType data={data} audioUrl={ex.audioUrl ?? undefined} onAnswer={handleAnswer} />;
      case 3: return <MatchPairs data={data} onAnswer={handleAnswer} />;
      case 4: return <ImageSelect data={data} onAnswer={handleAnswer} />;
      case 5: return <WordBank data={data} onAnswer={handleAnswer} />;
      case 6: return <FillInBlank data={data} onAnswer={handleAnswer} />;
      case 7: return <Flashcard data={data} audioUrl={ex.audioUrl ?? undefined} onAnswer={handleAnswer} />;
      default: return <p>Unknown exercise type</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-100">
      {/* Header */}
      <div className="shrink-0 p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <ProgressBar current={current + 1} total={exercises.length} />
        </div>
        <span className="text-sm text-gray-500">{current + 1}/{exercises.length}</span>
      </div>

      {/* Exercise content — scrollable */}
      <div className="flex-1 overflow-y-auto" key={ex.id}>
        {renderExercise()}
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`shrink-0 p-5 ${
              feedback.correct
                ? 'bg-success-light border-t-2 border-success'
                : 'bg-error-light border-t-2 border-error'
            }`}
          >
            <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {feedback.correct ? (
                  <CheckCircle className="w-8 h-8 text-success shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-error shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`font-bold text-lg ${feedback.correct ? 'text-success' : 'text-error'}`}>
                    {feedback.correct ? 'Correct!' : 'Incorrect'}
                  </p>
                  {!feedback.correct && feedback.correctAnswer && (
                    <p className="text-error text-sm truncate">
                      Correct answer: <span className="font-semibold">{feedback.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleContinue}
                className={`font-bold py-2.5 px-6 rounded-xl text-white shrink-0 ${
                  feedback.correct
                    ? 'bg-brand hover:bg-brand-light'
                    : 'bg-error hover:bg-error/80'
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
