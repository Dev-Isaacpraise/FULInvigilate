import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { db } from './db';
import { runAllocationEngine, isTimeOverlapping } from './engine';
import { EnrichedAllocation, NotificationRecord, StaffWorkloadStats } from '../src/types';

export const apiRouter = express.Router();
apiRouter.use(express.json());

// --- HEALTH CHECK ---
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    university: 'Federal University Lokoja (FUL)',
    system: 'Automated Examination Invigilator Allocation System',
    timestamp: new Date().toISOString(),
  });
});

// --- AUTH (Exam Officer & Staff Invigilator Access) ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  // 1. Exam Officer / Admin Credentials
  if (
    (normalizedEmail === 'admin@fulokoja.edu.ng' ||
      normalizedEmail === 'admin' ||
      normalizedEmail === 'exam.officer@fulokoja.edu.ng' ||
      normalizedEmail === 'officer@fulokoja.edu.ng') &&
    (password === 'admin123' || password === 'admin' || password === 'ful2026')
  ) {
    db.logAudit('FUL Admin', 'AUTH_LOGIN', 'Chief Exam Officer authenticated into Invigilation Portal', 'AUTH', email);
    return res.json({
      success: true,
      token: 'ful-exam-session-' + Date.now(),
      user: {
        id: 'admin-1',
        name: 'Prof. A. S. Mallam',
        email: 'exam.officer@fulokoja.edu.ng',
        role: 'Exam Officer',
        rank: 'Dean / Chief Examination Officer',
        department: 'Senate Examination Committee',
        institution: 'Federal University Lokoja',
      },
    });
  }

  // 2. Staff / Invigilator Credentials
  const allStaff = db.getStaff();
  const staff = allStaff.find(
    (s) =>
      s.email.toLowerCase() === normalizedEmail ||
      s.id.toLowerCase() === normalizedEmail ||
      s.name.toLowerCase().includes(normalizedEmail)
  );

  if (staff) {
    // Check password: allow standard university staff key 'fulstaff', 'ful2026', 'admin123', 'password', or staff ID
    if (
      password === 'fulstaff' ||
      password === 'ful2026' ||
      password === 'admin123' ||
      password === 'password' ||
      password === staff.id
    ) {
      db.logAudit(staff.name, 'STAFF_LOGIN', `Faculty member logged in to check invigilation schedule`, 'AUTH', staff.id);
      return res.json({
        success: true,
        token: 'ful-staff-session-' + Date.now(),
        user: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: 'Invigilator',
          department: staff.department,
          rank: staff.rank,
          staffId: staff.id,
          staffData: staff,
          institution: 'Federal University Lokoja',
        },
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid credentials. Exam Officers: exam.officer@fulokoja.edu.ng / ful2026. Staff: Use your institutional email / passcode fulstaff.',
  });
});

// Acknowledge duty receipt by staff
apiRouter.post('/allocations/:id/acknowledge', (req: Request, res: Response) => {
  const { notes, staff_id } = req.body;
  const alloc = db.getAllocations().find((a) => a.id === req.params.id);
  if (!alloc) return res.status(404).json({ error: 'Allocation not found' });
  const staff = db.getStaff().find((s) => s.id === (staff_id || alloc.staff_id));
  
  const currentNotes = alloc.notes ? `${alloc.notes} | ` : '';
  const acknowledgmentNote = `[Confirmed & Acknowledged by ${staff?.name || 'Staff'} on ${new Date().toLocaleDateString()}]`;
  
  const updated = db.updateAllocation(req.params.id, {
    notes: `${currentNotes}${acknowledgmentNote}`,
  });
  
  db.logAudit(
    staff?.name || 'Staff Member',
    'ACKNOWLEDGE_DUTY',
    `Invigilation duty confirmed & acknowledged for allocation ${req.params.id}`,
    'Allocation',
    req.params.id
  );
  
  res.json({ success: true, allocation: updated });
});

