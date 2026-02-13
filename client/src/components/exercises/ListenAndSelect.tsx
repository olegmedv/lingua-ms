import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { API_URL } from '../../config';

interface Props {
  data: { correctText: string; distractors: string[] };
  audioUrl?: string;
  onAnswer: (correct: boolean) => void;
}

export default function ListenAndSelect({ data, audioUrl, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = [data.correctText, ...data.distractors].sort(() => Math.random() - 0.5);

  const playAudio = () => {
    if (audioUrl) new Audio(`${API_URL}${audioUrl}`).play();
  };

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    setTimeout(() => onAnswer(opt === data.correctText), 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <button onClick={playAudio} className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
        <Volume2 className="w-12 h-12" />
      </button>
      <p className="text-gray-500">What did you hear?</p>
      <div className="grid gap-3 w-full max-w-md">
        {options.map(opt => {
          const isCorrect = opt === data.correctText;
          const isSelected = opt === selected;
          let bg = 'bg-white border-2 border-gray-200 hover:border-blue-400';
          if (selected) {
            if (isSelected && isCorrect) bg = 'bg-green-500 text-white border-2 border-green-500';
            else if (isSelected) bg = 'bg-red-500 text-white border-2 border-red-500';
            else if (isCorrect) bg = 'bg-green-100 border-2 border-green-400';
            else bg = 'bg-white border-2 border-gray-200 opacity-50';
          }
          return (
            <motion.button
              key={opt}
              onClick={() => handleSelect(opt)}
              animate={isSelected && !isCorrect ? { x: [0, -10, 10, -10, 0] } : {}}
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
