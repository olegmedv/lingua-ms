import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { API } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import type { Language } from '../../types/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    api.get<Language[]>(API.languages.list).then(setLanguages).catch(() => {});
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hello, {user?.displayName}!</h1>
        <p className="text-gray-500">Ready to learn?</p>
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
