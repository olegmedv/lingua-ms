import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { Flame, Trophy } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
}

interface Stats {
  totalXp: number;
  currentStreak: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Language[]>('/api/languages').then(setLanguages).catch(() => {});
    api.get<Stats>('/api/progress/stats').then(setStats).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hello, {user?.displayName}!</h1>
          <p className="text-gray-500">Ready to learn?</p>
        </div>
        <div className="flex gap-3">
          {stats && (
            <>
              <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4" /> {stats.currentStreak}
              </div>
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4" /> {stats.totalXp}
              </div>
            </>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">Languages</h2>

      {languages.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No languages available yet.</p>
      ) : (
        <div className="grid gap-4">
          {languages.map(lang => (
            <Link
              key={lang.id}
              to={`/languages/${lang.id}`}
              className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              {lang.imageUrl ? (
                <img src={lang.imageUrl} alt={lang.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">{lang.name[0]}</span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-800">{lang.name}</h3>
                <p className="text-sm text-gray-500">{lang.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
