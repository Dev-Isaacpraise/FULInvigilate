import { Staff, Course, Exam, Venue, ExamVenue, Allocation } from '../src/types';

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: 'Prof. Olusegun B. Alao',
    department: 'Computer Science',
    rank: 'Professor',
    email: 'olusegun.alao@fulokoja.edu.ng',
    phone: '+234 803 451 8920',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-2',
    name: 'Dr. Fatima Zahra Bello',
    department: 'Computer Science',
    rank: 'Senior Lecturer',
    email: 'fatima.bello@fulokoja.edu.ng',
    phone: '+234 812 773 9011',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-3',
    name: 'Dr. Emeka Jude Eze',
    department: 'Mathematics',
    rank: 'Senior Lecturer',
    email: 'emeka.eze@fulokoja.edu.ng',
    phone: '+234 805 112 4433',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-4',
    name: 'Engr. Kabir Yusuf',
    department: 'Computer Science',
    rank: 'Lecturer I',
    email: 'kabir.yusuf@fulokoja.edu.ng',
    phone: '+234 802 998 1234',
    max_load: 5,
    is_active: true,
  },
  {
    id: 'staff-5',
    name: 'Dr. (Mrs) Grace O. Adebayo',
    department: 'Chemistry',
    rank: 'Associate Professor',
    email: 'grace.adebayo@fulokoja.edu.ng',
    phone: '+234 803 667 8901',
    max_load: 3,
    is_active: true,
  },
  {
    id: 'staff-6',
    name: 'Dr. Solomon M. Idris',
    department: 'Physics',
    rank: 'Senior Lecturer',
    email: 'solomon.idris@fulokoja.edu.ng',
    phone: '+234 814 321 6789',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-7',
    name: 'Mrs. Amina Hassan',
    department: 'English & Literary Studies',
    rank: 'Lecturer II',
    email: 'amina.hassan@fulokoja.edu.ng',
    phone: '+234 809 543 2109',
    max_load: 5,
    is_active: true,
  },
  {
    id: 'staff-8',
    name: 'Mr. Chidi N. Okoro',
    department: 'Economics',
    rank: 'Lecturer I',
    email: 'chidi.okoro@fulokoja.edu.ng',
    phone: '+234 803 129 8844',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-9',
    name: 'Dr. Tariq A. Mohammed',
    department: 'Accounting',
    rank: 'Senior Lecturer',
    email: 'tariq.mohammed@fulokoja.edu.ng',
    phone: '+234 805 776 5432',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-10',
    name: 'Ms. Ngozi Blessing Umeh',
    department: 'Computer Science',
    rank: 'Assistant Lecturer',
    email: 'ngozi.umeh@fulokoja.edu.ng',
    phone: '+234 816 889 0012',
    max_load: 5,
    is_active: true,
  },
  {
    id: 'staff-11',
    name: 'Mr. Ibrahim Shehu',
    department: 'Mathematics',
    rank: 'Lecturer II',
    email: 'ibrahim.shehu@fulokoja.edu.ng',
    phone: '+234 807 432 1199',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-12',
    name: 'Dr. Victoria K. Danladi',
    department: 'Biological Sciences',
    rank: 'Senior Lecturer',
    email: 'victoria.danladi@fulokoja.edu.ng',
    phone: '+234 803 765 4321',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-13',
    name: 'Mr. Usman Aliyu',
    department: 'Political Science',
    rank: 'Lecturer I',
    email: 'usman.aliyu@fulokoja.edu.ng',
    phone: '+234 808 221 4455',
    max_load: 4,
    is_active: true,
  },
  {
    id: 'staff-14',
    name: 'Mrs. Folashade A. Balogun',
    department: 'Chemistry',
    rank: 'Lecturer II',
    email: 'folashade.balogun@fulokoja.edu.ng',
    phone: '+234 802 334 5566',
    max_load: 4,
    is_active: true,
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'CSC 301',
    title: 'Data Structures and Algorithms',
    department: 'Computer Science',
    lecturer_id: 'staff-1', // Prof. Olusegun Alao (cannot invigilate CSC 301)
  },
  {
    id: 'course-2',
    code: 'CSC 401',
    title: 'Software Engineering Methodologies',
    department: 'Computer Science',
    lecturer_id: 'staff-2', // Dr. Fatima Bello (cannot invigilate CSC 401)
  },
  {
    id: 'course-3',
    code: 'MTH 201',
    title: 'Mathematical Methods I',
    department: 'Mathematics',
    lecturer_id: 'staff-3', // Dr. Emeka Eze
  },
  {
    id: 'course-4',
    code: 'PHY 101',
    title: 'General Physics I (Mechanics & Heat)',
    department: 'Physics',
    lecturer_id: 'staff-6', // Dr. Solomon Idris
  },
  {
    id: 'course-5',
    code: 'CHM 205',
    title: 'Inorganic Chemistry II',
    department: 'Chemistry',
    lecturer_id: 'staff-5', // Dr. Grace Adebayo
  },
  {
    id: 'course-6',
    code: 'GST 111',
    title: 'Communication in English I',
    department: 'English & Literary Studies',
    lecturer_id: 'staff-7', // Mrs. Amina Hassan
  },
  {
    id: 'course-7',
    code: 'ECO 301',
    title: 'Intermediate Microeconomics',
    department: 'Economics',
    lecturer_id: 'staff-8', // Mr. Chidi Okoro
  },
  {
    id: 'course-8',
    code: 'ACC 201',
    title: 'Financial Accounting Fundamentals',
    department: 'Accounting',
    lecturer_id: 'staff-9', // Dr. Tariq Mohammed
  }
];

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'Multi-Purpose Hall (MPH)',
    capacity: 500,
    location: 'Felele Permanent Site',
    fixed_invigilator_count: 3, // Requires 3 invigilators (1 Chief, 2 Assistants)
  },
  {
    id: 'venue-2',
    name: 'Lecture Theatre 1 (LT-1)',
    capacity: 250,
    location: 'Felele Permanent Site',
    fixed_invigilator_count: 2, // Requires 2 invigilators (1 Chief, 1 Assistant)
  },
  {
    id: 'venue-3',
    name: 'Confluence Hall',
    capacity: 350,
    location: 'Adankolo Campus',
    fixed_invigilator_count: 2,
  },
  {
    id: 'venue-4',
    name: 'e-Exam CBT Hall A',
    capacity: 200,
    location: 'Felele Permanent Site',
    fixed_invigilator_count: 2,
  },
  {
    id: 'venue-5',
    name: 'Science Complex Hall B',
    capacity: 150,
    location: 'Adankolo Campus',
    fixed_invigilator_count: 1, // Requires 1 invigilator (Chief)
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    course_id: 'course-1', // CSC 301
    date: '2026-10-12',
    start_time: '09:00',
    end_time: '12:00',
    expected_students: 230,
  },
  {
    id: 'exam-2',
    course_id: 'course-3', // MTH 201
    date: '2026-10-12',
    start_time: '09:00',
    end_time: '12:00', // Concurrently with CSC 301 - tests no double-booking!
    expected_students: 320,
  },
  {
    id: 'exam-3',
    course_id: 'course-4', // PHY 101
    date: '2026-10-12',
    start_time: '14:00',
    end_time: '17:00',
    expected_students: 450,
  },
  {
    id: 'exam-4',
    course_id: 'course-6', // GST 111 (Massive general course split across 2 venues)
    date: '2026-10-13',
    start_time: '09:00',
    end_time: '12:00',
    expected_students: 750,
  },
  {
    id: 'exam-5',
    course_id: 'course-2', // CSC 401
    date: '2026-10-13',
    start_time: '14:00',
    end_time: '17:00',
    expected_students: 180,
  },
  {
    id: 'exam-6',
    course_id: 'course-5', // CHM 205
    date: '2026-10-14',
    start_time: '09:00',
    end_time: '12:00',
    expected_students: 140,
  },
  {
    id: 'exam-7',
    course_id: 'course-7', // ECO 301
    date: '2026-10-14',
    start_time: '14:00',
    end_time: '17:00',
    expected_students: 210,
  }
];

