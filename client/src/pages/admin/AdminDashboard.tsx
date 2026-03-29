import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const adminCards = [
  {
    to: '/admin/languages',
    icon: Globe,
    color: 'text-brand',
    bg: 'bg-brand/10',
    title: 'Languages',
    description: 'Manage languages, lessons, and exercises',
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminCards.map(card => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{card.title}</h2>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
