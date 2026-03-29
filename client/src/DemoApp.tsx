import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, LogOut } from 'lucide-react';

export default function DemoApp() {
  const location = useLocation();

  const isExercise = location.pathname.includes('/play') || location.pathname.includes('/complete');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      {!isExercise && (
        <div className="bg-brand/10 border-b border-brand/20 px-4 py-2 text-center text-sm">
          <span className="text-brand font-medium">Demo mode</span>
          <span className="text-gray-600"> — </span>
          <Link to="/register" className="text-brand font-semibold hover:underline">Sign up</Link>
          <span className="text-gray-600"> to save your progress</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isExercise && (
        <aside className="hidden md:flex fixed top-[41px] left-0 bottom-0 w-56 bg-white border-r border-gray-200 flex-col z-50">
          <div className="p-5 border-b border-gray-100">
            <Link to="/demo" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">LinguaCMS</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <Link
              to="/demo"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-brand/10 text-brand"
            >
              <Home className="w-5 h-5 text-brand" />
              Demo Course
            </Link>
          </nav>

          <div className="p-3 border-t border-gray-100">
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
              Exit Demo
            </Link>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className={isExercise ? '' : 'pb-16 md:pb-0 md:pl-56'}>
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      {!isExercise && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 z-50">
          <Link to="/demo" className="flex flex-col items-center gap-1 px-3 py-1 text-brand">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Demo</span>
          </Link>
          <Link to="/login" className="flex flex-col items-center gap-1 px-3 py-1 text-gray-400">
            <LogOut className="w-6 h-6" />
            <span className="text-xs font-medium">Exit</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
