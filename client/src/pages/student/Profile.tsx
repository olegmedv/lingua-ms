import { useAuth } from '../../store/auth';
import { LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

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

        <button
          onClick={logout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Log Out
        </button>
      </div>
    </div>
  );
}
