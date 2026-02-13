import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import { Home, User, Shield } from 'lucide-react';

export default function App() {
  const { token, user, loadUser } = useAuth();
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-50">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${active ? 'text-green-500' : 'text-gray-400'}`}
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
