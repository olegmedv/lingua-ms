import { useState } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';

interface Props {
  data: { word: string; correctImageUrl: string; distractorImages: string[]; instruction?: string; correctAnswer?: string };
  onAnswer: (correct: boolean, correctAnswer?: string) => void;
}

export default function ImageSelect({ data, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [images] = useState(
    () => [data.correctImageUrl, ...data.distractorImages].sort(() => Math.random() - 0.5)
  );

  const handleSelect = (img: string) => {
    if (selected) return;
    setSelected(img);
    onAnswer(img === data.correctImageUrl, data.correctAnswer);
  };

  const imgSrc = (url: string) => url.startsWith('http') ? url : `${API_URL}${url}`;

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-3xl font-bold text-gray-800">{data.word}</h2>
      <p className="text-gray-500">{data.instruction ?? "Select the correct image"}</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {images.map(img => {
          const isCorrect = img === data.correctImageUrl;
          const isSelected = img === selected;
          let border = 'border-2 border-gray-200';
          if (selected) {
            if (isSelected && isCorrect) border = 'border-4 border-success';
            else if (isSelected) border = 'border-4 border-error';
            else if (isCorrect) border = 'border-4 border-success';
          }
          return (
            <motion.button
              key={img}
              onClick={() => handleSelect(img)}
              animate={isSelected && !isCorrect ? { x: [0, -5, 5, -5, 0] } : {}}
              className={`rounded-xl overflow-hidden ${border}`}
            >
              <img src={imgSrc(img)} alt="" className="w-full h-32 object-cover" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
