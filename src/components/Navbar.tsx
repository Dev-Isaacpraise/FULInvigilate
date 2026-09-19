import React from 'react';
import {
  Calendar,
  Users,
  BookOpen,
  MapPin,
  Clock,
  BarChart3,
  Bell,
  Code2,
  RotateCcw,
  ShieldCheck,
  LogOut,
  GraduationCap,
  Sparkles,
  Loader2,
} from 'lucide-react';

export type TabType =
  | 'roster'
  | 'staff'
  | 'courses'
  | 'venues'
  | 'exams'
  | 'workload'
  | 'notifications'
  | 'architecture';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onResetDb: () => void;
  currentUser: { name: string; role: string } | null;
  onLogout: () => void;
  pendingSuggestionsCount: number;
  onRunEngine?: () => void;
  actionLoading?: boolean;
  hideBanner?: boolean;
  onSwitchRole?: () => void;
  roleSwitchLabel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetDb,
  currentUser,
  onLogout,
  pendingSuggestionsCount,
  onRunEngine,
  actionLoading,
  hideBanner,
  onSwitchRole,
  roleSwitchLabel,
}) => {
  return (
    <>
      <header className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-40 shadow-md">
        {/* Top institution bar - flexible wrapped layout with proper vertical padding on mobile */}
        <div className="bg-emerald-900/70 border-b border-emerald-800/50 px-4 sm:px-6 py-2 sm:py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
            {/* University branding */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-emerald-200">
              <div className="flex items-center gap-1.5 font-bold tracking-wide text-xs text-white shrink-0">
                <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>FEDERAL UNIVERSITY LOKOJA (FUL)</span>
              </div>
              <span className="hidden sm:inline text-emerald-500">•</span>
              <span className="text-emerald-300 text-[11px] sm:text-xs">Office of the Chief Examination Officer</span>
              <span className="hidden sm:inline text-emerald-500">•</span>
              <span className="bg-emerald-800/90 text-amber-300 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold border border-amber-400/20 whitespace-nowrap">
                2025/2026 Second Semester Exams
              </span>
            </div>

            {/* Actions: Reset Benchmark + Profile with proper padding & separation */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full md:w-auto pt-2 md:pt-0 border-t border-emerald-800/60 md:border-t-0">
              <button
                onClick={onResetDb}
                title="Reset sample data back to standard FUL benchmark"
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-200 hover:text-white bg-emerald-900/90 hover:bg-emerald-800 px-2.5 py-1.5 rounded-md border border-emerald-700/60 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Reset Benchmark Data</span>
              </button>

              {currentUser && (
                <div className="flex items-center gap-2 pl-2.5 sm:pl-3 border-l border-emerald-800/80">
                  <div className="w-6 h-6 rounded-full bg-emerald-800 border border-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-emerald-100 font-semibold leading-tight whitespace-nowrap">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 leading-none">
                      {currentUser.role}
                    </span>
                  </div>

                  {onSwitchRole && (
                    <button
                      onClick={onSwitchRole}
                      title={roleSwitchLabel || 'Switch Role'}
                      className="text-[11px] bg-emerald-800/90 hover:bg-emerald-700 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded transition-colors whitespace-nowrap ml-1 font-medium"
                    >
                      {roleSwitchLabel || 'Switch Role'}
                    </button>
                  )}

                  <button
                    onClick={onLogout}
                    title="Log out"
                    className="text-emerald-300 hover:text-red-300 p-1 transition-colors rounded hover:bg-emerald-900 ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main navigation menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between min-h-[3.25rem] sm:h-14 py-1.5 sm:py-0 gap-3">
            {/* Compact Brand Badge */}
            <div
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
              onClick={() => setActiveTab('roster')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 border border-emerald-500/80 flex items-center justify-center shadow-inner">
                <span className="text-amber-300 font-black text-sm tracking-tighter">FUL</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                  Invigilation Portal
                </span>
                <span className="text-[10px] text-emerald-300 font-normal mt-0.5">
                  Senate Decision Support
                </span>
              </div>
            </div>

            {/* Nav Items & Run Engine */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-full">
              <nav className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => setActiveTab('roster')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'roster'
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="whitespace-nowrap">Roster & Allocation</span>
                  {pendingSuggestionsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-emerald-950 font-bold">
                      {pendingSuggestionsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('staff')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'staff'
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Staff List</span>
                </button>

                <button
                  onClick={() => setActiveTab('courses')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'courses'
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Courses</span>
                </button>

                <button
                  onClick={() => setActiveTab('venues')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'venues'
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Venues</span>
                </button>

                <button
                  onClick={() => setActiveTab('exams')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'exams'
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Exam Timetable</span>
                </button>

                <button
                  onClick={() => setActiveTab('workload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'workload'
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Fairness & Load</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'notifications'
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Duty Slips</span>
                </button>

                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                    activeTab === 'architecture'
                      ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm ring-1 ring-amber-400'
                      : 'text-amber-300 hover:text-white hover:bg-emerald-900/50 border border-amber-500/30'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">SQL & Architecture</span>
                </button>
              </nav>

              {/* Run Allocation Engine CTA */}
              {onRunEngine && (
                <button
                  onClick={onRunEngine}
                  disabled={actionLoading}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
                  )}
                  <span>Run Allocation Engine</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dedicated Header Section / Banner right below main navigation */}
      {!hideBanner && (
        <section className="bg-white border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 md:py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Senate Approved Session
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Federal University Lokoja • Examination Directorate
                  </span>
                </div>
                {/* Responsive font sizing (text-base or text-lg on mobile, up to 2xl on desktop) */}
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-emerald-950 tracking-tight leading-snug">
                  Exam Invigilator Allocation System
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  Senate Automated Engine &amp; Roster Review • Automated conflict-free invigilator scheduling with human-in-the-loop audit controls
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-center pt-1 md:pt-0">
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <span className="whitespace-nowrap">2025/2026 Second Semester</span>
                </div>
                {pendingSuggestionsCount > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 shadow-2xs whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{pendingSuggestionsCount} Pending Suggestions</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
