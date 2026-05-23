import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WordItem {
  id: string;
  label: string;
}

export default function SortableWord({ item, onClick }: { item: WordItem; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, touchAction: 'none' as const };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white border-2 border-gray-300 rounded-xl px-4 py-2 text-lg font-semibold cursor-grab active:cursor-grabbing select-none shadow-sm hover:border-gray-400 transition-colors"
    >
      {item.label}
    </div>
  );
}
