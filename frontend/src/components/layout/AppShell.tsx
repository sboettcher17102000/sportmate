import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function AppShell({ children, title, subtitle, action }: AppShellProps) {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-purple-700 to-blue-600 text-white px-4 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight">SportMate</h1>
            <p className="text-xs text-purple-200">Dein Hochschulsport-Begleiter</p>
          </div>
          {action}
        </div>
        {title && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-purple-200 mt-0.5">{subtitle}</p>}
          </div>
        )}
      </header>
      <main className="flex-1 pb-20 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
