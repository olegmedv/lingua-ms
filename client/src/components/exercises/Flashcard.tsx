import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  data: { front: string; back: string; instruction?: string };
  onAnswer: (correct: boolean, correctAnswer?: string) => void;
}

export default function Flashcard({ data, onAnswer }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <p className="text-gray-500">{data.instruction ?? "Tap to reveal"}</p>
      <motion.div
        onClick={() => setFlipped(!flipped)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ perspective: 1000 }}
        className="w-72 h-48 cursor-pointer"
      >
        <div className={`w-full h-full rounded-2xl shadow-lg flex items-center justify-center p-6 ${flipped ? 'bg-green-50' : 'bg-white'}`}
          style={{ backfaceVisibility: 'hidden' }}>
          <p className="text-3xl font-bold text-gray-800 text-center"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}>
            {flipped ? data.back : data.front}
          </p>
        </div>
      </motion.div>
      {flipped && (
        <div className="flex gap-4">
          <button onClick={() => onAnswer(false)} className="bg-red-100 text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-200">
            Didn't know
          </button>
          <button onClick={() => onAnswer(true)} className="bg-green-100 text-green-600 font-bold py-3 px-6 rounded-xl hover:bg-green-200">
            Knew it!
          </button>
        </div>
      )}
    </div>
  );
}
