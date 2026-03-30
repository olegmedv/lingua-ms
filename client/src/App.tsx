import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import { Home, User, Shield, LogOut, BookOpen } from 'lucide-react';

export default function App() {
  const { token, user, isDemo, loadUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!user) loadUser();
  }, [token]);

  if (!token) return null;

  const isAdmin = user?.role === 'Admin';
  const navItems = [
    { to: '/', icon: Home, label: 'Learn' },
    { to: '/profile', icon: User, label: 'Profile' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  const isExercise = location.pathname.includes('/play') || location.pathname.includes('/complete');

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      {isDemo && !isExercise && (
        <div className="bg-brand/10 border-b border-brand/20 px-4 py-2 text-center text-sm">
          <span className="text-brand font-medium">Demo mode</span>
          <span className="text-gray-600"> — nothing is saved. </span>
          <Link to="/register" className="text-brand font-semibold hover:underline">Sign up</Link>
          <span className="text-gray-600"> for full access</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed left-0 bottom-0 w-56 bg-white border-r border-gray-200 flex-col z-50 ${
        isDemo && !isExercise ? 'top-[41px]' : 'top-0'
      }`}>
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">LinguaCMS</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'text-brand' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center shrink-0">
                <span className="text-sm text-white font-bold">{user.displayName?.[0]?.toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
              {isDemo ? 'Exit Demo' : 'Log Out'}
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="pb-20 md:pb-0 md:pl-56">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-50">
        {navItems.map(item => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${active ? 'text-brand' : 'text-gray-400'}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
