import { useEffect, useState } from 'react';
import { useAuth } from '../../store/auth';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import { LogOut, Trophy, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui';
import type { Stats } from '../../types/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>(API.progress.stats).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white font-bold">{user?.displayName?.[0]?.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">{user?.displayName}</h1>
          <p className="text-center text-gray-500">{user?.email}</p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <Trophy className="w-6 h-6 text-brand mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.totalXp}</p>
              <p className="text-xs text-gray-500">Total XP</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <CheckCircle className="w-6 h-6 text-brand mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.completedLessons}</p>
              <p className="text-xs text-gray-500">Lessons Done</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <TrendingUp className="w-6 h-6 text-brand mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.completedLessons > 0 ? `${stats.averageScore}%` : '—'}</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </div>
        )}

        <Button variant="danger" fullWidth onClick={logout} className="flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> Log Out
        </Button>
      </div>
    </div>
  );
}
