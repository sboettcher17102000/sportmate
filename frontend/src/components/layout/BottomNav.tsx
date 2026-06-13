import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/my-events', label: 'Meine Events', icon: '📅' },
  { to: '/events/create', label: 'Erstellen', icon: '➕', highlight: true },
  { to: '/friends', label: 'Freunde', icon: '👥' },
  { to: '/profile', label: 'Profil', icon: '👤' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {tab.highlight ? (
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-lg -mt-4 shadow-md">
                {tab.icon}
              </span>
            ) : (
              <span className="text-xl">{tab.icon}</span>
            )}
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
