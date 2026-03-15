import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  data: { word: string; correctAnswer: string; distractors: string[] };
  onAnswer: (correct: boolean, correctAnswer?: string) => void;
}

export default function MultipleChoice({ data, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = [data.correctAnswer, ...data.distractors].sort(() => Math.random() - 0.5);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === data.correctAnswer;
    onAnswer(correct, data.correctAnswer);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center">{data.word}</h2>
      <p className="text-gray-500">What does this mean?</p>
      <div className="grid gap-3 w-full max-w-md">
        {options.map(opt => {
          const isCorrect = opt === data.correctAnswer;
          const isSelected = opt === selected;
          let bg = 'bg-white border-2 border-gray-200 hover:border-green-400';
          if (selected) {
            if (isSelected && isCorrect) bg = 'bg-green-500 text-white border-2 border-green-500';
            else if (isSelected && !isCorrect) bg = 'bg-red-500 text-white border-2 border-red-500';
            else if (isCorrect) bg = 'bg-green-100 border-2 border-green-400';
            else bg = 'bg-white border-2 border-gray-200 opacity-50';
          }
          return (
            <motion.button
              key={opt}
              onClick={() => handleSelect(opt)}
              animate={isSelected && !isCorrect ? { x: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`py-4 px-6 rounded-xl text-lg font-semibold transition-colors ${bg}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
