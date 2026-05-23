import { useState, useMemo } from 'react';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Button } from '../ui';
import SortableWord from './SortableWord';
import BankWord from './BankWord';

interface Props {
  data: { prompt: string; correctOrder: string[]; distractorWords: string[]; instruction?: string };
  onAnswer: (correct: boolean, correctAnswer?: string) => void;
}

interface WordItem {
  id: string;
  label: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordBank({ data, onAnswer }: Props) {
  const allItems = useMemo(() => {
    const items: WordItem[] = [
      ...data.correctOrder.map((w, i) => ({ id: `correct-${i}-${w}`, label: w })),
      ...data.distractorWords.map((w, i) => ({ id: `distractor-${i}-${w}`, label: w })),
    ];
    return shuffle(items);
  }, [data.correctOrder, data.distractorWords]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const [answer, setAnswer] = useState<WordItem[]>([]);
  const [bank, setBank] = useState<WordItem[]>(allItems);

  const addToAnswer = (item: WordItem) => {
    setBank(b => b.filter(w => w.id !== item.id));
    setAnswer(a => [...a, item]);
  };

  const removeFromAnswer = (item: WordItem) => {
    setAnswer(a => a.filter(w => w.id !== item.id));
    setBank(b => [...b, item]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAnswer(prev => {
        const oldIdx = prev.findIndex(w => w.id === active.id);
        const newIdx = prev.findIndex(w => w.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const handleCheck = () => {
    const correct =
      answer.length === data.correctOrder.length &&
      answer.every((w, i) => w.label === data.correctOrder[i]);
    onAnswer(correct, data.correctOrder.join(' '));
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <p className="text-lg text-gray-600">{data.prompt}</p>
      <p className="text-gray-500">{data.instruction ?? "Tap words to build the sentence"}</p>

      {/* Answer zone — sortable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={answer.map(w => w.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 justify-center min-h-[56px] p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl w-full max-w-lg">
            {answer.length === 0 && (
              <span className="text-gray-400 text-sm self-center">Tap words below to place them here</span>
            )}
            {answer.map(item => (
              <SortableWord key={item.id} item={item} onClick={() => removeFromAnswer(item)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center min-h-[56px] p-4 bg-gray-100 rounded-xl w-full max-w-lg">
        {bank.length === 0 && (
          <span className="text-gray-400 text-sm self-center">No words left</span>
        )}
        {bank.map(item => (
          <BankWord key={item.id} item={item} onClick={() => addToAnswer(item)} />
        ))}
      </div>

      <Button onClick={handleCheck} disabled={answer.length === 0}>
        Check
      </Button>
    </div>
  );
}
