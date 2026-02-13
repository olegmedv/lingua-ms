import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  data: { prompt: string; correctOrder: string[]; distractorWords: string[] };
  onAnswer: (correct: boolean) => void;
}

function SortableWord({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-white border-2 border-gray-300 rounded-xl px-4 py-2 text-lg font-semibold cursor-grab active:cursor-grabbing select-none">
      {id}
    </div>
  );
}

export default function WordBank({ data, onAnswer }: Props) {
  const allWords = [...data.correctOrder, ...data.distractorWords].sort(() => Math.random() - 0.5);
  const [words, setWords] = useState(allWords);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = words.indexOf(active.id as string);
      const newIdx = words.indexOf(over.id as string);
      setWords(arrayMove(words, oldIdx, newIdx));
    }
  };

  const handleCheck = () => {
    const answer = words.slice(0, data.correctOrder.length);
    const correct = answer.every((w, i) => w === data.correctOrder[i]);
    onAnswer(correct);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <p className="text-lg text-gray-600">{data.prompt}</p>
      <p className="text-gray-500">Arrange the words in order</p>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={words} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 justify-center min-h-16 p-4 bg-gray-100 rounded-xl w-full max-w-md">
            {words.map(w => <SortableWord key={w} id={w} />)}
          </div>
        </SortableContext>
      </DndContext>
      <button onClick={handleCheck} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl text-lg">
        Check
      </button>
    </div>
  );
}
