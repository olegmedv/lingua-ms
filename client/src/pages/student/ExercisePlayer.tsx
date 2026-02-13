import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import ProgressBar from '../../components/ProgressBar';
import MultipleChoice from '../../components/exercises/MultipleChoice';
import ListenAndSelect from '../../components/exercises/ListenAndSelect';
import ListenAndType from '../../components/exercises/ListenAndType';
import MatchPairs from '../../components/exercises/MatchPairs';
import ImageSelect from '../../components/exercises/ImageSelect';
import WordBank from '../../components/exercises/WordBank';
import FillInBlank from '../../components/exercises/FillInBlank';
import Flashcard from '../../components/exercises/Flashcard';
import { X } from 'lucide-react';

interface Exercise {
  id: string;
  type: number;
  contentJson: string;
  audioUrl: string | null;
  order: number;
}

export default function ExercisePlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    api.get<Exercise[]>(`/api/lessons/${lessonId}/exercises`).then(setExercises).catch(() => {});
  }, [lessonId]);

  const handleAnswer = (correct: boolean) => {
    if (correct) setCorrectCount(c => c + 1);
    if (current + 1 >= exercises.length) {
      const score = Math.round(((correctCount + (correct ? 1 : 0)) / exercises.length) * 100);
      api.post('/api/progress/submit', { lessonId, score }).then(() => {
        navigate(`/lessons/${lessonId}/complete`, { state: { score, total: exercises.length, correct: correctCount + (correct ? 1 : 0) } });
      });
    } else {
      setCurrent(c => c + 1);
    }
  };

  if (exercises.length === 0) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;

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
      case 7: return <Flashcard data={data} onAnswer={handleAnswer} />;
      default: return <p>Unknown exercise type</p>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <ProgressBar current={current + 1} total={exercises.length} />
        </div>
        <span className="text-sm text-gray-500">{current + 1}/{exercises.length}</span>
      </div>
      <div key={ex.id}>{renderExercise()}</div>
    </div>
  );
}
