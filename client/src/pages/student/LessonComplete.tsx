import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';

export default function LessonComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, correct = 0, passThreshold = 80 } =
    (location.state as { score: number; total: number; correct: number; passThreshold: number }) || {};

  const passed = score >= passThreshold;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-b from-white to-gray-50">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-yellow-400' : 'bg-gray-300'}`}>
          {passed ? <Trophy className="w-16 h-16 text-white" /> : <Star className="w-16 h-16 text-gray-500" />}
        </div>
      </motion.div>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {passed ? 'Lesson Complete!' : 'Keep Practicing!'}
      </h1>
      <p className="text-gray-500 mb-6">{correct} out of {total} correct</p>

      <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#22c55e' : '#ef4444' }}>
        {score}%
      </div>
      <p className="text-gray-400 mb-8">{passed ? 'Great job!' : `You need ${passThreshold}% to pass`}</p>

      <div className="flex gap-4">
        <button onClick={() => navigate('/')} className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-300">
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
