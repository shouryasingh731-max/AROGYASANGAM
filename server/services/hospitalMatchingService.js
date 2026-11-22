/**
 * Hospital / Healthcare Facility Matching Service
 * A transparent, explainable multi-factor scoring algorithm.
 * 
 * SCORING MODEL (Total 100 points):
 * - Required Bed Availability: 40 points
 * - Required Facilities, Diagnostics & Equipment: 30 points (proportional to matches)
 * - Required Specialist: 20 points
 * - Distance Proximity: 10 points
 * 
 * NOTE: This is a rule-based weighted coordination engine, NOT an AI/ML diagnosis system.
 */

// Helper to calculate Haversine distance between two coordinates in kilometers
function calculateHaversineDistance(lon1, lat1, lon2, lat2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // Round to 1 decimal
}

// Map facility & equipment query names to schema fields
const FACILITY_MAP = {
  'ICU': 'icu',
  'Ventilator': 'ventilator',
  'Operation Theatre': 'operationTheatre',
  'OT': 'operationTheatre',
  'CT Scan': 'ctScan',
  'MRI': 'mri',
  'X-Ray': 'xRay',
  'Blood Bank': 'bloodBank',
  'Dialysis': 'dialysis',
  'ECG': 'ecg',
};

// Map diagnostic queries to hospital.diagnostics fields
const DIAGNOSTIC_MAP = {
  'X-Ray': 'xRay',
  'CT Scan': 'ctScan',
  'CT': 'ctScan',
  'MRI': 'mri',
  'Ultrasound': 'ultrasound',
  'Blood Test': 'bloodTest',
  'ECG': 'ecg',
  'Pathology': 'pathology',
  'Other': 'other',
};

// Map bed query names to hospital schema fields
const BED_MAP = {
  'General': 'general',
  'ICU': 'icu',
  'NICU': 'nicu',
  'PICU': 'picu',
  'Emergency': 'emergency',
};

// Map specialist query names to hospital schema fields
const SPECIALIST_MAP = {
  'Cardiologist': 'cardiologist',
  'Neurologist': 'neurologist',
  'Orthopedic': 'orthopedic',
  'Pediatrician': 'pediatrician',
  'Surgeon': 'surgeon',
  'Other': 'other',
};

// Healthcare hierarchy tiers (1 to 5)
const FACILITY_TIERS = {
  'Sub-Centre': { level: 1, label: 'Sub-Centre' },
  'PHC': { level: 2, label: 'Primary Health Centre' },
  'Rural Hospital': { level: 3, label: 'Rural Hospital / CHC' },
  'District Hospital': { level: 4, label: 'District Hospital' },
  'Specialized Hospital': { level: 5, label: 'Specialized Hospital' },
  'Multispeciality Hospital': { level: 5, label: 'Multispeciality Hospital' },
  'Emergency Hospital': { level: 4, label: 'Emergency Hospital' },
  'Multispeciality': { level: 5, label: 'Multispeciality Hospital' },
  'Trauma & Critical Care': { level: 5, label: 'Specialized Trauma Care' },
  'Specialty Hospital': { level: 5, label: 'Specialty Hospital' },
  'General Hospital': { level: 4, label: 'General Hospital' },
  'Emergency Clinic': { level: 3, label: 'Emergency Clinic' },
};

// Standard disclaimer
const MANDATORY_DISCLAIMER =
  'ArogyaSangam supports healthcare access and referral coordination. It does not diagnose patients, recommend treatment, or replace professional medical judgment. Facility availability is reported by participating facilities and should be confirmed before patient transfer.';

// Compute freshness text and severity
function getResourceFreshness(date) {
  if (!date) return { text: 'Unknown', status: 'old', label: 'Old', minutes: 999 };
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMins < 15) {
    return { text: `${diffMins} min ago`, status: 'fresh', label: 'Fresh', minutes: diffMins };
  } else if (diffMins < 120) {
    return { text: `${diffMins} min ago`, status: 'recently_updated', label: 'Recently Updated', minutes: diffMins };
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    return { text: `${hours}h ago`, status: 'needs_verification', label: 'Needs Verification', minutes: diffMins };
  } else {
    const days = Math.floor(diffMins / 1440);
    return { text: `${days}d ago`, status: 'old', label: 'Old', minutes: diffMins };
  }
}

