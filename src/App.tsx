import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Send,
  Printer,
  Table,
  Calendar as CalendarIcon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  GraduationCap,
  ChevronRight,
  Database,
} from 'lucide-react';
import logoImage from './components/fullogo.jpg';

const campusBackgroundImage =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80';
import {
  Staff,
  Course,
  Exam,
  Venue,
  ExamVenue,
  EnrichedAllocation,
  GenerationReport,
  AppUser,
} from './types';
import { api } from './services/api';

// Components
import { Navbar, TabType } from './components/Navbar';
import { RosterTable } from './components/RosterTable';
import { RosterCalendar } from './components/RosterCalendar';
import { PrintableRoster } from './components/PrintableRoster';
import { WorkloadDashboard } from './components/WorkloadDashboard';
import { StaffManagement } from './components/StaffManagement';
import { CourseManagement } from './components/CourseManagement';
import { VenueManagement } from './components/VenueManagement';
import { ExamManagement } from './components/ExamManagement';
import { NotificationCenter } from './components/NotificationCenter';
import { TechStackModal } from './components/TechStackModal';
import { StaffPortal } from './components/StaffPortal';

// Modals
import { SwapStaffModal } from './components/SwapStaffModal';
import { GenerationReportModal } from './components/GenerationReportModal';
import { NotificationModal } from './components/NotificationModal';
import professorPhoto from './components/profmale.jpg';
import drFatimaPhoto from './components/femalelecturer.jpg';