export const INITIAL_EXAM_VENUES: ExamVenue[] = [
  // Exam 1 (CSC 301) at LT-1
  { id: 'ev-1', exam_id: 'exam-1', venue_id: 'venue-2', students_assigned: 230 },

  // Exam 2 (MTH 201) at Confluence Hall
  { id: 'ev-2', exam_id: 'exam-2', venue_id: 'venue-3', students_assigned: 320 },

  // Exam 3 (PHY 101) at Multi-Purpose Hall
  { id: 'ev-3', exam_id: 'exam-3', venue_id: 'venue-1', students_assigned: 450 },

  // Exam 4 (GST 111) split across MPH and Confluence Hall!
  { id: 'ev-4a', exam_id: 'exam-4', venue_id: 'venue-1', students_assigned: 450 },
  { id: 'ev-4b', exam_id: 'exam-4', venue_id: 'venue-3', students_assigned: 300 },

  // Exam 5 (CSC 401) at e-Exam CBT Hall A
  { id: 'ev-5', exam_id: 'exam-5', venue_id: 'venue-4', students_assigned: 180 },

  // Exam 6 (CHM 205) at Science Complex Hall B
  { id: 'ev-6', exam_id: 'exam-6', venue_id: 'venue-5', students_assigned: 140 },

  // Exam 7 (ECO 301) at LT-1
  { id: 'ev-7', exam_id: 'exam-7', venue_id: 'venue-2', students_assigned: 210 },
];

// Provide 2 pre-existing allocations so admin can immediately observe that approved/edited records are preserved during re-runs
export const INITIAL_ALLOCATIONS: Allocation[] = [
  {
    id: 'alloc-seed-1',
    exam_id: 'exam-1',
    venue_id: 'venue-2',
    staff_id: 'staff-3', // Dr. Emeka Eze assigned as Chief for CSC 301
    role: 'chief',
    status: 'approved', // Pre-approved by Dean
    created_at: '2026-09-15T08:00:00.000Z',
    updated_at: '2026-09-15T08:00:00.000Z',
    notes: 'Confirmed by Faculty Exam Board',
  },
  {
    id: 'alloc-seed-2',
    exam_id: 'exam-3',
    venue_id: 'venue-1',
    staff_id: 'staff-1', // Prof. Olusegun Alao assigned to PHY 101
    role: 'chief',
    status: 'edited', // Manually edited by HOD
    created_at: '2026-09-16T10:30:00.000Z',
    updated_at: '2026-09-16T11:00:00.000Z',
    notes: 'Manually designated Chief Invigilator for MPH',
  }
];