/**
 * Main matching calculation function
 * @param {Array} hospitals - List of Hospital Mongoose documents or plain objects
 * @param {Object} requirements - { requiredBed, requiredFacilities, requiredDiagnostics, requiredMedicines, requiredSpecialist, userLocation, emergencyLevel, facilityTypeFilter }
 */
function rankHospitals(hospitals, requirements) {
  const {
    requiredBed = 'ICU',
    requiredFacilities = [],
    requiredDiagnostics = [],
    requiredMedicines = [],
    requiredSpecialist = 'Cardiologist',
    userLocation = [80.9462, 26.8467], // Default Lucknow center
    emergencyLevel = 'Normal',
    facilityTypeFilter = null,
    weights = { bed: 40, facility: 30, specialist: 20, distance: 10 },
  } = requirements;

  const [userLon, userLat] = userLocation;

  // Filter by facilityType if requested
  let candidateHospitals = hospitals;
  if (facilityTypeFilter && facilityTypeFilter !== 'All') {
    candidateHospitals = hospitals.filter(
      (h) => (h.facilityType || h.hospitalType) === facilityTypeFilter
    );
  }

  // Combined equipment & diagnostic requirements for the 30-point capability bucket
  const combinedEquipment = Array.from(new Set([...requiredFacilities, ...requiredDiagnostics]));

  const results = candidateHospitals.map((hospital) => {
    let bedScore = 0;
    let facilityScore = 0;
    let specialistScore = 0;
    let distanceScore = 0;

    const explanations = [];
    const missing = [];
    const facilityDetails = [];
    const medicineDetails = [];

    // 1. Bed evaluation (40 points)
    const bedKey = BED_MAP[requiredBed] || 'icu';
    const bedData = hospital.beds?.[bedKey] || { total: 0, occupied: 0, available: 0, lastUpdated: new Date() };
    const availableBeds = Math.max(0, bedData.total - bedData.occupied);

    if (availableBeds > 0) {
      bedScore = weights.bed;
      explanations.push(`✓ ${requiredBed} Bed available (${availableBeds} vacant)`);
    } else {
      bedScore = 0;
      missing.push(`✗ ${requiredBed} Beds full (0 available)`);
    }

    // 2. Facilities, Equipment & Diagnostics evaluation (30 points)
    if (combinedEquipment.length > 0) {
      const perItemWeight = weights.facility / combinedEquipment.length;
      let matchedCount = 0;

      combinedEquipment.forEach((itemName) => {
        // Check in facilities
        const facKey = FACILITY_MAP[itemName];
        const facData = facKey ? hospital.facilities?.[facKey] : null;

        // Check in diagnostics
        const diagKey = DIAGNOSTIC_MAP[itemName];
        const diagData = diagKey ? hospital.diagnostics?.[diagKey] : null;

        const isAvailable = Boolean(facData?.available || diagData?.available);

        if (isAvailable) {
          matchedCount++;
          facilityScore += perItemWeight;
          explanations.push(`✓ ${itemName} available`);
          facilityDetails.push({ name: itemName, available: true });
        } else {
          missing.push(`✗ ${itemName} unavailable`);
          facilityDetails.push({ name: itemName, available: false });
        }
      });

      facilityScore = Math.round(facilityScore * 10) / 10;
    } else {
      // If no facility explicitly requested, assign full facility points
      facilityScore = weights.facility;
    }

    // 3. Specialist evaluation (20 points)
    const specKey = SPECIALIST_MAP[requiredSpecialist] || 'cardiologist';
    const specData = hospital.specialists?.[specKey] || { status: 'Not Available', lastUpdated: new Date() };

    if (specData.status === 'Available') {
      specialistScore = weights.specialist;
      explanations.push(`✓ ${requiredSpecialist} on-duty & available`);
    } else if (specData.status === 'Accepting Referrals') {
      specialistScore = Math.round(weights.specialist * 0.85);
      explanations.push(`✓ ${requiredSpecialist} accepting referrals`);
    } else {
      specialistScore = 0;
      missing.push(`✗ ${requiredSpecialist} currently not available`);
    }

    // 4. Distance evaluation (10 points)
    const hospCoords = hospital.location?.coordinates || [80.9462, 26.8467];
    const distanceKm = calculateHaversineDistance(userLon, userLat, hospCoords[0], hospCoords[1]);

    // Score decays smoothly: 0-3km = 10pts, 3-7km = 8pts, 7-12km = 6pts, 12-20km = 4pts, >20km = 2pts
    if (distanceKm <= 3) {
      distanceScore = weights.distance;
    } else if (distanceKm <= 7) {
      distanceScore = Math.round(weights.distance * 0.8);
    } else if (distanceKm <= 12) {
      distanceScore = Math.round(weights.distance * 0.6);
    } else if (distanceKm <= 20) {
      distanceScore = Math.round(weights.distance * 0.4);
    } else {
      distanceScore = Math.round(weights.distance * 0.2);
    }

    explanations.push(`✓ ${distanceKm} km away (~${Math.max(5, Math.round(distanceKm * 2.5))} min transit)`);

    // Check required medicines if provided
    if (requiredMedicines.length > 0 && Array.isArray(hospital.medicines)) {
      requiredMedicines.forEach((medName) => {
        const found = hospital.medicines.find(
          (m) => m.name.toLowerCase() === medName.toLowerCase()
        );
        if (found && found.status === 'Available') {
          explanations.push(`✓ Medicine: ${medName} available (${found.quantity || 'In Stock'})`);
          medicineDetails.push({ name: medName, status: 'Available', quantity: found.quantity });
        } else {
          missing.push(`✗ Medicine: ${medName} unavailable`);
          medicineDetails.push({ name: medName, status: 'Unavailable' });
        }
      });
    }

    // Emergency capability check for Critical cases
    if (emergencyLevel === 'Critical') {
      if (hospital.emergencyCapability?.operation24x7) {
        explanations.push(`✓ 24x7 Emergency Desk & Resuscitation Active`);
      }
    }

    // Total score calculation
    const rawScore = bedScore + facilityScore + specialistScore + distanceScore;
    const totalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Resource freshness check from bed, facilities, and lastResourceUpdate
    const latestDate = hospital.lastResourceUpdate || bedData.lastUpdated || hospital.updatedAt;
    const freshness = getResourceFreshness(latestDate);

    const fType = hospital.facilityType || hospital.hospitalType || 'Multispeciality Hospital';
    const tierInfo = FACILITY_TIERS[fType] || { level: 4, label: fType };

    return {
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        facilityName: hospital.name,
        facilityType: fType,
        hospitalType: hospital.hospitalType || fType,
        email: hospital.email,
        phone: hospital.phone,
        address: hospital.address,
        district: hospital.district || 'Lucknow',
        city: hospital.city,
        state: hospital.state,
        verified: hospital.verified,
        verificationStatus: hospital.verificationStatus,
        location: hospital.location,
        emergencyCapability: hospital.emergencyCapability,
        beds: hospital.beds,
        facilities: hospital.facilities,
        diagnostics: hospital.diagnostics,
        specialists: hospital.specialists,
        medicines: hospital.medicines,
        lastResourceUpdate: hospital.lastResourceUpdate || hospital.updatedAt,
        updatedAt: hospital.updatedAt,
        tierLevel: tierInfo.level,
        tierLabel: tierInfo.label,
      },
      matchScore: totalScore,
      distanceKm,
      freshness,
      breakdown: {
        bedScore,
        facilityScore,
        specialistScore,
        distanceScore,
        maxPossible: 100,
      },
      availableBedsCount: availableBeds,
      explanations,
      missing,
      facilityDetails,
      medicineDetails,
    };
  });

  // Sort descending by matchScore, then by distanceKm ascending
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  // Escalation tier guidance computation
  let escalationRecommendation = null;
  const isHighAcuity =
    emergencyLevel === 'Critical' ||
    requiredBed === 'ICU' ||
    requiredFacilities.includes('Ventilator') ||
    requiredFacilities.includes('Operation Theatre') ||
    requiredDiagnostics.includes('CT Scan') ||
    requiredDiagnostics.includes('MRI');

  if (isHighAcuity) {
    escalationRecommendation = {
      levelNeeded: 'District Hospital / Specialized Hospital',
      reason: 'Required high-acuity interventions (ICU/Ventilator/Specialists) exceed Sub-Centre and PHC mandates.',
      targetTiers: ['District Hospital', 'Specialized Hospital', 'Multispeciality Hospital', 'Emergency Hospital'],
    };
  }

  return {
    results,
    escalationRecommendation,
    disclaimer: MANDATORY_DISCLAIMER,
  };
}

module.exports = {
  rankHospitals,
  calculateHaversineDistance,
  getResourceFreshness,
  BED_MAP,
  FACILITY_MAP,
  DIAGNOSTIC_MAP,
  SPECIALIST_MAP,
  FACILITY_TIERS,
  MANDATORY_DISCLAIMER,
};
