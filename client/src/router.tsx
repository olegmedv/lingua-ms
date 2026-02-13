import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/student/Dashboard';
import LessonTree from './pages/student/LessonTree';
import ExercisePlayer from './pages/student/ExercisePlayer';
import LessonComplete from './pages/student/LessonComplete';
import Profile from './pages/student/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import LanguageManager from './pages/admin/LanguageManager';
import LessonManager from './pages/admin/LessonManager';
import ExerciseBuilder from './pages/admin/ExerciseBuilder';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'languages/:langId', element: <LessonTree /> },
      { path: 'lessons/:lessonId/play', element: <ExercisePlayer /> },
      { path: 'lessons/:lessonId/complete', element: <LessonComplete /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/languages', element: <LanguageManager /> },
      { path: 'admin/languages/:langId/lessons', element: <LessonManager /> },
      { path: 'admin/lessons/:lessonId/exercises', element: <ExerciseBuilder /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]);
