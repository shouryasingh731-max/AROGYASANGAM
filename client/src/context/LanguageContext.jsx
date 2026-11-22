import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Brand & Header
    brandTitle: 'AROGYASANGAM',
    brandSubtitle: 'Integrated Healthcare Access & Referral Coordination Platform',
    liveNetwork: 'Public Health Network',
    demoMode: 'DEMO MODE (Fictional Data)',
    lowDataMode: 'Low Data',
    lowDataActive: 'Low Data Mode Active',

    // Roles
    roleDoctor: 'Medical Officer / Doctor',
    roleFrontline: 'Frontline Health Worker (ASHA / ANM / CHO)',
    roleHospital: 'Healthcare Facility Desk',
    roleAdmin: 'Health Authority / Admin',

    // Nav
    navDashboard: 'Dashboard',
    navNewReferral: 'New Referral',
    navFindFacilities: 'Find Facilities',
    navNearbyFacilities: 'Nearby Facilities',
    navMyReferrals: 'My Referrals',
    navIncomingTriage: 'Incoming Referrals',
    navResourceMgmt: 'Resource Inventory',
    navDiagnostics: 'Diagnostics',
    navMedicines: 'Medicines',
    navPatients: 'Patient Continuity',
    navLogin: 'Sign In',
    navRegister: 'Register',
    navLogout: 'Sign Out',

    // Emergency Priorities
    emergencyNormal: 'Normal',
    emergencyUrgent: 'Urgent',
    emergencyCritical: 'CRITICAL EMERGENCY',

    // Tiers
    tierSubCentre: 'Sub-Centre',
    tierPHC: 'Primary Health Centre (PHC)',
    tierRural: 'Rural Hospital / CHC',
    tierDistrict: 'District Hospital',
    tierSpecialized: 'Specialized Hospital',
    tierMultispeciality: 'Multispeciality Hospital',
    tierEmergency: 'Emergency Hospital',

    // Resources & Services
    resBeds: 'Beds',
    resICU: 'ICU Beds',
    resVentilator: 'Ventilator',
    resSpecialist: 'Specialist',
    resDiagnostics: 'Diagnostics',
    resMedicines: 'Essential Medicines',
    resEquipment: 'Equipment',
    resCardio: 'Cardiologist',
    resCT: 'CT Scan',
    resMRI: 'MRI',
    resECG: 'ECG',
    resXRay: 'X-Ray',
    resUltrasound: 'Ultrasound',
    resBloodTest: 'Blood Pathology',

    // Freshness
    freshFresh: 'Fresh',
    freshRecent: 'Recently Updated',
    freshVerify: 'Needs Verification',
    freshOld: 'Old',

    // Statuses
    statusDraft: 'Draft',
    statusCreated: 'Initiated',
    statusSent: 'Dispatched',
    statusPending: 'Awaiting Acceptance',
    statusAccepted: 'Accepted & Bed Reserved',
    statusRejected: 'Declined / Re-route Needed',
    statusTransfer: 'In Ambulance Transit',
    statusCompleted: 'Patient Admitted',
    statusCancelled: 'Cancelled',

    // Common Buttons & Actions
    btnFindSuitable: 'Find Suitable Facility',
    btnCreateReferral: 'Create Patient Referral',
    btnDispatch: 'Dispatch Referral',
    btnCompare: 'Compare Facilities',
    btnViewProfile: 'Facility Details',
    btnCheckContinuity: 'Patient Continuity Record',
    btnUpdateBeds: 'Update Beds',
    btnUpdateDiagnostics: 'Update Diagnostics',
    btnUpdateMedicines: 'Update Medicines',

    // Instructions & Disclaimers
    safetyDisclaimer:
      'ArogyaSangam supports healthcare access and referral coordination. It does not diagnose patients, recommend treatment, or replace professional medical judgment. Facility availability is reported by participating facilities and should be confirmed before patient transfer.',
    escalationAdvice: 'Referral Hierarchy: Tier escalation recommended when local facility lacks critical resources.',
  },

  hi: {
    // Brand & Header
    brandTitle: 'आरोग्यसंगम',
    brandSubtitle: 'एकीकृत स्वास्थ्य सेवा पहुंच एवं रेफरल समन्वय मंच',
    liveNetwork: 'सार्वजनिक स्वास्थ्य नेटवर्क',
    demoMode: 'डेमो मोड (काल्पनिक डेटा)',
    lowDataMode: 'कम डेटा',
    lowDataActive: 'कम डेटा मोड सक्रिय',

    // Roles
    roleDoctor: 'चिकित्सा अधिकारी / डॉक्टर',
    roleFrontline: 'फ्रंटलाइन स्वास्थ्य कार्यकर्ता (आशा / एएनएम / सीएचओ)',
    roleHospital: 'स्वास्थ्य सुविधा केंद्र',
    roleAdmin: 'स्वास्थ्य प्राधिकरण / एडमिन',

    // Nav
    navDashboard: 'डैशबोर्ड',
    navNewReferral: 'नया रेफरल',
    navFindFacilities: 'सुविधा खोजें',
    navNearbyFacilities: 'निकटतम केंद्र',
    navMyReferrals: 'मेरे रेफरल',
    navIncomingTriage: 'आगमन रेफरल',
    navResourceMgmt: 'संसाधन इन्वेंट्री',
    navDiagnostics: 'जांच / डायग्नोस्टिक्स',
    navMedicines: 'दवाइयां',
    navPatients: 'रोगी निरंतरता',
    navLogin: 'लॉग इन करें',
    navRegister: 'पंजीकरण',
    navLogout: 'लॉग आउट',

    // Emergency Priorities
    emergencyNormal: 'सामान्य',
    emergencyUrgent: 'तत्काल (Urgent)',
    emergencyCritical: 'गंभीर आपातकाल (CRITICAL)',

    // Tiers
    tierSubCentre: 'उप-स्वास्थ्य केंद्र (Sub-Centre)',
    tierPHC: 'प्राथमिक स्वास्थ्य केंद्र (PHC)',
    tierRural: 'सामुदायिक स्वास्थ्य केंद्र (CHC)',
    tierDistrict: 'जिला अस्पताल (District Hospital)',
    tierSpecialized: 'विशिष्ट अस्पताल (Specialized)',
    tierMultispeciality: 'मल्टीस्पेशलिटी अस्पताल',
    tierEmergency: 'आपातकालीन अस्पताल',

    // Resources & Services
    resBeds: 'उपलब्ध बिस्तर',
    resICU: 'आईसीयू बेड',
    resVentilator: 'वेंटिलेटर',
    resSpecialist: 'विशेषज्ञ डॉक्टर',
    resDiagnostics: 'जांच सुविधाएं',
    resMedicines: 'आवश्यक दवाइयां',
    resEquipment: 'चिकित्सा उपकरण',
    resCardio: 'हृदय रोग विशेषज्ञ',
    resCT: 'सीटी स्कैन',
    resMRI: 'एमआरआई',
    resECG: 'ईसीजी',
    resXRay: 'एक्स-रे',
    resUltrasound: 'अल्ट्रासाउंड',
    resBloodTest: 'रक्त परीक्षण',

    // Freshness
    freshFresh: 'ताज़ा अपडेट',
    freshRecent: 'हाल ही में अपडेट',
    freshVerify: 'सत्यापन आवश्यक',
    freshOld: 'पुराना डेटा',

    // Statuses
    statusDraft: 'ड्राफ्ट',
    statusCreated: 'प्रारंभ किया गया',
    statusSent: 'भेजा गया',
    statusPending: 'स्वीकृति प्रतीक्षारत',
    statusAccepted: 'स्वीकृत एवं बेड आरक्षित',
    statusRejected: 'अस्वीकृत / वैकल्पिक खोजें',
    statusTransfer: 'एम्बुलेंस में स्थानांतरित',
    statusCompleted: 'मरीज भर्ती संपन्न',
    statusCancelled: 'रद्द किया गया',

    // Common Buttons & Actions
    btnFindSuitable: 'उपयुक्त स्वास्थ्य केंद्र खोजें',
    btnCreateReferral: 'नया रोगी रेफरल बनाएं',
    btnDispatch: 'रेफरल प्रेषित करें',
    btnCompare: 'केंद्रों की तुलना करें',
    btnViewProfile: 'केंद्र विवरण देखें',
    btnCheckContinuity: 'रोगी रेफरल इतिहास',
    btnUpdateBeds: 'बेड क्षमता अपडेट करें',
    btnUpdateDiagnostics: 'जांच उपलब्धता अपडेट करें',
    btnUpdateMedicines: 'दवा उपलब्धता अपडेट करें',

    // Instructions & Disclaimers
    safetyDisclaimer:
      'आरोग्यसंगम स्वास्थ्य पहुंच और रेफरल समन्वय में सहायता करता है। यह रोगियों का निदान या उपचार नहीं करता और न ही चिकित्सकीय निर्णय का विकल्प है। बिस्तरों व संसाधनों की उपलब्धता संबंधित केंद्रों द्वारा दर्ज की जाती है और मरीज भेजने से पूर्व इसकी पुष्टि की जानी चाहिए।',
    escalationAdvice: 'रेफरल पदानुक्रम: यदि स्थानीय केंद्र में आवश्यक संसाधन उपलब्ध नहीं हैं, तो उच्च स्तरीय केंद्र का चयन करें।',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('arogya_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('arogya_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
