import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
      <div className="grid gap-4">
        <Link to="/admin/languages" className="bg-white rounded-xl shadow p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <Globe className="w-10 h-10 text-blue-500" />
          <div>
            <h2 className="text-lg font-bold text-gray-800">Languages</h2>
            <p className="text-sm text-gray-500">Manage languages</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
