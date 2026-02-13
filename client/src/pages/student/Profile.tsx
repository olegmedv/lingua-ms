import { useEffect, useState } from 'react';
import { useAuth } from '../../store/auth';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { LogOut, Flame, Trophy, BookOpen } from 'lucide-react';

interface Stats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  completedLessons: number;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/api/progress/stats').then(setStats).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white font-bold">{user?.displayName?.[0]?.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">{user?.displayName}</h1>
          <p className="text-center text-gray-500">{user?.email}</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.totalXp}</p>
              <p className="text-sm text-gray-500">Total XP</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.currentStreak}</p>
              <p className="text-sm text-gray-500">Day Streak</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <Flame className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.longestStreak}</p>
              <p className="text-sm text-gray-500">Best Streak</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.completedLessons}</p>
              <p className="text-sm text-gray-500">Lessons Done</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Log Out
        </button>
      </div>
    </div>
  );
}