const getStaffPhoto = (name: string, fallback?: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('fatima') || normalized.includes('zahra') || normalized.includes('dr.')) {
    return drFatimaPhoto;
  }
  return fallback || professorPhoto;
};

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('ful_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    if (localStorage.getItem('ful_admin_auth') === 'true') {
      return {
        id: 'admin-1',
        name: 'Prof. A. S. Mallam',
        email: 'exam.officer@fulokoja.edu.ng',
        role: 'Exam Officer',
        rank: 'Dean / Chief Examination Officer',
        department: 'Senate Examination Committee',
      };
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ful_admin_auth') === 'true';
  });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('roster');
  const [rosterViewMode, setRosterViewMode] = useState<'table' | 'calendar' | 'print'>('table');

  // Master Data State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [examVenues, setExamVenues] = useState<ExamVenue[]>([]);
  const [allocations, setAllocations] = useState<EnrichedAllocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modal States
  const [swapTargetAllocation, setSwapTargetAllocation] = useState<EnrichedAllocation | null>(null);
  const [generationReport, setGenerationReport] = useState<GenerationReport | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // Load all system data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [staffData, coursesData, examsData, venuesData, examVenuesData, allocationsData] =
        await Promise.all([
          api.getStaff(),
          api.getCourses(),
          api.getExams(),
          api.getVenues(),
          api.getExamVenues(),
          api.getAllocations(),
        ]);

      setStaffList(Array.isArray(staffData) ? staffData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setExams(Array.isArray(examsData) ? examsData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setExamVenues(Array.isArray(examVenuesData) ? examVenuesData : []);
      setAllocations(Array.isArray(allocationsData) ? allocationsData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Switch to Examination Officer role
  const switchToOfficer = () => {
    const officerUser: AppUser = {
      id: 'admin-1',
      name: 'Prof. A. S. Mallam',
      email: 'exam.officer@fulokoja.edu.ng',
      role: 'Exam Officer',
      rank: 'Dean / Chief Examination Officer',
      department: 'Senate Examination Committee',
      photoUrl: professorPhoto,
    };
    setCurrentUser(officerUser);
    localStorage.setItem('ful_user_session', JSON.stringify(officerUser));
    localStorage.setItem('ful_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  // Switch to Staff Invigilator role
  const switchToStaff = (staff?: Staff) => {
    const targetStaff =
      staff ||
      staffList.find((s) => s.id === 'staff-2') ||
      staffList[0] || {
        id: 'staff-2',
        name: 'Dr. Fatima Zahra Bello',
        email: 'fatima.bello@fulokoja.edu.ng',
        rank: 'Senior Lecturer',
        department: 'Computer Science',
      };

    const staffPhoto = getStaffPhoto(targetStaff.name, targetStaff.photoUrl || drFatimaPhoto);
    const staffUser: AppUser = {
      id: targetStaff.id,
      name: targetStaff.name,
      email: targetStaff.email,
      role: 'Invigilator',
      department: targetStaff.department,
      rank: targetStaff.rank,
      staffId: targetStaff.id,
      staffData: { ...targetStaff, photoUrl: staffPhoto } as Staff,
      photoUrl: staffPhoto,
    };
    setCurrentUser(staffUser);
    localStorage.setItem('ful_user_session', JSON.stringify(staffUser));
    localStorage.setItem('ful_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success && res.user) {
        const authenticatedUser: AppUser = {
          ...res.user,
          photoUrl:
            res.user.role === 'Invigilator'
              ? getStaffPhoto(res.user.name || 'Dr. Fatima Bello', drFatimaPhoto)
              : professorPhoto,
        };
        setCurrentUser(authenticatedUser);
        localStorage.setItem('ful_user_session', JSON.stringify(authenticatedUser));
        localStorage.setItem('ful_admin_auth', 'true');
        setIsAuthenticated(true);
      } else {
        setLoginError(res.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Unable to communicate with authentication service.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleInstantStaffLogin = (staff: Staff) => {
    switchToStaff(staff);
  };

  const handleLogout = () => {
    localStorage.removeItem('ful_admin_auth');
    localStorage.removeItem('ful_user_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Allocation Handlers
  const handleRunEngine = async () => {
    setActionLoading(true);
    try {
      const result = await api.generateAllocations();
      if (result && (result as any).report) {
        setGenerationReport((result as any).report);
      } else if (result) {
        setGenerationReport(result as any);
      }
      await loadAllData();
    } catch (err) {
      alert('Error running allocation engine.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveAllocation(id);
      await loadAllData();
    } catch (err) {
      alert('Failed to approve allocation.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectAllocation(id);
      await loadAllData();
    } catch (err) {
      alert('Failed to reject allocation.');
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    if (confirm('Are you sure you want to remove this invigilator allocation record?')) {
      try {
        await api.deleteAllocation(id);
        await loadAllData();
      } catch (err) {
        alert('Failed to delete allocation.');
      }
    }
  };

  const handleBulkApprove = async (ids?: string[]) => {
    try {
      const res = await api.bulkApprove(ids);
      alert(`Successfully approved ${res.approvedCount} invigilator assignment(s).`);
      await loadAllData();
    } catch (err) {
      alert('Failed to bulk approve.');
    }
  };

  const handleToggleRole = async (alloc: EnrichedAllocation) => {
    const nextRole = alloc.role === 'chief' ? 'assistant' : 'chief';
    try {
      await api.updateAllocation(alloc.id, {
        role: nextRole,
        status: 'edited',
        notes: `Role changed to ${nextRole} by admin`,
      });
      await loadAllData();
    } catch (err) {
      alert('Failed to toggle role.');
    }
  };

  const handleResetDemoData = async () => {
    if (
      confirm(
        'Reset all data back to the default Federal University Lokoja sample dataset? Any unsaved edits will be refreshed.'
      )
    ) {
      setActionLoading(true);
      try {
        await api.resetData();
        await loadAllData();
        alert('Database restored to default FUL semester exam timetable and staff pool.');
      } catch (err) {
        alert('Failed to reset dataset.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Unauthenticated Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.68), rgba(15, 23, 42, 0.68)), url(${campusBackgroundImage})`,
          }}
        />
        <div className="absolute inset-0 bg-slate-950/65" />

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-sm">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
              <img
                src={logoImage}
                alt="Federal University Lokoja logo"
                className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-cover shadow-sm"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900">Federal University Lokoja</h1>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Examination Directorate
                </p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-700">Invigilation Portal</p>
              <p className="mt-1 text-xs text-slate-500">
                Sign in to view your allocation and duty schedule.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Staff ID or institutional email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. exam.officer@fulokoja.edu.ng"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d4b8f] focus:ring-2 focus:ring-[#0d4b8f]/10"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-[#0d4b8f] hover:text-[#0b3f7a]"
                  >
                    Forgot Password
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0d4b8f] focus:ring-2 focus:ring-[#0d4b8f]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0d4b8f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3f7a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{loginSubmitting ? 'Signing in...' : 'Sign In'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Summary Metrics for Active Roster
  const safeAllocations = Array.isArray(allocations) ? allocations : [];
  const pendingSuggestedCount = safeAllocations.filter((a) => a.status === 'suggested').length;
  const approvedCount = safeAllocations.filter((a) => a.status === 'approved').length;
  const editedCount = safeAllocations.filter((a) => a.status === 'edited').length;
  const activeSession = '2025/2026 Second Semester';
  const totalUpcomingExams = exams.filter((exam) => new Date(exam.date) >= new Date()).length;
  const assignedStaff = new Set(
    safeAllocations.filter((a) => a.status !== 'rejected').map((a) => a.staff_id)
  ).size;
  const unresolvedConflicts = safeAllocations.filter(
    (a) => a.status === 'suggested' || a.status === 'edited'
  ).length;
  const unassignedDuties = Math.max(0, 7 + (pendingSuggestedCount > 0 ? pendingSuggestedCount : 0) - approvedCount);

  const isInvigilatorRole = currentUser?.role === 'Invigilator';

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'roster' && rosterViewMode === 'print') {
            setRosterViewMode('table');
          }
        }}
        currentUser={
          currentUser
            ? {
                name: currentUser.name,
                role: currentUser.role,
                photoUrl: currentUser.photoUrl,
              }
            : {
                name: 'Prof. A. S. Mallam',
                role: 'Exam Officer',
                photoUrl: professorPhoto,
              }
        }
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {!isInvigilatorRole && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Session overview</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">{activeSession}</h2>
              </div>
              <button
                type="button"
                onClick={handleRunEngine}
                className="inline-flex items-center justify-center rounded-md bg-[#0d4b8f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0b3f7a] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Run Allocation'}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Upcoming exams</div>
                <div className="mt-3 text-3xl font-bold text-slate-900">{totalUpcomingExams}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Invigilators assigned</div>
                <div className="mt-3 text-3xl font-bold text-slate-900">{assignedStaff}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Unresolved conflicts</div>
                <div className="mt-3 text-3xl font-bold text-slate-900">{unresolvedConflicts}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Unassigned duties</div>
                <div className="mt-3 text-3xl font-bold text-slate-900">{unassignedDuties}</div>
              </div>
            </div>
          </section>
        )}

        {/* If user is an Invigilator, display the StaffPortal */}
        {isInvigilatorRole && currentUser ? (
          <StaffPortal
            currentUser={currentUser}
            staffList={staffList}
            courses={courses}
            allocations={safeAllocations}
            onLogout={handleLogout}
            onSwitchToAdmin={switchToOfficer}
            onRefreshData={loadAllData}
            onSelectOtherStaff={(staff) => switchToStaff(staff)}
          />
        ) : (
          <>
            {/* Quick Action Topbar (Only visible on roster tab when not printing) */}
            {activeTab === 'roster' && rosterViewMode !== 'print' && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Examination Duty Roster
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#eaf2ff] text-[#0d4b8f] border border-[#bfd1f2] whitespace-nowrap">
                      2025/2026 Second Semester
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Review automated invigilator suggestions, resolve conflicts, edit assignments, and sign off before dispatching notices.
                  </p>
                </div>

                {/* View Switcher & Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Table vs Calendar Toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setRosterViewMode('table')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                        rosterViewMode === 'table'
                          ? 'bg-white text-[#0d4b8f] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table View</span>
                    </button>
                    <button
                      onClick={() => setRosterViewMode('calendar')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                        rosterViewMode === 'calendar'
                          ? 'bg-white text-[#0d4b8f] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Calendar View</span>
                    </button>
                  </div>

                  {/* Print View Button */}
                  <button
                    onClick={() => setRosterViewMode('print')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Master Roster</span>
                  </button>
                </div>
              </div>
            )}

        {/* Tab 1: Interactive Roster (Table, Calendar, or Print view) */}
        {activeTab === 'roster' && (
          <div>
            {rosterViewMode === 'print' ? (
              <PrintableRoster
                allocations={allocations}
                onBack={() => setRosterViewMode('table')}
              />
            ) : rosterViewMode === 'calendar' ? (
              <RosterCalendar
                allocations={allocations}
                onOpenSwapModal={(alloc) => setSwapTargetAllocation(alloc)}
                onApprove={handleApprove}
              />
            ) : (
              <RosterTable
                allocations={allocations}
                allStaff={staffList}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDeleteAllocation}
                onBulkApprove={handleBulkApprove}
                onOpenSwapModal={(alloc) => setSwapTargetAllocation(alloc)}
                onToggleRole={handleToggleRole}
              />
            )}
          </div>
        )}

        {/* Tab 2: Workload & Fairness Index */}
        {activeTab === 'workload' && <WorkloadDashboard allocations={allocations} />}

        {/* Tab 3: Staff Management */}
        {activeTab === 'staff' && (
          <StaffManagement staffList={staffList} onRefresh={loadAllData} />
        )}

        {/* Tab 4: Course Management */}
        {activeTab === 'courses' && (
          <CourseManagement
            courses={courses}
            staffList={staffList}
            onRefresh={loadAllData}
          />
        )}

        {/* Tab 5: Venue Management */}
        {activeTab === 'venues' && (
          <VenueManagement venues={venues} onRefresh={loadAllData} />
        )}

        {/* Tab 6: Exam Management */}
        {activeTab === 'exams' && (
          <ExamManagement
            exams={exams}
            courses={courses}
            venues={venues}
            examVenues={examVenues}
            onRefresh={loadAllData}
          />
        )}

        {/* Tab 7: Notification Center */}
        {activeTab === 'notifications' && (
          <NotificationCenter onOpenDispatchModal={() => setShowNotificationModal(true)} />
        )}

        {/* Tab 8: Tech Stack & Documentation */}
        {(activeTab === 'architecture' as any || activeTab === ('tech_stack' as any)) && (
          <TechStackModal />
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
          <div>
            <strong className="text-slate-700">Federal University Lokoja</strong> • Examination Directorate
          </div>
          <div>{activeSession}</div>
        </div>
      </footer>

      {/* Modals */}
      {swapTargetAllocation && (
        <SwapStaffModal
          allocation={swapTargetAllocation}
          allStaff={staffList}
          staffList={staffList}
          onClose={() => setSwapTargetAllocation(null)}
          onSave={() => {
            setSwapTargetAllocation(null);
            loadAllData();
          }}
          onSuccess={() => {
            setSwapTargetAllocation(null);
            loadAllData();
          }}
        />
      )}

      {generationReport && (
        <GenerationReportModal
          report={generationReport}
          onClose={() => setGenerationReport(null)}
          onViewRoster={() => {
            setGenerationReport(null);
            setActiveTab('roster');
          }}
        />
      )}

      {showNotificationModal && (
        <NotificationModal
          approvedCount={approvedCount}
          allocations={allocations}
          onClose={() => setShowNotificationModal(false)}
          onSuccess={() => {
            loadAllData();
          }}
        />
      )}
    </div>
  );
}