// Staff submit duty swap or relief conflict request
apiRouter.post('/staff/swap-request', (req: Request, res: Response) => {
  const { allocation_id, staff_id, proposed_staff_id, reason, type } = req.body;
  const staff = db.getStaff().find((s) => s.id === staff_id);
  const targetStaff = proposed_staff_id ? db.getStaff().find((s) => s.id === proposed_staff_id) : null;
  const alloc = db.getAllocations().find((a) => a.id === allocation_id);

  if (!alloc) return res.status(404).json({ error: 'Allocation not found' });

  const swapDetail = `[SWAP/RELIEF REQUEST: ${type?.toUpperCase() || 'SWAP'}] Requested by ${staff?.name || staff_id}. ${targetStaff ? `Proposed Replacement: ${targetStaff.name}. ` : ''}Reason: "${reason || 'Schedule Conflict'}" - [Pending Officer Review]`;

  const updated = db.updateAllocation(allocation_id, {
    notes: alloc.notes ? `${alloc.notes} | ${swapDetail}` : swapDetail,
  });

  db.logAudit(
    staff?.name || 'Staff Member',
    'SUBMIT_SWAP_REQUEST',
    swapDetail,
    'Allocation',
    allocation_id
  );

  res.json({
    success: true,
    message: 'Your swap/relief request has been submitted to the Senate Examination Committee for review.',
    allocation: updated,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    id: 'admin-1',
    name: 'Prof. A. S. Mallam',
    email: 'admin@fulokoja.edu.ng',
    role: 'Chief Examination Officer',
    institution: 'Federal University Lokoja',
  });
});

// --- STAFF CRUD ---
apiRouter.get('/staff', (req: Request, res: Response) => {
  res.json(db.getStaff());
});

apiRouter.post('/staff', (req: Request, res: Response) => {
  const { name, department, rank, email, phone, max_load, is_active } = req.body;
  if (!name || !department || !rank || !email) {
    return res.status(400).json({ error: 'Missing required staff fields' });
  }
  const newStaff = db.createStaff({
    name,
    department,
    rank,
    email,
    phone: phone || '',
    max_load: Number(max_load) || 4,
    is_active: is_active !== undefined ? Boolean(is_active) : true,
  });
  res.status(201).json(newStaff);
});

