import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { API_URL } from '../../config';

interface Props {
  data: { correctText: string };
  audioUrl?: string;
  onAnswer: (correct: boolean) => void;
}

export default function ListenAndType({ data, audioUrl, onAnswer }: Props) {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const playAudio = () => {
    if (audioUrl) new Audio(`${API_URL}${audioUrl}`).play();
  };

  const handleCheck = () => {
    const correct = input.trim().toLowerCase() === data.correctText.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    setTimeout(() => onAnswer(correct), 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <button onClick={playAudio} className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
        <Volume2 className="w-12 h-12" />
      </button>
      <p className="text-gray-500">Type what you hear</p>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={checked}
        className={`w-full max-w-md px-4 py-3 rounded-xl border-2 text-lg text-center ${
          checked ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-300'
        }`}
        placeholder="Type here..."
        onKeyDown={e => e.key === 'Enter' && !checked && handleCheck()}
      />
      {checked && !isCorrect && <p className="text-red-500">Correct: {data.correctText}</p>}
      {!checked && (
        <button onClick={handleCheck} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl text-lg">
          Check
        </button>
      )}
    </div>
  );
}
