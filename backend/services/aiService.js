/**
 * IdentiChain AI Service
 * Features:
 * 1. AI Document Classifier
 * 2. AI Medical Triage
 * 3. AI Risk-Scoring Engine for Emergency Micro-Aid
 */

/**
 * 1. AI Document Classification
 */
const classifyDocument = async (filename, contentText = '') => {
  const nameLower = (filename || '').toLowerCase();
  const contentLower = (contentText || '').toLowerCase();
  const textToScan = `${nameLower} ${contentLower}`;

  // Heuristic patterns
  const identityKeywords = ['passport', 'id', 'national', 'birth', 'certificate', 'diia', 'citizenship', 'driver', 'license', 'visa', 'refugee_card', 'kyc', 'identity'];
  const medicalKeywords = ['prescription', 'medical', 'doctor', 'hospital', 'diagnosis', 'vaccine', 'vaccination', 'triage', 'dose', 'blood', 'clinic', 'therapy', 'health', 'rx', 'patient'];
  const educationPropertyKeywords = ['degree', 'diploma', 'university', 'school', 'property', 'deed', 'land', 'ownership', 'transcript', 'education', 'apartment', 'lease', 'contract', 'title'];

  let matchedCategory = 'identity';
  let matchedTags = ['Verified Document'];
  let confidence = 0.92;

  let medicalMatches = medicalKeywords.filter(k => textToScan.includes(k)).length;
  let eduMatches = educationPropertyKeywords.filter(k => textToScan.includes(k)).length;
  let identityMatches = identityKeywords.filter(k => textToScan.includes(k)).length;

  if (medicalMatches > eduMatches && medicalMatches > identityMatches) {
    matchedCategory = 'medical';
    matchedTags = ['Medical Record', 'Clinical Summary', 'Health Vault'];
    confidence = Math.min(0.98, 0.85 + medicalMatches * 0.04);
  } else if (eduMatches > identityMatches) {
    matchedCategory = 'education_property';
    matchedTags = ['Education/Property', 'Certified Copy', 'Asset Record'];
    confidence = Math.min(0.98, 0.85 + eduMatches * 0.04);
  } else {
    matchedCategory = 'identity';
    matchedTags = ['Biometric Identity', 'Official Document', 'UNHCR Interoperable'];
    confidence = Math.min(0.98, 0.88 + identityMatches * 0.03);
  }

  return {
    category: matchedCategory,
    tags: matchedTags,
    confidence: Number(confidence.toFixed(2)),
    aiSource: 'IdentiChain Neural Classifier (Rule-Based Fallback)',
  };
};

/**
 * 2. AI Medical Triage
 */
const triageSymptoms = async (symptoms) => {
  const text = (symptoms || '').toLowerCase();

  // Keyword triage rules
  const urgentKeywords = [
    'chest pain', 'shortness of breath', 'bleeding', 'unconscious', 'severe fever',
    'fracture', 'seizure', 'stroke', 'head injury', 'difficulty breathing', 'coughing blood',
    'anaphylaxis', 'poison', 'infant high fever', 'gunshot', 'shrapnel'
  ];

  const moderateKeywords = [
    'persistent fever', 'infection', 'stomach pain', 'vomiting', 'burn', 'deep cut',
    'asthma flare', 'diarrhea', 'dehydration', 'rash', 'dizziness', 'joint swelling',
    'dislocated', 'sprain', 'migraine', 'child fever', 'cough'
  ];

  let urgencyLevel = 'Mild';
  let explanation = '';
  let suggestedNextStep = '';

  const isUrgent = urgentKeywords.some(k => text.includes(k));
  const isModerate = moderateKeywords.some(k => text.includes(k));

  if (isUrgent) {
    urgencyLevel = 'Urgent';
    explanation = 'High-risk symptoms detected requiring immediate clinical intervention and stabilization.';
    suggestedNextStep = 'Proceed immediately to the nearest UNHCR / Red Cross Field Hospital or Partner Emergency Ward.';
  } else if (isModerate) {
    urgencyLevel = 'Moderate';
    explanation = 'Symptoms indicate a moderate condition that requires medical evaluation within 24-48 hours to prevent escalation.';
    suggestedNextStep = 'Schedule an appointment at a partner clinic (e.g. Center for Medical Aid, Krakow) or present your IdentiChain QR code for priority intake.';
  } else {
    urgencyLevel = 'Mild';
    explanation = 'Symptoms appear self-limiting or mild. Basic first aid and monitoring recommended.';
    suggestedNextStep = 'Visit a partner pharmacy to collect over-the-counter essentials using your IdentiChain Aid Wallet voucher.';
  }

  return {
    urgencyLevel,
    explanation,
    suggestedNextStep,
    aiSource: 'IdentiChain Clinical Triage Engine v2.4 (Offline Fallback)',
  };
};

/**
 * 3. AI Aid Risk Scoring
 */
const scoreAidRisk = async (urgencyReason, amountRequested, hasDocumentProof) => {
  let score = 15; // Base low risk score (0 = lowest risk / highest approval, 100 = high risk)
  let reasoningParts = [];

  if (hasDocumentProof) {
    score -= 10;
    reasoningParts.push('Cryptographically verified identity & document proof present (-10 risk).');
  } else {
    score += 25;
    reasoningParts.push('No verified document attached (+25 risk).');
  }

  if (amountRequested <= 250) {
    score += 5;
    reasoningParts.push('Micro-amount within emergency threshold (€250 cap).');
  } else if (amountRequested <= 500) {
    score += 15;
    reasoningParts.push('Standard aid amount requested.');
  } else {
    score += 35;
    reasoningParts.push('High aid amount requested (>€500 requires enhanced review).');
  }

  const reasonLower = (urgencyReason || '').toLowerCase();
  if (reasonLower.includes('shelter') || reasonLower.includes('medicine') || reasonLower.includes('food') || reasonLower.includes('transit') || reasonLower.includes('child')) {
    score -= 10;
    reasoningParts.push('Urgent survival category validated (Shelter/Medical/Transit/Food).');
  }

  score = Math.max(5, Math.min(95, score));
  const isApproved = score < 60;
  const status = isApproved ? 'Approved' : 'Under Review';
  const finalReasoning = `Risk Score: ${score}/100. ${reasoningParts.join(' ')} ${isApproved ? 'Instantly approved via AI smart policy.' : 'Referred to human NGO desk for quick verification.'}`;

  return {
    riskScore: score,
    status,
    reasoning: finalReasoning,
  };
};

module.exports = {
  classifyDocument,
  triageSymptoms,
  scoreAidRisk,
};
