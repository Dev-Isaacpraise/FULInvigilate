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
  const [loginRole, setLoginRole] = useState<'officer' | 'staff'>('officer');
  const [loginEmail, setLoginEmail] = useState('exam.officer@fulokoja.edu.ng');
  const [loginPassword, setLoginPassword] = useState('ful2026');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [selectedFacultyStaffId, setSelectedFacultyStaffId] = useState('');

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

    const staffUser: AppUser = {
      id: targetStaff.id,
      name: targetStaff.name,
      email: targetStaff.email,
      role: 'Invigilator',
      department: targetStaff.department,
      rank: targetStaff.rank,
      staffId: targetStaff.id,
      staffData: targetStaff as Staff,
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
        setCurrentUser(res.user);
        localStorage.setItem('ful_user_session', JSON.stringify(res.user));
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background ambient decoration */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden relative z-10">
          {/* Header Banner */}
          <div className="bg-emerald-950 text-white p-6 text-center border-b-4 border-amber-500">
            <div className="w-14 h-14 mx-auto bg-emerald-900 border-2 border-amber-400/40 rounded-2xl flex items-center justify-center shadow-md mb-3">
              <GraduationCap className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-lg font-black tracking-tight uppercase">
              Federal University Lokoja
            </h1>
            <p className="text-xs text-emerald-200 font-semibold tracking-wider uppercase mt-0.5">
              Automated Invigilator Allocation System
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-1 font-mono">
              Senate Examination Committee Portal
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => {
                setLoginRole('officer');
                setLoginEmail('exam.officer@fulokoja.edu.ng');
                setLoginPassword('ful2026');
                setLoginError('');
              }}
              className={`py-3 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                loginRole === 'officer'
                  ? 'border-emerald-800 text-emerald-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Exam Officer (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginRole('staff');
                setLoginEmail('fatima.bello@fulokoja.edu.ng');
                setLoginPassword('fulstaff');
                setLoginError('');
              }}
              className={`py-3 px-4 font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                loginRole === 'staff'
                  ? 'border-emerald-800 text-emerald-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Staff Duty Check-in</span>
            </button>
          </div>

          {loginError && (
            <div className="m-5 mb-0 bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Tab 1: Exam Officer Login */}
          {loginRole === 'officer' && (
            <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Examination Officer Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="exam.officer@fulokoja.edu.ng"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Passcode / Key</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-950">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  Examination Officer Credentials:
                </span>
                <p className="text-slate-600">
                  Email: <code className="font-mono font-bold">exam.officer@fulokoja.edu.ng</code>
                </p>
                <p className="text-slate-600">
                  Passcode: <code className="font-mono font-bold">ful2026</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="w-full py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>{loginSubmitting ? 'Verifying...' : 'Sign In as Examination Officer'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Tab 2: Staff Invigilator Schedule Check-in */}
          {loginRole === 'staff' && (
            <div className="p-6 space-y-5 text-xs text-slate-800">
              {/* Quick 1-Click Faculty Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Quick 1-Click Faculty Check-in</span>
                  <span className="text-[10px] text-slate-500 font-normal">Instant Roster View</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const staff = staffList.find((s) => s.id === 'staff-2') || {
                        id: 'staff-2',
                        name: 'Dr. Fatima Zahra Bello',
                        rank: 'Senior Lecturer',
                        department: 'Computer Science',
                        email: 'fatima.bello@fulokoja.edu.ng',
                      };
                      handleInstantStaffLogin(staff as Staff);
                    }}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-all group"
                  >
                    <span className="font-bold text-emerald-950 block group-hover:text-emerald-800">
                      Dr. Fatima Zahra Bello
                    </span>
                    <span className="text-[10px] text-emerald-700">Senior Lecturer • CSC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const staff = staffList.find((s) => s.id === 'staff-1') || {
                        id: 'staff-1',
                        name: 'Prof. Olusegun B. Alao',
                        rank: 'Professor',
                        department: 'Computer Science',
                        email: 'olusegun.alao@fulokoja.edu.ng',
                      };
                      handleInstantStaffLogin(staff as Staff);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
                  >
                    <span className="font-bold text-slate-900 block group-hover:text-slate-800">
                      Prof. Olusegun B. Alao
                    </span>
                    <span className="text-[10px] text-slate-600">Professor • CSC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const staff = staffList.find((s) => s.id === 'staff-3') || {
                        id: 'staff-3',
                        name: 'Dr. Emeka Jude Eze',
                        rank: 'Senior Lecturer',
                        department: 'Mathematics',
                        email: 'emeka.eze@fulokoja.edu.ng',
                      };
                      handleInstantStaffLogin(staff as Staff);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
                  >
                    <span className="font-bold text-slate-900 block group-hover:text-slate-800">
                      Dr. Emeka Jude Eze
                    </span>
                    <span className="text-[10px] text-slate-600">Senior Lecturer • Maths</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const staff = staffList.find((s) => s.id === 'staff-5') || {
                        id: 'staff-5',
                        name: 'Engr. Kabir Yusuf',
                        rank: 'Lecturer I',
                        department: 'Computer Science',
                        email: 'kabir.yusuf@fulokoja.edu.ng',
                      };
                      handleInstantStaffLogin(staff as Staff);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
                  >
                    <span className="font-bold text-slate-900 block group-hover:text-slate-800">
                      Engr. Kabir Yusuf
                    </span>
                    <span className="text-[10px] text-slate-600">Lecturer I • CSC</span>
                  </button>
                </div>
              </div>

              {/* Or Select from full registered university faculty */}
              {staffList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="block font-bold text-slate-700">
                    Or Select Any University Faculty Member:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedFacultyStaffId}
                      onChange={(e) => setSelectedFacultyStaffId(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    >
                      <option value="">-- Choose Faculty Member ({staffList.length} total) --</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rank} • {s.department})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedFacultyStaffId}
                      onClick={() => {
                        const s = staffList.find((item) => item.id === selectedFacultyStaffId);
                        if (s) handleInstantStaffLogin(s);
                      }}
                      className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shrink-0"
                    >
                      View Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Institutional Email Check-in Form */}
              <div className="border-t border-slate-200 pt-3">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Faculty Institutional Email / Staff ID
                    </label>
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. fatima.bello@fulokoja.edu.ng or staff-2"
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Staff Keycode / Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="fulstaff"
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Default faculty access passcode: <code className="font-bold">fulstaff</code>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loginSubmitting}
                    className="w-full py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>{loginSubmitting ? 'Verifying...' : 'Sign In to Check My Schedule'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center text-[10px] text-slate-500">
            Federal University Lokoja • Automated Invigilator Allocation System (AIAS)
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

  const isInvigilatorRole = currentUser?.role === 'Invigilator';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'roster' && rosterViewMode === 'print') {
            setRosterViewMode('table');
          }
        }}
        onResetDb={handleResetDemoData}
        currentUser={
          currentUser
            ? { name: currentUser.name, role: currentUser.role }
            : { name: 'Prof. A. S. Mallam', role: 'Exam Officer' }
        }
        onLogout={handleLogout}
        pendingSuggestionsCount={pendingSuggestedCount}
        onRunEngine={handleRunEngine}
        actionLoading={actionLoading}
        hideBanner={rosterViewMode === 'print'}
        onSwitchRole={isInvigilatorRole ? switchToOfficer : () => switchToStaff()}
        roleSwitchLabel={isInvigilatorRole ? 'Officer Admin View' : 'Preview Staff View'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
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
                    <h2 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">
                      Examination Duty Roster
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
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
                          ? 'bg-white text-emerald-900 shadow-2xs'
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
                          ? 'bg-white text-emerald-900 shadow-2xs'
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
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <strong>Federal University Lokoja (FUL)</strong> • Directorate of Academic Planning & Senate Examination Committee
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Non-Autonomous Decision-Support System</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('architecture')}
              className="text-emerald-800 font-semibold hover:underline"
            >
              System Documentation & SQL Schema
            </button>
          </div>
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
