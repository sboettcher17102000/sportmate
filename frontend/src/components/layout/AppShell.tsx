import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

type Accent = 'violet' | 'teal' | 'coral' | 'sky';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  accent?: Accent;
  noHeader?: boolean;
}

export default function AppShell({ children, title, subtitle, action, accent = 'violet', noHeader = false }: AppShellProps) {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-paper">
      {!noHeader && (
      <header className={`app-header accent-${accent} px-4 pt-10 pb-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-ink">
                <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-lg font-extrabold leading-none">SportMate</h1>
              <p className="text-xs font-bold opacity-90">Dein Hochschulsport-Begleiter</p>
            </div>
          </div>
          {action}
        </div>
        {title && (
          <div className="mt-4">
            <h2 className="font-display text-2xl font-extrabold">{title}</h2>
            {subtitle && <p className="text-sm font-bold opacity-90 mt-0.5">{subtitle}</p>}
          </div>
        )}
      </header>
      )}
      <main className="flex-1 pb-24 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
