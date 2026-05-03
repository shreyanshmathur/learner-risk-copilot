require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function getFallbackInsights(learner) {
  const { riskBand, triggers = [], topTrigger = '' } = learner;
  const firstName = (learner.learnerName || 'there').split(' ')[0];

  let likelyRefundReason = 'Low activation or onboarding friction';
  const triggerText = triggers.join(' ').toLowerCase();
  const noteText = [learner.refundComments, learner.supportNotes, learner.counselorNotes]
    .filter(Boolean).join(' ').toLowerCase();
  const combined = triggerText + ' ' + noteText;

  if (/finance|loan|emi|fee|payment|afford|installment/.test(combined)) {
    likelyRefundReason = 'Finance or loan constraint';
  } else if (/schedule|workload|timing|office|job|time|bandwidth|busy/.test(combined)) {
    likelyRefundReason = 'Time or workload constraint';
  } else if (/personal|family|medical|health|emergency|relocation|illness|sick/.test(combined)) {
    likelyRefundReason = 'Personal or medical reason';
  } else if (/expectation|mismatch|promised|sales|value|course fit|not interested/.test(combined)) {
    likelyRefundReason = 'Program fit or expectation mismatch';
  }

  if (riskBand === 'High Risk') {
    return {
      riskSummary: `This learner has missed critical early activation touchpoints (${topTrigger}), which is strongly associated with refund requests in the first 7–14 days.`,
      likelyRefundReason,
      recommendedIntervention: 'Initiate a personalized call within 24 hours. Prioritize completing Dashboard Walkthrough and scheduling a catch-up for missed Week 0 sessions.',
      counselorScript: `Hi ${firstName}, I'm reaching out from the learner success team. I noticed you haven't been able to join the initial sessions yet — I just wanted to check in personally. Is it a scheduling issue, platform access, or something else? We can set up a quick 15-minute catch-up so you don't feel behind.`,
    };
  } else if (riskBand === 'Medium Risk') {
    return {
      riskSummary: `This learner has shown limited engagement during the onboarding phase (${topTrigger}), which warrants a proactive check-in within 48 hours.`,
      likelyRefundReason,
      recommendedIntervention: 'Send a personalized check-in message within 48 hours. Offer a flexible catch-up plan and facilitate a mentor booking.',
      counselorScript: `Hi ${firstName}, just checking in on how your first week is going! I noticed you might have missed a couple of sessions — totally understandable. Would it help to set up a quick call so we can make sure you're on track and comfortable with the program?`,
    };
  } else {
    return {
      riskSummary: 'This learner shows adequate early engagement signals. Routine monitoring is recommended to ensure continued progress.',
      likelyRefundReason: 'Unknown',
      recommendedIntervention: 'Schedule a standard Week 1 check-in and confirm that the mentor session is booked.',
      counselorScript: `Hi ${firstName}, great to have you on board! Just reaching out to check if there's anything you need as you settle in. Our team is always here — feel free to reach out anytime.`,
    };
  }
}

async function generateInsights(learner) {
  if (!process.env.GROQ_API_KEY) {
    return getFallbackInsights(learner);
  }

  try {
    const Groq = require('groq-sdk');
    const client = new (Groq.default || Groq)({ apiKey: process.env.GROQ_API_KEY });

    const notesText = [learner.refundComments, learner.supportNotes, learner.counselorNotes]
      .filter(Boolean).join('; ') || 'None';

    const prompt = `You are a learner success analyst at an ed-tech company helping prevent refunds. Analyze this learner's data and generate targeted, practical insights.

Learner: ${learner.learnerName}
Risk Score: ${learner.riskScore}/15 (${learner.riskBand})
Key Risk Triggers: ${(learner.triggers || []).join(', ') || 'None'}
Dashboard Walkthrough Completed: ${learner.dashboardWalkthroughCompleted ? 'Yes' : 'No'}
Week 0 Sessions Attended: ${learner.week0SessionsAttended ?? 'Unknown'}
Overall Attendance: ${learner.overallAttendance != null ? learner.overallAttendance + '%' : 'Unknown'}
Mentor Session Booked: ${learner.mentorSessionBooked ? 'Yes' : 'No'}
Communication Click Rate: ${learner.communicationClickRate != null ? learner.communicationClickRate + '%' : 'Unknown'}
Preferred Batch: ${learner.preferredBatchSlot || 'Unknown'} | Assigned: ${learner.assignedBatchSlot || 'Unknown'}
Notes: ${notesText}

Return ONLY valid JSON (no markdown, no explanation, no trailing text):
{
  "riskSummary": "1-2 specific, human sentences explaining this learner's risk based on their actual data",
  "likelyRefundReason": "exactly one of: Time or workload constraint | Finance or loan constraint | Personal or medical reason | Program fit or expectation mismatch | Low activation or onboarding friction | Unknown",
  "recommendedIntervention": "one specific, actionable next step for the counselor to take today",
  "counselorScript": "2-3 natural, warm, human-sounding sentences a counselor would say on a call — use the learner's first name"
}`;

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 450,
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.riskSummary && parsed.likelyRefundReason && parsed.recommendedIntervention && parsed.counselorScript) {
        return parsed;
      }
    }
    return getFallbackInsights(learner);
  } catch (error) {
    console.error(`AI failed for ${learner.learnerName}:`, error.message);
    return getFallbackInsights(learner);
  }
}

module.exports = { generateInsights };
