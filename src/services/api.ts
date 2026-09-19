import {
  Staff,
  Course,
  Exam,
  Venue,
  ExamVenue,
  EnrichedAllocation,
  GenerationReport,
  NotificationRecord,
  StaffWorkloadStats,
  AuditLog,
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  // Staff
  async getStaff(): Promise<Staff[]> {
    const res = await fetch(`${API_BASE}/staff`);
    return res.json();
  },
  async createStaff(staff: Omit<Staff, 'id'>): Promise<Staff> {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staff),
    });
    return res.json();
  },
  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async deleteStaff(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE}/courses`);
    return res.json();
  },
  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });
    return res.json();
  },
  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async deleteCourse(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Venues
  async getVenues(): Promise<Venue[]> {
    const res = await fetch(`${API_BASE}/venues`);
    return res.json();
  },
  async createVenue(venue: Omit<Venue, 'id'>): Promise<Venue> {
    const res = await fetch(`${API_BASE}/venues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venue),
    });
    return res.json();
  },
  async updateVenue(id: string, updates: Partial<Venue>): Promise<Venue> {
    const res = await fetch(`${API_BASE}/venues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async deleteVenue(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/venues/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Exams
  async getExams(): Promise<Exam[]> {
    const res = await fetch(`${API_BASE}/exams`);
    return res.json();
  },
  async getExamVenues(): Promise<ExamVenue[]> {
    const res = await fetch(`${API_BASE}/exam-venues`);
    return res.json();
  },
  async createExam(data: {
    course_id: string;
    date: string;
    start_time: string;
    end_time: string;
    expected_students: number;
    venue_ids: string[];
  }): Promise<{ exam: Exam; examVenues: ExamVenue[] }> {
    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateExam(
    id: string,
    data: Partial<Exam> & { venue_ids?: string[] }
  ): Promise<Exam> {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteExam(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Allocations
  async getAllocations(): Promise<EnrichedAllocation[]> {
    const res = await fetch(`${API_BASE}/allocations`);
    return res.json();
  },
  async generateAllocations(): Promise<{
    success: boolean;
    report: GenerationReport;
    allocations: EnrichedAllocation[];
  }> {
    const res = await fetch(`${API_BASE}/allocations/generate`, { method: 'POST' });
    return res.json();
  },
  async checkConflicts(
    examId: string,
    staffId: string,
    excludeAllocationId?: string
  ): Promise<{
    valid: boolean;
    issues: string[];
    currentLoad: number;
    maxLoad: number;
  }> {
    const res = await fetch(`${API_BASE}/allocations/check-conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exam_id: examId,
        staff_id: staffId,
        exclude_allocation_id: excludeAllocationId,
      }),
    });
    return res.json();
  },
  async updateAllocation(
    id: string,
    updates: { staff_id?: string; role?: 'chief' | 'assistant'; status?: string; notes?: string }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/allocations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async approveAllocation(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/allocations/${id}/approve`, { method: 'POST' });
    return res.json();
  },
  async rejectAllocation(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/allocations/${id}/reject`, { method: 'POST' });
    return res.json();
  },
  async bulkApprove(ids?: string[]): Promise<{ success: boolean; approvedCount: number; allocations: EnrichedAllocation[] }> {
    const res = await fetch(`${API_BASE}/allocations/bulk-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return res.json();
  },
  async deleteAllocation(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/allocations/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<NotificationRecord[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },
  async dispatchNotifications(
    channel: 'email' | 'sms' | 'in_app' = 'email',
    onlyApproved: boolean = true
  ): Promise<{ success: boolean; count: number; notifications: NotificationRecord[] }> {
    const res = await fetch(`${API_BASE}/notifications/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, onlyApproved }),
    });
    return res.json();
  },

  // Stats & Audits
  async getWorkloadStats(): Promise<{
    staffStats: StaffWorkloadStats[];
    summary: {
      totalStaff: number;
      activeStaff: number;
      averageLoad: number;
      standardDeviation: number;
      equityIndex: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/stats/workload`);
    return res.json();
  },
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return res.json();
  },
  async getSqlSchema(): Promise<string> {
    const res = await fetch(`${API_BASE}/db/sql-schema`);
    return res.text();
  },
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/db/reset`, { method: 'POST' });
    return res.json();
  },
  async resetData(): Promise<{ success: boolean; message: string }> {
    return this.resetDatabase();
  },

  // Staff Portal Actions
  async acknowledgeDuty(allocationId: string, staffId?: string, notes?: string): Promise<{ success: boolean; allocation: any }> {
    const res = await fetch(`${API_BASE}/allocations/${allocationId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_id: staffId, notes }),
    });
    return res.json();
  },

  async submitSwapRequest(data: {
    allocation_id: string;
    staff_id: string;
    proposed_staff_id?: string;
    reason: string;
    type?: string;
  }): Promise<{ success: boolean; message: string; allocation: any }> {
    const res = await fetch(`${API_BASE}/staff/swap-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
