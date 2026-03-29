import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';

export default function LessonComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, correct = 0, passThreshold = 80, langId, demo } =
    (location.state as { score: number; total: number; correct: number; passThreshold: number; langId?: string; demo?: boolean }) || {};

  const passed = demo || score >= passThreshold;

  const handleHome = () => {
    if (demo) {
      navigate('/demo');
    } else {
      navigate(langId ? `/languages/${langId}` : '/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className={`text-6xl font-bold mb-2 ${passed ? 'text-brand' : 'text-error'}`}>
        {score}%
      </div>

      <p className="text-gray-500 mb-6">{correct} / {total} correct</p>

      {!passed && (
        <p className="text-gray-400 mb-8">You need {passThreshold}% to pass</p>
      )}

      <div className="flex gap-4">
        <Button variant="ghost" onClick={handleHome} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
          {demo ? 'Back to Demo' : 'Home'}
        </Button>
        {!passed && (
          <Button onClick={() => navigate(-1)}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
