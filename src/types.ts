export interface Staff {
  id: string;
  name: string;
  department: string;
  rank: string; // e.g., 'Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer I', 'Lecturer II', 'Assistant Lecturer'
  email: string;
  phone: string;
  max_load: number;
  is_active: boolean;
  photoUrl?: string;
}

export interface Course {
  id: string;
  code: string; // e.g., 'CSC 301'
  title: string;
  department: string;
  lecturer_id: string; // FK -> Staff.id
}

export interface Exam {
  id: string;
  course_id: string; // FK -> Course.id
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm (24h)
  end_time: string; // HH:mm (24h)
  expected_students: number;
}

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  location: string;
  fixed_invigilator_count: number;
}

export interface ExamVenue {
  id: string;
  exam_id: string; // FK -> Exam.id
  venue_id: string; // FK -> Venue.id
  students_assigned: number;
}

export type AllocationRole = 'chief' | 'assistant';
export type AllocationStatus = 'suggested' | 'approved' | 'edited' | 'rejected';

export interface Allocation {
  id: string;
  exam_id: string; // FK -> Exam.id
  venue_id: string; // FK -> Venue.id
  staff_id: string; // FK -> Staff.id
  role: AllocationRole;
  status: AllocationStatus;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface EnrichedAllocation extends Allocation {
  staff?: Staff;
  exam?: Exam;
  course?: Course;
  venue?: Venue;
  lecturer?: Staff;
}

export interface NotificationRecord {
  id: string;
  allocation_id: string;
  staff_id: string;
  staff_name: string;
  staff_email: string;
  staff_phone: string;
  course_code: string;
  course_title: string;
  venue_name: string;
  date: string;
  time_range: string;
  role: AllocationRole;
  channel: 'email' | 'sms' | 'in_app';
  status: 'sent' | 'pending' | 'failed';
  sent_at: string;
  message: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  entity_type: string;
  entity_id: string;
}

export interface GenerationReport {
  timestamp: string;
  total_required_slots: number;
  slots_allocated: number;
  unfulfilled_slots: number;
  preserved_approved_count: number;
  new_suggestions_count: number;
  warnings: Array<{
    exam_id: string;
    course_code: string;
    venue_name: string;
    slot_index: number;
    reason: string;
  }>;
}

export interface StaffWorkloadStats {
  staff_id: string;
  name: string;
  rank: string;
  department: string;
  max_load: number;
  allocated_count: number;
  approved_count: number;
  suggested_count: number;
  edited_count: number;
  utilization_rate: number; // percentage (allocated_count / max_load) * 100
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'Exam Officer' | 'Invigilator';
  department?: string;
  rank?: string;
  staffId?: string;
  staffData?: Staff;
  photoUrl?: string;
}
