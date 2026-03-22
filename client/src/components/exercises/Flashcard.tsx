import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

interface Props {
  data: { front: string; back: string; instruction?: string };
  audioUrl?: string;
  onAnswer: (correct: boolean) => void;
}

export default function Flashcard({ data, audioUrl, onAnswer }: Props) {
  const [flipped, setFlipped] = useState(false);
  const revealed = useRef(false);
  const { play, isPlaying } = useAudio(audioUrl);

  const handleFlip = () => {
    const willFlip = !flipped;
    setFlipped(willFlip);
    if (willFlip && !revealed.current) {
      revealed.current = true;
      play();
      onAnswer(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <p className="text-gray-500">{data.instruction ?? "Tap to reveal"}</p>
      <motion.div
        onClick={handleFlip}
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
      {audioUrl && (
        <button
          onClick={(e) => { e.stopPropagation(); play(); }}
          disabled={isPlaying}
          className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Volume2 className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}
