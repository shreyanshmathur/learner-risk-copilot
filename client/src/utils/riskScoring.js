export function calculateRiskScore(learner) {
  let score = 0;
  const triggers = [];

  if (!learner.dashboardWalkthroughCompleted) {
    score += 2;
    triggers.push('Dashboard Walkthrough not completed');
  }

  const week0 = learner.week0SessionsAttended;
  if (week0 === 0) {
    score += 3;
    triggers.push('Zero Week 0 sessions attended');
  } else if (week0 === 1) {
    score += 2;
    triggers.push('Only 1 Week 0 session attended');
  }

  const att = learner.overallAttendance;
  if (att !== null && att !== undefined && att < 25) {
    score += 3;
    triggers.push(`Low overall attendance (${att}%)`);
  }

  if (!learner.mentorSessionBooked) {
    score += 1;
    triggers.push('Mentor session not booked');
  }

  const cr = learner.communicationClickRate;
  if (cr === null || cr === undefined || cr === 0) {
    score += 1;
    triggers.push('Zero or missing communication click rate');
  }

  const notes = [learner.refundComments, learner.supportNotes, learner.counselorNotes]
    .filter(Boolean).join(' ').toLowerCase();

  if (/finance|loan|emi|fee|affordab|payment|installment|cost/.test(notes)) {
    score += 2;
    triggers.push('Finance or payment concern in notes');
  }
  if (/\btime\b|workload|job|office|schedule|bandwidth|busy|timing/.test(notes)) {
    score += 2;
    triggers.push('Time or schedule concern in notes');
  }
  if (/personal|family|medical|health|emergency|relocation|illness|sick/.test(notes)) {
    score += 2;
    triggers.push('Personal or medical concern in notes');
  }
  if (/expectation|mismatch|promis|sales|course fit|not interested|value/.test(notes)) {
    score += 2;
    triggers.push('Expectation or program-fit concern noted');
  }

  let riskBand;
  if (score <= 2) riskBand = 'Low Risk';
  else if (score <= 5) riskBand = 'Medium Risk';
  else riskBand = 'High Risk';

  const topTrigger = triggers.slice(0, 2).join(' and ') || 'No significant risk factors';

  return { riskScore: score, riskBand, triggers, topTrigger };
}
