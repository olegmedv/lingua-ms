import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { Button } from '../ui';

interface Props {
  data: { correctText: string; instruction?: string };
  audioUrl?: string;
  onAnswer: (correct: boolean, correctAnswer?: string) => void;
}

export default function ListenAndType({ data, audioUrl, onAnswer }: Props) {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const { play, isPlaying } = useAudio(audioUrl);

  const handleCheck = () => {
    if (checked) return;
    const correct = input.trim().toLowerCase() === data.correctText.toLowerCase();
    setChecked(true);
    onAnswer(correct, data.correctText);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <button onClick={play} disabled={isPlaying} className="w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        <Volume2 className="w-12 h-12" />
      </button>
      <p className="text-gray-500">{data.instruction ?? "Type what you hear"}</p>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={checked}
        className={`w-full max-w-md px-4 py-3 rounded-xl border-2 text-lg text-center ${
          checked ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
        }`}
        placeholder="Type here..."
        onKeyDown={e => e.key === 'Enter' && !checked && handleCheck()}
      />
      {!checked && (
        <Button onClick={handleCheck}>
          Check
        </Button>
      )}
    </div>
  );
}
