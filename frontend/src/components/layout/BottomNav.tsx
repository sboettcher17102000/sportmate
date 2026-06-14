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
    <nav className="tabs-pop fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto flex items-end justify-between px-3 pt-2 pb-5">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 font-display text-[11px] font-bold transition-colors ${
                tab.highlight ? 'gap-2' : ''
              } ${isActive ? 'text-violet' : 'text-ink-2 hover:text-ink'}`
            }
          >
            {tab.highlight ? (
              <span className="fab-pop text-2xl">{tab.icon}</span>
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
