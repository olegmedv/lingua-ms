import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';

export default function LessonComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, correct = 0, passThreshold = 80, langId, demo, xpEarned } =
    (location.state as { score: number; total: number; correct: number; passThreshold: number; langId?: string; demo?: boolean; xpEarned?: number }) || {};

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

      <p className="text-gray-500 mb-2">{correct} / {total} correct</p>

      {!demo && xpEarned != null && xpEarned > 0 && (
        <p className="text-brand font-semibold mb-4">+{xpEarned} XP</p>
      )}

      {!demo && xpEarned === 0 && passed && (
        <p className="text-gray-400 text-sm mb-4">No new XP (already earned max for this lesson)</p>
      )}

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
