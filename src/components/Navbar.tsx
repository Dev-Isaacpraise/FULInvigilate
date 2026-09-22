import React from 'react';
import { Calendar, Users, BookOpen, BarChart3, LogOut } from 'lucide-react';
import logoImage from '../components/fullogo.jpg';

export type TabType =
  | 'roster'
  | 'staff'
  | 'courses'
  | 'venues'
  | 'exams'
  | 'workload'
  | 'notifications';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: { name: string; role: string; photoUrl?: string } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) => {
  const navItems =
    currentUser?.role === 'Invigilator'
      ? []
      : [
          { id: 'roster', label: 'Dashboard', icon: Calendar },
          { id: 'exams', label: 'Examinations', icon: BookOpen },
          { id: 'staff', label: 'Staff', icon: Users },
          { id: 'notifications', label: 'Reports', icon: BarChart3 },
        ];

  const initials = currentUser?.name
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'FUL';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="Federal University Lokoja logo"
              className="h-10 w-10 rounded-md border border-slate-200 bg-white object-cover shadow-sm"
            />
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900">
                Federal University Lokoja
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Examination Directorate
              </div>
            </div>
          </div>

          {navItems.length > 0 && (
            <nav className="flex min-w-0 flex-1 items-center justify-center xl:justify-center">
              <div className="flex w-full max-w-[520px] items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={`${id}-${label}`}
                    type="button"
                    onClick={() => setActiveTab(id as TabType)}
                    className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 text-[11px] font-semibold transition-all ${
                      activeTab === id || (label === 'Dashboard' && activeTab === 'roster')
                        ? 'bg-[#0d4b8f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">{label}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}

          <div className="flex items-center justify-between gap-2 xl:justify-end">
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
              {currentUser?.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d4b8f] text-[10px] font-bold text-blue-100">
                  {currentUser?.name?.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'FUL'}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <div className="text-[11px] font-semibold text-slate-900">{currentUser?.name || 'User'}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
