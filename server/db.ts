import fs from 'fs';
import path from 'path';
import {
  Staff,
  Course,
  Exam,
  Venue,
  ExamVenue,
  Allocation,
  AuditLog,
  NotificationRecord,
} from '../src/types';
import {
  INITIAL_STAFF,
  INITIAL_COURSES,
  INITIAL_VENUES,
  INITIAL_EXAMS,
  INITIAL_EXAM_VENUES,
  INITIAL_ALLOCATIONS,
} from './seedData';

interface DatabaseSchema {
  staff: Staff[];
  courses: Course[];
  exams: Exam[];
  venues: Venue[];
  examVenues: ExamVenue[];
  allocations: Allocation[];
  auditLogs: AuditLog[];
  notifications: NotificationRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ful_exam_db.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          staff: parsed.staff || INITIAL_STAFF,
          courses: parsed.courses || INITIAL_COURSES,
          exams: parsed.exams || INITIAL_EXAMS,
          venues: parsed.venues || INITIAL_VENUES,
          examVenues: parsed.examVenues || INITIAL_EXAM_VENUES,
          allocations: parsed.allocations || INITIAL_ALLOCATIONS,
          auditLogs: parsed.auditLogs || [],
          notifications: parsed.notifications || [],
        };
      }
    } catch (err) {
      console.error('Error reading database file, using seeds:', err);
    }

    const initial: DatabaseSchema = {
      staff: INITIAL_STAFF,
      courses: INITIAL_COURSES,
      exams: INITIAL_EXAMS,
      venues: INITIAL_VENUES,
      examVenues: INITIAL_EXAM_VENUES,
      allocations: INITIAL_ALLOCATIONS,
      auditLogs: [
        {
          id: 'log-init',
          timestamp: new Date().toISOString(),
          actor: 'System Initialization',
          action: 'BOOTSTRAP_DATABASE',
          details: 'Initialized FUL Examination Invigilation Database with seed records',
          entity_type: 'SYSTEM',
          entity_id: 'root',
        },
      ],
      notifications: [],
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public resetToSeeds(): void {
    this.data = {
      staff: JSON.parse(JSON.stringify(INITIAL_STAFF)),
      courses: JSON.parse(JSON.stringify(INITIAL_COURSES)),
      exams: JSON.parse(JSON.stringify(INITIAL_EXAMS)),
      venues: JSON.parse(JSON.stringify(INITIAL_VENUES)),
      examVenues: JSON.parse(JSON.stringify(INITIAL_EXAM_VENUES)),
      allocations: JSON.parse(JSON.stringify(INITIAL_ALLOCATIONS)),
      auditLogs: [
        {
          id: 'log-reset-' + Date.now(),
          timestamp: new Date().toISOString(),
          actor: 'FUL Exam Admin',
          action: 'RESET_DATABASE',
          details: 'Reset system state to official Federal University Lokoja sample dataset',
          entity_type: 'SYSTEM',
          entity_id: 'root',
        },
      ],
      notifications: [],
    };
    this.saveData(this.data);
  }

  public logAudit(actor: string, action: string, details: string, entity_type: string, entity_id: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
      entity_type,
      entity_id,
    };
    this.data.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.saveData(this.data);
    return log;
  }

  // --- STAFF ---
  public getStaff(): Staff[] {
    return this.data.staff;
  }
  public getStaffById(id: string): Staff | undefined {
    return this.data.staff.find((s) => s.id === id);
  }
  public createStaff(staff: Omit<Staff, 'id'>): Staff {
    const newStaff: Staff = {
      ...staff,
      id: 'staff-' + Date.now(),
    };
    this.data.staff.push(newStaff);
    this.saveData(this.data);
    this.logAudit('Admin', 'CREATE_STAFF', `Added staff ${newStaff.name} (${newStaff.rank})`, 'Staff', newStaff.id);
    return newStaff;
  }
  public updateStaff(id: string, updates: Partial<Staff>): Staff | null {
    const idx = this.data.staff.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.staff[idx] = { ...this.data.staff[idx], ...updates };
    this.saveData(this.data);
    this.logAudit('Admin', 'UPDATE_STAFF', `Updated staff ${this.data.staff[idx].name}`, 'Staff', id);
    return this.data.staff[idx];
  }
  public deleteStaff(id: string): boolean {
    const initialLen = this.data.staff.length;
    this.data.staff = this.data.staff.filter((s) => s.id !== id);
    if (this.data.staff.length < initialLen) {
      // Cascade delete or retain allocations? Foreign key in schema restricts or warns.
      this.data.allocations = this.data.allocations.filter((a) => a.staff_id !== id);
      this.saveData(this.data);
      this.logAudit('Admin', 'DELETE_STAFF', `Removed staff member ${id}`, 'Staff', id);
      return true;
    }
    return false;
  }

  // --- COURSES ---
  public getCourses(): Course[] {
    return this.data.courses;
  }
  public getCourseById(id: string): Course | undefined {
    return this.data.courses.find((c) => c.id === id);
  }
  public createCourse(course: Omit<Course, 'id'>): Course {
    const newCourse: Course = {
      ...course,
      id: 'course-' + Date.now(),
    };
    this.data.courses.push(newCourse);
    this.saveData(this.data);
    this.logAudit('Admin', 'CREATE_COURSE', `Created course ${newCourse.code}: ${newCourse.title}`, 'Course', newCourse.id);
    return newCourse;
  }
  public updateCourse(id: string, updates: Partial<Course>): Course | null {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
    this.saveData(this.data);
    this.logAudit('Admin', 'UPDATE_COURSE', `Updated course ${this.data.courses[idx].code}`, 'Course', id);
    return this.data.courses[idx];
  }
  public deleteCourse(id: string): boolean {
    const initialLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter((c) => c.id !== id);
    if (this.data.courses.length < initialLen) {
      this.saveData(this.data);
      this.logAudit('Admin', 'DELETE_COURSE', `Deleted course ${id}`, 'Course', id);
      return true;
    }
    return false;
  }

  // --- VENUES ---
  public getVenues(): Venue[] {
    return this.data.venues;
  }
  public getVenueById(id: string): Venue | undefined {
    return this.data.venues.find((v) => v.id === id);
  }
  public createVenue(venue: Omit<Venue, 'id'>): Venue {
    const newVenue: Venue = {
      ...venue,
      id: 'venue-' + Date.now(),
    };
    this.data.venues.push(newVenue);
    this.saveData(this.data);
    this.logAudit('Admin', 'CREATE_VENUE', `Added venue ${newVenue.name} (Fixed invigilators: ${newVenue.fixed_invigilator_count})`, 'Venue', newVenue.id);
    return newVenue;
  }
  public updateVenue(id: string, updates: Partial<Venue>): Venue | null {
    const idx = this.data.venues.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.data.venues[idx] = { ...this.data.venues[idx], ...updates };
    this.saveData(this.data);
    this.logAudit('Admin', 'UPDATE_VENUE', `Updated venue ${this.data.venues[idx].name}`, 'Venue', id);
    return this.data.venues[idx];
  }
  public deleteVenue(id: string): boolean {
    const initialLen = this.data.venues.length;
    this.data.venues = this.data.venues.filter((v) => v.id !== id);
    if (this.data.venues.length < initialLen) {
      this.data.examVenues = this.data.examVenues.filter((ev) => ev.venue_id !== id);
      this.data.allocations = this.data.allocations.filter((a) => a.venue_id !== id);
      this.saveData(this.data);
      this.logAudit('Admin', 'DELETE_VENUE', `Deleted venue ${id}`, 'Venue', id);
      return true;
    }
    return false;
  }

  // --- EXAMS ---
  public getExams(): Exam[] {
    return this.data.exams;
  }
  public getExamById(id: string): Exam | undefined {
    return this.data.exams.find((e) => e.id === id);
  }
  public createExam(exam: Omit<Exam, 'id'>, venueIds: string[]): { exam: Exam; examVenues: ExamVenue[] } {
    const newExam: Exam = {
      ...exam,
      id: 'exam-' + Date.now(),
    };
    this.data.exams.push(newExam);

    const createdEvs: ExamVenue[] = [];
    const studentsPerVenue = Math.ceil(exam.expected_students / Math.max(1, venueIds.length));
    venueIds.forEach((vid, i) => {
      const ev: ExamVenue = {
        id: `ev-${newExam.id}-${i}-${Date.now()}`,
        exam_id: newExam.id,
        venue_id: vid,
        students_assigned: studentsPerVenue,
      };
      this.data.examVenues.push(ev);
      createdEvs.push(ev);
    });

    this.saveData(this.data);
    this.logAudit('Admin', 'CREATE_EXAM', `Created exam for course ${exam.course_id} on ${exam.date}`, 'Exam', newExam.id);
    return { exam: newExam, examVenues: createdEvs };
  }
  public updateExam(id: string, updates: Partial<Exam>, venueIds?: string[]): Exam | null {
    const idx = this.data.exams.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.exams[idx] = { ...this.data.exams[idx], ...updates };

    if (venueIds && Array.isArray(venueIds)) {
      // Update exam venues
      this.data.examVenues = this.data.examVenues.filter((ev) => ev.exam_id !== id);
      const studentsPerVenue = Math.ceil(this.data.exams[idx].expected_students / Math.max(1, venueIds.length));
      venueIds.forEach((vid, i) => {
        this.data.examVenues.push({
          id: `ev-${id}-${i}-${Date.now()}`,
          exam_id: id,
          venue_id: vid,
          students_assigned: studentsPerVenue,
        });
      });
    }

    this.saveData(this.data);
    this.logAudit('Admin', 'UPDATE_EXAM', `Updated exam details for ${id}`, 'Exam', id);
    return this.data.exams[idx];
  }
  public deleteExam(id: string): boolean {
    const initialLen = this.data.exams.length;
    this.data.exams = this.data.exams.filter((e) => e.id !== id);
    if (this.data.exams.length < initialLen) {
      this.data.examVenues = this.data.examVenues.filter((ev) => ev.exam_id !== id);
      this.data.allocations = this.data.allocations.filter((a) => a.exam_id !== id);
      this.saveData(this.data);
      this.logAudit('Admin', 'DELETE_EXAM', `Deleted exam ${id}`, 'Exam', id);
      return true;
    }
    return false;
  }

  // --- EXAM VENUES ---
  public getExamVenues(): ExamVenue[] {
    return this.data.examVenues;
  }

  // --- ALLOCATIONS ---
  public getAllocations(): Allocation[] {
    return this.data.allocations;
  }
  public setAllocations(allocations: Allocation[]) {
    this.data.allocations = allocations;
    this.saveData(this.data);
  }
  public updateAllocation(id: string, updates: Partial<Allocation>): Allocation | null {
    const idx = this.data.allocations.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.allocations[idx] = {
      ...this.data.allocations[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData(this.data);
    this.logAudit(
      'Admin',
      'EDIT_ALLOCATION',
      `Modified allocation ${id} (Status: ${this.data.allocations[idx].status}, Role: ${this.data.allocations[idx].role})`,
      'Allocation',
      id
    );
    return this.data.allocations[idx];
  }
  public deleteAllocation(id: string): boolean {
    const initialLen = this.data.allocations.length;
    this.data.allocations = this.data.allocations.filter((a) => a.id !== id);
    if (this.data.allocations.length < initialLen) {
      this.saveData(this.data);
      this.logAudit('Admin', 'DELETE_ALLOCATION', `Removed allocation ${id}`, 'Allocation', id);
      return true;
    }
    return false;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): NotificationRecord[] {
    return this.data.notifications;
  }
  public addNotifications(records: NotificationRecord[]) {
    this.data.notifications = [...records, ...this.data.notifications];
    this.saveData(this.data);
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }
}

export const db = new DatabaseService();
