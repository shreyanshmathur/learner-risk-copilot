export function getFallbackInsights(learner) {
  const { riskBand, triggers = [], topTrigger = '' } = learner;
  const firstName = (learner.learnerName || 'there').split(' ')[0];

  const combined = [
    triggers.join(' '),
    learner.refundComments,
    learner.supportNotes,
    learner.counselorNotes,
  ].filter(Boolean).join(' ').toLowerCase();

  let likelyRefundReason = 'Low activation or onboarding friction';
  if (/finance|loan|emi|fee|payment|afford|installment/.test(combined)) {
    likelyRefundReason = 'Finance or loan constraint';
  } else if (/schedule|workload|timing|office|job|bandwidth|busy/.test(combined)) {
    likelyRefundReason = 'Time or workload constraint';
  } else if (/personal|family|medical|health|emergency|relocation|illness|sick/.test(combined)) {
    likelyRefundReason = 'Personal or medical reason';
  } else if (/expectation|mismatch|promis|sales|course fit|not interested/.test(combined)) {
    likelyRefundReason = 'Program fit or expectation mismatch';
  }

  if (riskBand === 'High Risk') {
    return {
      riskSummary: `This learner has missed critical early activation touchpoints (${topTrigger}), which is strongly associated with refund requests in the first 7–14 days.`,
      likelyRefundReason,
      recommendedIntervention: 'Initiate a personalized call within 24 hours. Prioritize completing the Dashboard Walkthrough and scheduling a catch-up for missed Week 0 sessions.',
      counselorScript: `Hi ${firstName}, I'm reaching out from the learner success team. I noticed you haven't been able to join the initial sessions yet — I just wanted to personally check in. Is it a scheduling issue, platform access, or something else we can help with? We can set up a quick 15-minute catch-up so you don't feel behind.`,
    };
  } else if (riskBand === 'Medium Risk') {
    return {
      riskSummary: `This learner has shown limited engagement during the onboarding phase (${topTrigger}), which warrants a proactive check-in to ensure continued progress.`,
      likelyRefundReason,
      recommendedIntervention: 'Send a personalized check-in message within 48 hours. Offer a flexible catch-up plan and facilitate a mentor booking.',
      counselorScript: `Hi ${firstName}, just checking in on how your first week is going! I noticed you might have missed a couple of sessions — totally understandable. Would it help to set up a quick call so we can make sure you're feeling comfortable and on track?`,
    };
  } else {
    return {
      riskSummary: 'This learner shows adequate early engagement signals. Routine monitoring is recommended to sustain momentum.',
      likelyRefundReason: 'Unknown',
      recommendedIntervention: 'Schedule a standard Week 1 check-in and confirm the mentor session is booked.',
      counselorScript: `Hi ${firstName}, great to have you on board! Just reaching out to see if there's anything you need as you settle in. Our team is always here — feel free to reach out anytime.`,
    };
  }
}
