import { Trophy } from 'lucide-react';

export default function XpBadge({ xp }: { xp: number }) {
  return (
    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full font-bold">
      <Trophy className="w-4 h-4" /> {xp} XP
    </div>
  );
}
