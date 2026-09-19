import {
  Staff,
  Course,
  Exam,
  Venue,
  ExamVenue,
  Allocation,
  GenerationReport,
} from '../src/types';

interface EngineInput {
  staffList: Staff[];
  courses: Course[];
  exams: Exam[];
  venues: Venue[];
  examVenues: ExamVenue[];
  existingAllocations: Allocation[];
}

interface SlotSchedule {
  examId: string;
  date: string;
  startTime: string;
  endTime: string;
}

// Utility: check if two time ranges on the same date overlap
export function isTimeOverlapping(
  date1: string,
  start1: string,
  end1: string,
  date2: string,
  start2: string,
  end2: string
): boolean {
  if (date1 !== date2) return false;
  // Overlap condition: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

// Rank seniority weight (for deciding Chief Invigilator preference)
const RANK_SENIORITY: Record<string, number> = {
  'Professor': 100,
  'Associate Professor': 80,
  'Senior Lecturer': 60,
  'Lecturer I': 40,
  'Lecturer II': 30,
  'Assistant Lecturer': 20,
  'Graduate Assistant': 10,
};

export function runAllocationEngine(input: EngineInput): {
  allocations: Allocation[];
  report: GenerationReport;
} {
  const { staffList, courses, exams, venues, examVenues, existingAllocations } = input;

  // Lookup maps for fast access
  const staffMap = new Map<string, Staff>(staffList.map((s) => [s.id, s]));
  const courseMap = new Map<string, Course>(courses.map((c) => [c.id, c]));
  const venueMap = new Map<string, Venue>(venues.map((v) => [v.id, v]));
  const examMap = new Map<string, Exam>(exams.map((e) => [e.id, e]));

  // 1. Separate preserved (approved / edited) allocations from suggestions/rejected
  const preservedAllocations: Allocation[] = existingAllocations.filter(
    (a) => a.status === 'approved' || a.status === 'edited'
  );

  // Track staff workload counts across this exam period
  const staffLoadCount = new Map<string, number>();
  staffList.forEach((s) => staffLoadCount.set(s.id, 0));

  // Track busy schedules per staff: staffId -> SlotSchedule[]
  const staffSchedules = new Map<string, SlotSchedule[]>();
  staffList.forEach((s) => staffSchedules.set(s.id, []));

  // Populate tracking with preserved allocations
  for (const alloc of preservedAllocations) {
    const exam = examMap.get(alloc.exam_id);
    if (exam) {
      staffLoadCount.set(alloc.staff_id, (staffLoadCount.get(alloc.staff_id) || 0) + 1);
      const sched = staffSchedules.get(alloc.staff_id) || [];
      sched.push({
        examId: exam.id,
        date: exam.date,
        startTime: exam.start_time,
        endTime: exam.end_time,
      });
      staffSchedules.set(alloc.staff_id, sched);
    }
  }

  // Final list of allocations to return (starts with preserved)
  const finalAllocations: Allocation[] = [...preservedAllocations];
  const newSuggestions: Allocation[] = [];
  const warnings: GenerationReport['warnings'] = [];

  let totalRequiredSlots = 0;
  let unfulfilledSlots = 0;

  // 2. Sort exams chronologically (Date, then start_time)
  const sortedExams = [...exams].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  // 3. Iterate each exam and its associated venues
  for (const exam of sortedExams) {
    const course = courseMap.get(exam.course_id);
    if (!course) continue;

    // Venues hosting this exam
    const associatedEvs = examVenues.filter((ev) => ev.exam_id === exam.id);

    for (const ev of associatedEvs) {
      const venue = venueMap.get(ev.venue_id);
      if (!venue) continue;

      const requiredInvigilatorCount = Math.max(1, venue.fixed_invigilator_count || 1);
      totalRequiredSlots += requiredInvigilatorCount;

      // Check existing allocations for this specific (exam, venue) pair
      const currentAllocationsForSlot = finalAllocations.filter(
        (a) => a.exam_id === exam.id && a.venue_id === venue.id
      );

      // Check if a chief invigilator is already allocated
      let hasChief = currentAllocationsForSlot.some((a) => a.role === 'chief');
      const alreadyAssignedStaffIds = new Set<string>(
        currentAllocationsForSlot.map((a) => a.staff_id)
      );

      const slotsNeeded = requiredInvigilatorCount - currentAllocationsForSlot.length;

      for (let slotIdx = 0; slotIdx < slotsNeeded; slotIdx++) {
        const targetRole: 'chief' | 'assistant' = !hasChief ? 'chief' : 'assistant';

        // Find all eligible candidates among active staff
        interface Candidate {
          staff: Staff;
          currentLoad: number;
          seniority: number;
        }

        const eligibleCandidates: Candidate[] = [];
        const disqualificationReasons: string[] = [];

        for (const staff of staffList) {
          // Rule 0: Active status
          if (!staff.is_active) {
            continue;
          }

          // Rule 1: Exclusion Rule
          // Course.lecturer_id != Staff.id
          if (course.lecturer_id === staff.id) {
            disqualificationReasons.push(`${staff.name} is the course lecturer for ${course.code}`);
            continue;
          }

          // Rule 2: Cannot be assigned twice to the same Exam+Venue
          if (alreadyAssignedStaffIds.has(staff.id)) {
            continue;
          }

          // Rule 3: Load Cap
          // Respect each staff member's max_load
          const currentCount = staffLoadCount.get(staff.id) || 0;
          if (currentCount >= staff.max_load) {
            disqualificationReasons.push(`${staff.name} reached max load cap (${currentCount}/${staff.max_load})`);
            continue;
          }

          // Rule 4: No Double-Booking
          // Staff cannot be allocated to two exams in overlapping time slots
          const existingSlots = staffSchedules.get(staff.id) || [];
          const hasConflict = existingSlots.some((s) =>
            isTimeOverlapping(
              exam.date,
              exam.start_time,
              exam.end_time,
              s.date,
              s.startTime,
              s.endTime
            )
          );

          if (hasConflict) {
            disqualificationReasons.push(`${staff.name} has a time slot conflict on ${exam.date} (${exam.start_time}-${exam.end_time})`);
            continue;
          }

          // Eligible!
          eligibleCandidates.push({
            staff,
            currentLoad: currentCount,
            seniority: RANK_SENIORITY[staff.rank] || 30,
          });
        }

        if (eligibleCandidates.length === 0) {
          // Unfulfilled slot
          unfulfilledSlots++;
          warnings.push({
            exam_id: exam.id,
            course_code: course.code,
            venue_name: venue.name,
            slot_index: slotIdx + 1,
            reason: `No eligible staff available for ${targetRole} invigilator. Candidates checked: ${staffList.length}. Common barriers: ${disqualificationReasons.slice(0, 3).join('; ')}`,
          });
          continue;
        }

        // Rule 5: Fairness-based selection
        // Prioritize whoever has the fewest invigilations so far (ascending sort by currentLoad)
        eligibleCandidates.sort((a, b) => {
          // 1st priority: lowest invigilation count so far (Fairness)
          if (a.currentLoad !== b.currentLoad) {
            return a.currentLoad - b.currentLoad;
          }

          // 2nd priority: If target role is 'chief', favor higher seniority/rank
          if (targetRole === 'chief') {
            if (b.seniority !== a.seniority) {
              return b.seniority - a.seniority;
            }
          }

          // 3rd priority: Remaining capacity headroom (max_load - currentLoad)
          const remainingA = a.staff.max_load - a.currentLoad;
          const remainingB = b.staff.max_load - b.currentLoad;
          if (remainingB !== remainingA) {
            return remainingB - remainingA;
          }

          // Stable tie-breaker: staff name / ID
          return a.staff.name.localeCompare(b.staff.name);
        });

        const selected = eligibleCandidates[0];

        // Create new suggested allocation record
        const newAlloc: Allocation = {
          id: `alloc-${exam.id}-${venue.id}-${selected.staff.id}-${Date.now().toString(36)}-${slotIdx}`,
          exam_id: exam.id,
          venue_id: venue.id,
          staff_id: selected.staff.id,
          role: targetRole,
          status: 'suggested',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: `Suggested by FUL Allocation Engine (Fairness load: ${selected.currentLoad}, Cap: ${selected.staff.max_load})`,
        };

        // Update tracking state
        staffLoadCount.set(selected.staff.id, selected.currentLoad + 1);
        const sched = staffSchedules.get(selected.staff.id) || [];
        sched.push({
          examId: exam.id,
          date: exam.date,
          startTime: exam.start_time,
          endTime: exam.end_time,
        });
        staffSchedules.set(selected.staff.id, sched);
        alreadyAssignedStaffIds.add(selected.staff.id);

        if (targetRole === 'chief') {
          hasChief = true;
        }

        finalAllocations.push(newAlloc);
        newSuggestions.push(newAlloc);
      }
    }
  }

  const report: GenerationReport = {
    timestamp: new Date().toISOString(),
    total_required_slots: totalRequiredSlots,
    slots_allocated: finalAllocations.length,
    unfulfilled_slots: unfulfilledSlots,
    preserved_approved_count: preservedAllocations.length,
    new_suggestions_count: newSuggestions.length,
    warnings,
  };

  return {
    allocations: finalAllocations,
    report,
  };
}
