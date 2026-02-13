import { Flame } from 'lucide-react';

export default function StreakCounter({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">
      <Flame className="w-4 h-4" /> {streak}
    </div>
  );
}
