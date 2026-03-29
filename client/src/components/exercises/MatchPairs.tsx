import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  data: { pairs: { word: string; translation: string }[]; instruction?: string };
  onAnswer: (correct: boolean, correctAnswer?: string) => void;
}

export default function MatchPairs({ data, onAnswer }: Props) {
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const words = data.pairs.map((p, i) => ({ text: p.word, idx: i }));
  const [translations] = useState(() =>
    [...data.pairs.map((p, i) => ({ text: p.translation, idx: i }))].sort(() => Math.random() - 0.5)
  );

  const handleTranslation = (tIdx: number) => {
    if (selectedWord === null || matched.has(tIdx)) return;
    if (selectedWord === tIdx) {
      const newMatched = new Set(matched);
      newMatched.add(tIdx);
      setMatched(newMatched);
      setSelectedWord(null);
      const newCount = correctCount + 1;
      setCorrectCount(newCount);
      if (newCount === data.pairs.length) {
        onAnswer(true);
      }
    } else {
      setWrongPair([selectedWord, tIdx]);
      setTimeout(() => { setWrongPair(null); setSelectedWord(null); }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <p className="text-lg text-gray-600 font-medium">{data.instruction ?? "Match the pairs"}</p>
      <div className="flex gap-8 w-full max-w-md">
        <div className="flex-1 flex flex-col gap-3">
          {words.map(w => (
            <motion.button
              key={`w-${w.idx}`}
              onClick={() => !matched.has(w.idx) && setSelectedWord(w.idx)}
              animate={wrongPair?.[0] === w.idx ? { x: [0, -5, 5, -5, 0] } : {}}
              className={`py-3 px-4 rounded-xl text-lg font-semibold border-2 transition-colors ${
                matched.has(w.idx) ? 'bg-green-100 border-green-400 opacity-50' :
                selectedWord === w.idx ? 'bg-brand text-white border-brand' :
                'bg-white border-gray-200 hover:border-brand'
              }`}
            >
              {w.text}
            </motion.button>
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {translations.map(t => (
            <motion.button
              key={`t-${t.idx}`}
              onClick={() => handleTranslation(t.idx)}
              animate={wrongPair?.[1] === t.idx ? { x: [0, -5, 5, -5, 0] } : {}}
              className={`py-3 px-4 rounded-xl text-lg font-semibold border-2 transition-colors ${
                matched.has(t.idx) ? 'bg-green-100 border-green-400 opacity-50' :
                'bg-white border-gray-200 hover:border-brand'
              }`}
            >
              {t.text}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
