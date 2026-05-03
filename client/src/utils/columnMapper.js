const COLUMN_ALIASES = {
  learnerId: ['learner id', 'learner_id', 'id', 'student id', 'student_id', 'learnerid', 'uid', 'sl no', 'sl.no', 'sr no'],
  learnerName: ['learner name', 'learner_name', 'name', 'student name', 'full name', 'fullname', 'student'],
  enrollmentDate: ['enrollment date', 'enrollment_date', 'enroll date', 'join date', 'joined', 'date of enrollment'],
  refundStatus: ['refund status', 'refund_status', 'refund'],
  dashboardWalkthroughCompleted: [
    'dashboard walkthrough completed', 'dashboard walkthrough', 'dbwt',
    'dashboard_walkthrough', 'walkthrough completed', 'walkthrough', 'dbwt completed',
    'dashboard walkthrough done',
  ],
  week0SessionsAttended: [
    'week 0 sessions attended', 'week0 sessions', 'week 0 attendance',
    'week0_sessions', 'week 0 sessions', 'week0sessions', 'w0 sessions',
    'week 0 sessions attended', 'week0 attendance',
  ],
  overallAttendance: [
    'overall attendance %', 'overall attendance', 'attendance %',
    'attendance', 'attendance_pct', 'overall attendance pct', 'attendance percentage',
  ],
  mentorSessionBooked: [
    'mentor session booked', 'mentor_session', 'mentor session',
    'mentor booked', 'mentor', 'session booked', 'mentor call booked',
  ],
  communicationOpenRate: [
    'communication open rate', 'open rate', 'comm_open_rate',
    'email open rate', 'comm open rate', 'open rate %',
  ],
  communicationClickRate: [
    'communication click rate', 'click rate', 'comm_click_rate',
    'email click rate', 'comm click rate', 'ctr', 'click rate %',
  ],
  refundComments: ['refund comments', 'refund_comments', 'refund reason', 'refund note'],
  supportNotes: ['support notes', 'support_notes', 'support', 'support note'],
  counselorNotes: ['counselor notes', 'counselor_notes', 'counsellor notes', 'counsellor_notes', 'advisor notes'],
  financeStatus: ['finance status', 'finance_status', 'payment status', 'payment'],
  preferredBatchSlot: ['preferred batch slot', 'preferred_batch', 'preferred batch', 'pref batch', 'preferred slot'],
  assignedBatchSlot: ['assigned batch slot', 'assigned_batch', 'assigned batch', 'batch slot', 'assigned slot'],
};

function normalizeKey(key) {
  return String(key).toLowerCase().trim().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ');
}

export function mapColumns(headers) {
  const mapping = {};
  headers.forEach(header => {
    const normalized = normalizeKey(header);
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.includes(normalized) && !mapping[field]) {
        mapping[field] = header;
        break;
      }
    }
  });
  return { mapping };
}

function parseBoolean(value) {
  if (value == null || value === '') return false;
  if (typeof value === 'boolean') return value;
  return ['yes', 'true', '1', 'completed', 'done', 'booked', 'y'].includes(
    String(value).toLowerCase().trim()
  );
}

function parseNumber(value) {
  if (value == null || value === '') return null;
  const num = parseFloat(String(value).replace('%', '').trim());
  return isNaN(num) ? null : num;
}

export function mapRow(row, mapping) {
  const learner = {};
  for (const [field, originalHeader] of Object.entries(mapping)) {
    const value = row[originalHeader];
    if (['dashboardWalkthroughCompleted', 'mentorSessionBooked'].includes(field)) {
      learner[field] = parseBoolean(value);
    } else if (['week0SessionsAttended', 'overallAttendance', 'communicationOpenRate', 'communicationClickRate'].includes(field)) {
      learner[field] = parseNumber(value);
    } else {
      learner[field] = value != null ? String(value).trim() : '';
    }
  }
  if (!learner.learnerId) learner.learnerId = `L${String(Math.random()).slice(2, 6)}`;
  if (!learner.learnerName) learner.learnerName = 'Unknown Learner';
  return learner;
}
