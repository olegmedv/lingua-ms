import { useLocation, useNavigate } from 'react-router-dom';

export default function LessonComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, correct = 0, passThreshold = 80, langId } =
    (location.state as { score: number; total: number; correct: number; passThreshold: number; langId?: string }) || {};

  const passed = score >= passThreshold;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#22c55e' : '#ef4444' }}>
        {score}%
      </div>

      <p className="text-gray-500 mb-6">{correct} / {total} correct</p>

      {!passed && (
        <p className="text-gray-400 mb-8">You need {passThreshold}% to pass</p>
      )}

      <div className="flex gap-4">
        <button onClick={() => navigate(langId ? `/languages/${langId}` : '/')} className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-300">
          Home
        </button>
        {!passed && (
          <button onClick={() => navigate(-1)} className="bg-green-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-600">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