apiRouter.put('/staff/:id', (req: Request, res: Response) => {
  const updated = db.updateStaff(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Staff not found' });
  res.json(updated);
});

apiRouter.delete('/staff/:id', (req: Request, res: Response) => {
  const success = db.deleteStaff(req.params.id);
  if (!success) return res.status(404).json({ error: 'Staff not found' });
  res.json({ success: true });
});

// --- COURSES CRUD ---
apiRouter.get('/courses', (req: Request, res: Response) => {
  res.json(db.getCourses());
});

apiRouter.post('/courses', (req: Request, res: Response) => {
  const { code, title, department, lecturer_id } = req.body;
  if (!code || !title || !department || !lecturer_id) {
    return res.status(400).json({ error: 'Missing required course fields' });
  }
  const newCourse = db.createCourse({ code, title, department, lecturer_id });
  res.status(201).json(newCourse);
});

apiRouter.put('/courses/:id', (req: Request, res: Response) => {
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Course not found' });
  res.json(updated);
});

apiRouter.delete('/courses/:id', (req: Request, res: Response) => {
  const success = db.deleteCourse(req.params.id);
  if (!success) return res.status(404).json({ error: 'Course not found' });
  res.json({ success: true });
});

// --- VENUES CRUD ---
apiRouter.get('/venues', (req: Request, res: Response) => {
  res.json(db.getVenues());
});

apiRouter.post('/venues', (req: Request, res: Response) => {
  const { name, capacity, location, fixed_invigilator_count } = req.body;
  if (!name || !capacity || !location) {
    return res.status(400).json({ error: 'Missing required venue fields' });
  }
  const newVenue = db.createVenue({
    name,
    capacity: Number(capacity),
    location,
    fixed_invigilator_count: Number(fixed_invigilator_count) || 2,
  });
  res.status(201).json(newVenue);
});

apiRouter.put('/venues/:id', (req: Request, res: Response) => {
  const updated = db.updateVenue(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Venue not found' });
  res.json(updated);
});

apiRouter.delete('/venues/:id', (req: Request, res: Response) => {
  const success = db.deleteVenue(req.params.id);
  if (!success) return res.status(404).json({ error: 'Venue not found' });
  res.json({ success: true });
});

// --- EXAMS CRUD ---
apiRouter.get('/exams', (req: Request, res: Response) => {
  res.json(db.getExams());
});

apiRouter.get('/exam-venues', (req: Request, res: Response) => {
  res.json(db.getExamVenues());
});

apiRouter.post('/exams', (req: Request, res: Response) => {
  const { course_id, date, start_time, end_time, expected_students, venue_ids } = req.body;
  if (!course_id || !date || !start_time || !end_time || !venue_ids || !venue_ids.length) {
    return res.status(400).json({ error: 'Missing required exam timetable fields or venues' });
  }
  const result = db.createExam(
    {
      course_id,
      date,
      start_time,
      end_time,
      expected_students: Number(expected_students) || 100,
    },
    venue_ids
  );
  res.status(201).json(result);
});

apiRouter.put('/exams/:id', (req: Request, res: Response) => {
  const { venue_ids, ...examUpdates } = req.body;
  const updated = db.updateExam(req.params.id, examUpdates, venue_ids);
  if (!updated) return res.status(404).json({ error: 'Exam not found' });
  res.json(updated);
});

apiRouter.delete('/exams/:id', (req: Request, res: Response) => {
  const success = db.deleteExam(req.params.id);
  if (!success) return res.status(404).json({ error: 'Exam not found' });
  res.json({ success: true });
});

// --- ALLOCATION ENGINE & ALLOCATIONS ---

// Helper: Join allocation with Staff, Course, Exam, Venue
function getEnrichedAllocations(): EnrichedAllocation[] {
  const staffMap = new Map(db.getStaff().map((s) => [s.id, s]));
  const courseMap = new Map(db.getCourses().map((c) => [c.id, c]));
  const venueMap = new Map(db.getVenues().map((v) => [v.id, v]));
  const examMap = new Map(db.getExams().map((e) => [e.id, e]));

  return db.getAllocations().map((alloc) => {
    const exam = examMap.get(alloc.exam_id);
    const course = exam ? courseMap.get(exam.course_id) : undefined;
    const staff = staffMap.get(alloc.staff_id);
    const venue = venueMap.get(alloc.venue_id);
    const lecturer = course ? staffMap.get(course.lecturer_id) : undefined;

    return {
      ...alloc,
      staff,
      exam,
      course,
      venue,
      lecturer,
    };
  });
}

apiRouter.get('/allocations', (req: Request, res: Response) => {
  res.json(getEnrichedAllocations());
});

// TRIGGER ALLOCATION ENGINE
apiRouter.post('/allocations/generate', (req: Request, res: Response) => {
  const staffList = db.getStaff();
  const courses = db.getCourses();
  const exams = db.getExams();
  const venues = db.getVenues();
  const examVenues = db.getExamVenues();
  const existingAllocations = db.getAllocations();

  const { allocations, report } = runAllocationEngine({
    staffList,
    courses,
    exams,
    venues,
    examVenues,
    existingAllocations,
  });

  db.setAllocations(allocations);
  db.logAudit(
    'Chief Exam Officer',
    'GENERATE_ALLOCATIONS',
    `Allocation Engine executed: ${report.new_suggestions_count} suggestions generated, ${report.preserved_approved_count} approved/edited preserved, ${report.unfulfilled_slots} unfulfilled slots`,
    'Engine',
    report.timestamp
  );

  res.json({
    success: true,
    report,
    allocations: getEnrichedAllocations(),
  });
});

// CHECK CONFLICTS FOR MANUAL SWAPS OR ASSIGNMENTS
apiRouter.post('/allocations/check-conflicts', (req: Request, res: Response) => {
  const { exam_id, staff_id, exclude_allocation_id } = req.body;
  const exam = db.getExamById(exam_id);
  const staff = db.getStaffById(staff_id);

  if (!exam || !staff) {
    return res.status(400).json({ error: 'Invalid exam or staff ID' });
  }

  const course = db.getCourseById(exam.course_id);
  const issues: string[] = [];

  // Exclusion rule: Staff cannot invigilate course they lecture
  if (course && course.lecturer_id === staff.id) {
    issues.push(`Exclusion Rule Breach: ${staff.name} is the assigned lecturer for ${course.code}.`);
  }

  // Active check
  if (!staff.is_active) {
    issues.push(`Staff Status: ${staff.name} is currently marked inactive.`);
  }

  // Double-booking check
  const allAllocations = db.getAllocations().filter((a) => a.id !== exclude_allocation_id);
  const examsMap = new Map(db.getExams().map((e) => [e.id, e]));

  const staffExams = allAllocations
    .filter((a) => a.staff_id === staff.id && a.status !== 'rejected')
    .map((a) => examsMap.get(a.exam_id))
    .filter(Boolean);

  for (const otherExam of staffExams) {
    if (!otherExam) continue;
    if (
      isTimeOverlapping(
        exam.date,
        exam.start_time,
        exam.end_time,
        otherExam.date,
        otherExam.start_time,
        otherExam.end_time
      )
    ) {
      const otherCourse = db.getCourseById(otherExam.course_id);
      issues.push(
        `Double-Booking Conflict: ${staff.name} is already invigilating ${
          otherCourse?.code || 'another exam'
        } on ${otherExam.date} between ${otherExam.start_time} and ${otherExam.end_time}.`
      );
    }
  }

  // Load cap check
  const currentCount = allAllocations.filter(
    (a) => a.staff_id === staff.id && a.status !== 'rejected'
  ).length;
  if (currentCount >= staff.max_load) {
    issues.push(`Load Cap Warning: ${staff.name} has already reached their maximum load (${currentCount}/${staff.max_load}).`);
  }

  res.json({
    valid: issues.length === 0,
    issues,
    currentLoad: currentCount,
    maxLoad: staff.max_load,
  });
});

// EDIT AN ALLOCATION (Swap staff, change role, override)
apiRouter.put('/allocations/:id', (req: Request, res: Response) => {
  const { staff_id, role, notes, status } = req.body;
  const updates: any = {};

  if (staff_id !== undefined) updates.staff_id = staff_id;
  if (role !== undefined) updates.role = role;
  if (notes !== undefined) updates.notes = notes;
  // If user changed staff or role, mark status as 'edited' unless specifically approving
  if (status !== undefined) {
    updates.status = status;
  } else {
    updates.status = 'edited';
  }

  const updated = db.updateAllocation(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Allocation not found' });
  res.json(updated);
});

// BULK APPROVE
apiRouter.post('/allocations/bulk-approve', (req: Request, res: Response) => {
  const { ids } = req.body; // Array of IDs, or undefined to approve all 'suggested' & 'edited'
  const all = db.getAllocations();
  let count = 0;

  const updatedList = all.map((a) => {
    if (ids && Array.isArray(ids)) {
      if (ids.includes(a.id) && a.status !== 'approved') {
        count++;
        return { ...a, status: 'approved' as const, updated_at: new Date().toISOString() };
      }
    } else if (a.status === 'suggested' || a.status === 'edited') {
      count++;
      return { ...a, status: 'approved' as const, updated_at: new Date().toISOString() };
    }
    return a;
  });

  db.setAllocations(updatedList);
  db.logAudit(
    'Chief Exam Officer',
    'BULK_APPROVE_ALLOCATIONS',
    `Approved ${count} invigilator allocations for official publication`,
    'Allocation',
    'bulk'
  );

  res.json({ success: true, approvedCount: count, allocations: getEnrichedAllocations() });
});

// SINGLE APPROVE
apiRouter.post('/allocations/:id/approve', (req: Request, res: Response) => {
  const updated = db.updateAllocation(req.params.id, { status: 'approved' });
  if (!updated) return res.status(404).json({ error: 'Allocation not found' });
  res.json(updated);
});

// SINGLE REJECT
apiRouter.post('/allocations/:id/reject', (req: Request, res: Response) => {
  const updated = db.updateAllocation(req.params.id, { status: 'rejected' });
  if (!updated) return res.status(404).json({ error: 'Allocation not found' });
  res.json(updated);
});

// DELETE ALLOCATION
apiRouter.delete('/allocations/:id', (req: Request, res: Response) => {
  const success = db.deleteAllocation(req.params.id);
  if (!success) return res.status(404).json({ error: 'Allocation not found' });
  res.json({ success: true });
});

// --- NOTIFICATIONS DISPATCH & LOGS ---
apiRouter.get('/notifications', (req: Request, res: Response) => {
  res.json(db.getNotifications());
});

apiRouter.post('/notifications/dispatch', (req: Request, res: Response) => {
  const { channel = 'email', onlyApproved = true } = req.body;
  const enriched = getEnrichedAllocations();

  const targetAllocations = onlyApproved
    ? enriched.filter((a) => a.status === 'approved')
    : enriched.filter((a) => a.status !== 'rejected');

  const generatedRecords: NotificationRecord[] = [];

  for (const alloc of targetAllocations) {
    if (!alloc.staff || !alloc.exam || !alloc.course || !alloc.venue) continue;

    const roleTitle = alloc.role === 'chief' ? 'Chief Invigilator' : 'Assistant Invigilator';
    const message = `FEDERAL UNIVERSITY LOKOJA - EXAMINATION DUTY CALL SLIP
Dear ${alloc.staff.rank} ${alloc.staff.name},
You have been officially allocated as ${roleTitle} for:
Course: ${alloc.course.code} - ${alloc.course.title}
Date: ${alloc.exam.date} | Time: ${alloc.exam.start_time} - ${alloc.exam.end_time}
Venue: ${alloc.venue.name} (${alloc.venue.location})
Please report at the venue 30 minutes before commencement. Signed: Senate Examination Committee, FUL.`;

    generatedRecords.push({
      id: `notif-${alloc.id}-${Date.now()}`,
      allocation_id: alloc.id,
      staff_id: alloc.staff.id,
      staff_name: alloc.staff.name,
      staff_email: alloc.staff.email,
      staff_phone: alloc.staff.phone,
      course_code: alloc.course.code,
      course_title: alloc.course.title,
      venue_name: alloc.venue.name,
      date: alloc.exam.date,
      time_range: `${alloc.exam.start_time} - ${alloc.exam.end_time}`,
      role: alloc.role,
      channel: channel as 'email' | 'sms' | 'in_app',
      status: 'sent',
      sent_at: new Date().toISOString(),
      message,
    });
  }

  db.addNotifications(generatedRecords);
  db.logAudit(
    'FUL Exam System',
    'DISPATCH_NOTIFICATIONS',
    `Dispatched ${generatedRecords.length} exam duty notifications via ${channel.toUpperCase()}`,
    'Notification',
    'batch'
  );

  res.json({
    success: true,
    count: generatedRecords.length,
    notifications: generatedRecords,
  });
});

// --- WORKLOAD STATS & FAIRNESS AUDIT ---
apiRouter.get('/stats/workload', (req: Request, res: Response) => {
  const staffList = db.getStaff();
  const allocations = db.getAllocations();

  const stats: StaffWorkloadStats[] = staffList.map((s) => {
    const staffAllocations = allocations.filter((a) => a.staff_id === s.id && a.status !== 'rejected');
    const approvedCount = staffAllocations.filter((a) => a.status === 'approved').length;
    const suggestedCount = staffAllocations.filter((a) => a.status === 'suggested').length;
    const editedCount = staffAllocations.filter((a) => a.status === 'edited').length;
    const allocatedCount = staffAllocations.length;

    return {
      staff_id: s.id,
      name: s.name,
      rank: s.rank,
      department: s.department,
      max_load: s.max_load,
      allocated_count: allocatedCount,
      approved_count: approvedCount,
      suggested_count: suggestedCount,
      edited_count: editedCount,
      utilization_rate: s.max_load > 0 ? Math.round((allocatedCount / s.max_load) * 100) : 0,
    };
  });

  // Calculate fairness metrics (Standard deviation & variance)
  const loads = stats.map((s) => s.allocated_count);
  const meanLoad = loads.reduce((a, b) => a + b, 0) / Math.max(1, loads.length);
  const variance =
    loads.reduce((acc, val) => acc + Math.pow(val - meanLoad, 2), 0) / Math.max(1, loads.length);
  const stdDev = Math.sqrt(variance);

  res.json({
    staffStats: stats,
    summary: {
      totalStaff: staffList.length,
      activeStaff: staffList.filter((s) => s.is_active).length,
      averageLoad: Number(meanLoad.toFixed(2)),
      standardDeviation: Number(stdDev.toFixed(2)),
      equityIndex: Math.max(0, 100 - Math.round(stdDev * 20)), // 100 is perfectly uniform
    },
  });
});

// --- AUDIT LOGS ---
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// --- RESET DATABASE TO OFFICIAL SAMPLE DATA ---
apiRouter.post('/db/reset', (req: Request, res: Response) => {
  db.resetToSeeds();
  res.json({
    success: true,
    message: 'Database reset to Federal University Lokoja official seed configuration',
  });
});

// --- GET SQL SCHEMA (for students/examiners) ---
apiRouter.get('/db/sql-schema', (req: Request, res: Response) => {
  try {
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      return res.type('text/plain').send(sql);
    }
    res.status(404).send('Schema file not found');
  } catch (err) {
    res.status(500).send('Error reading schema');
  }
});
