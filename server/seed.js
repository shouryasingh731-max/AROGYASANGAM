require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Referral = require('./models/Referral');
const Notification = require('./models/Notification');
const Patient = require('./models/Patient');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/arogyasangam';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed]: Connected to MongoDB at', MONGO_URI);

    // Clear existing collections
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Referral.deleteMany({});
    await Notification.deleteMany({});
    await Patient.deleteMany({});
    console.log('[Seed]: Cleared existing database collections.');

    // Helper timestamp generator
    const minutesAgo = (mins) => new Date(Date.now() - mins * 60 * 1000);

    // Standard medicine catalog generator
    const generateMedicines = (tier) => {
      const basic = [
        { name: 'Paracetamol 500mg', status: 'Available', quantity: '500 tabs', lastUpdated: minutesAgo(10) },
        { name: 'Amoxicillin 250mg', status: 'Available', quantity: '200 caps', lastUpdated: minutesAgo(15) },
        { name: 'ORS Packets', status: 'Available', quantity: '350 packs', lastUpdated: minutesAgo(5) },
        { name: 'Ibuprofen 400mg', status: 'Available', quantity: '150 tabs', lastUpdated: minutesAgo(20) },
      ];

      const intermediate = [
        ...basic,
        { name: 'Atropine Inj', status: 'Available', quantity: '40 ampoules', lastUpdated: minutesAgo(8) },
        { name: 'Insulin Regular', status: 'Available', quantity: '25 vials', lastUpdated: minutesAgo(12) },
        { name: 'Medical Oxygen Cylinder', status: 'Available', quantity: '12 cylinders', lastUpdated: minutesAgo(4) },
      ];

      const advanced = [
        ...intermediate,
        { name: 'Epinephrine Inj (Adrenaline)', status: 'Available', quantity: '60 ampoules', lastUpdated: minutesAgo(6) },
        { name: 'Streptokinase / Thrombolytic', status: 'Available', quantity: '10 vials', lastUpdated: minutesAgo(14) },
        { name: 'Heparin 5000 IU', status: 'Available', quantity: '30 vials', lastUpdated: minutesAgo(9) },
        { name: 'Furosemide Inj (Lasix)', status: 'Available', quantity: '80 ampoules', lastUpdated: minutesAgo(11) },
      ];

      if (tier === 'Sub-Centre') return basic;
      if (tier === 'PHC' || tier === 'Rural Hospital') return intermediate;
      return advanced;
    };

    // 1. Create Public-Health Healthcare Facilities Network
    const facilitiesData = [
      {
        name: 'Sub-Centre Gosainganj',
        email: 'sc.gosainganj@smartcare.demo',
        phone: '+91 522 281 0001',
        address: 'Village Post Gosainganj, Mohanlalganj Block',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'Sub-Centre',
        hospitalType: 'Sub-Centre',
        emergencyCapability: { hasEmergencyDesk: false, traumaLevel: 'First Aid Only', ambulanceAvailable: false, operation24x7: false },
        location: { type: 'Point', coordinates: [81.0100, 26.7800] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 4, occupied: 1, available: 3, lastUpdated: minutesAgo(15) },
          icu: { total: 0, occupied: 0, available: 0, lastUpdated: minutesAgo(15) },
          nicu: { total: 0, occupied: 0, available: 0, lastUpdated: minutesAgo(15) },
          picu: { total: 0, occupied: 0, available: 0, lastUpdated: minutesAgo(15) },
          emergency: { total: 1, occupied: 0, available: 1, lastUpdated: minutesAgo(15) },
        },
        facilities: {
          icu: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          ventilator: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          operationTheatre: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          xRay: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          bloodBank: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          dialysis: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          ecg: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
        },
        diagnostics: {
          xRay: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          ultrasound: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          bloodTest: { available: true, quantity: 20, lastUpdated: minutesAgo(15) }, // Rapid strip test
          ecg: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          pathology: { available: false, quantity: 0, lastUpdated: minutesAgo(15) },
          other: { available: true, quantity: 1, lastUpdated: minutesAgo(15) },
        },
        specialists: {
          cardiologist: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(15) },
          neurologist: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(15) },
          orthopedic: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(15) },
          pediatrician: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(15) },
          surgeon: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(15) },
          other: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(15) }, // ANM/Health Worker
        },
        medicines: generateMedicines('Sub-Centre'),
        lastResourceUpdate: minutesAgo(15),
      },
      {
        name: 'Mohanlalganj Community PHC',
        email: 'phc.mohanlalganj@smartcare.demo',
        phone: '+91 522 281 4455',
        address: 'National Highway 24B, Mohanlalganj',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'PHC',
        hospitalType: 'PHC',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: 'Basic Emergency & Triage', ambulanceAvailable: true, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9800, 26.7900] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 12, occupied: 8, available: 4, lastUpdated: minutesAgo(8) },
          icu: { total: 0, occupied: 0, available: 0, lastUpdated: minutesAgo(8) }, // NO ICU
          nicu: { total: 0, occupied: 0, available: 0, lastUpdated: minutesAgo(8) },
          picu: { total: 0, occupied: 0, available: 0, lastUpdated: minutesAgo(8) },
          emergency: { total: 3, occupied: 2, available: 1, lastUpdated: minutesAgo(8) },
        },
        facilities: {
          icu: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          ventilator: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          operationTheatre: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          xRay: { available: true, quantity: 1, lastUpdated: minutesAgo(8) },
          bloodBank: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          dialysis: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          ecg: { available: true, quantity: 1, lastUpdated: minutesAgo(8) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 1, lastUpdated: minutesAgo(8) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          ultrasound: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          bloodTest: { available: true, quantity: 50, lastUpdated: minutesAgo(8) },
          ecg: { available: true, quantity: 1, lastUpdated: minutesAgo(8) },
          pathology: { available: false, quantity: 0, lastUpdated: minutesAgo(8) },
          other: { available: true, quantity: 1, lastUpdated: minutesAgo(8) },
        },
        specialists: {
          cardiologist: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(8) },
          neurologist: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(8) },
          orthopedic: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(8) },
          pediatrician: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(8) },
          surgeon: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(8) },
          other: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(8) }, // Medical Officer
        },
        medicines: generateMedicines('PHC'),
        lastResourceUpdate: minutesAgo(8),
      },
      {
        name: 'Bakshi Ka Talab Rural Hospital (CHC)',
        email: 'chc.bkt@smartcare.demo',
        phone: '+91 522 284 2200',
        address: 'BKT Rural Bypass, Sitapur Road',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'Rural Hospital',
        hospitalType: 'Rural Hospital',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: 'Secondary Stabilization', ambulanceAvailable: true, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9200, 26.9600] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 30, occupied: 20, available: 10, lastUpdated: minutesAgo(12) },
          icu: { total: 2, occupied: 2, available: 0, lastUpdated: minutesAgo(12) }, // ICU currently full
          nicu: { total: 2, occupied: 1, available: 1, lastUpdated: minutesAgo(12) },
          picu: { total: 2, occupied: 1, available: 1, lastUpdated: minutesAgo(12) },
          emergency: { total: 5, occupied: 3, available: 2, lastUpdated: minutesAgo(12) },
        },
        facilities: {
          icu: { available: true, quantity: 2, lastUpdated: minutesAgo(12) },
          ventilator: { available: false, quantity: 0, lastUpdated: minutesAgo(12) },
          operationTheatre: { available: true, quantity: 1, lastUpdated: minutesAgo(12) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(12) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(12) },
          xRay: { available: true, quantity: 2, lastUpdated: minutesAgo(12) },
          bloodBank: { available: false, quantity: 0, lastUpdated: minutesAgo(12) },
          dialysis: { available: false, quantity: 0, lastUpdated: minutesAgo(12) },
          ecg: { available: true, quantity: 2, lastUpdated: minutesAgo(12) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 2, lastUpdated: minutesAgo(12) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(12) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(12) },
          ultrasound: { available: true, quantity: 1, lastUpdated: minutesAgo(12) },
          bloodTest: { available: true, quantity: 100, lastUpdated: minutesAgo(12) },
          ecg: { available: true, quantity: 2, lastUpdated: minutesAgo(12) },
          pathology: { available: true, quantity: 10, lastUpdated: minutesAgo(12) },
          other: { available: true, quantity: 1, lastUpdated: minutesAgo(12) },
        },
        specialists: {
          cardiologist: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(12) },
          neurologist: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(12) },
          orthopedic: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(12) },
          pediatrician: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(12) },
          surgeon: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(12) },
          other: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(12) },
        },
        medicines: generateMedicines('Rural Hospital'),
        lastResourceUpdate: minutesAgo(12),
      },
      {
        name: 'Dr. Ram Manohar Lohia District Hospital',
        email: 'district.hospital@smartcare.demo',
        phone: '+91 522 239 8888',
        address: 'Vibhuti Khand, Gomti Nagar',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'District Hospital',
        hospitalType: 'District Hospital',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: 'District Trauma Centre', ambulanceAvailable: true, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9950, 26.8650] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 200, occupied: 150, available: 50, lastUpdated: minutesAgo(10) },
          icu: { total: 20, occupied: 16, available: 4, lastUpdated: minutesAgo(10) },
          nicu: { total: 10, occupied: 8, available: 2, lastUpdated: minutesAgo(10) },
          picu: { total: 8, occupied: 6, available: 2, lastUpdated: minutesAgo(10) },
          emergency: { total: 25, occupied: 18, available: 7, lastUpdated: minutesAgo(10) },
        },
        facilities: {
          icu: { available: true, quantity: 20, lastUpdated: minutesAgo(10) },
          ventilator: { available: true, quantity: 10, lastUpdated: minutesAgo(10) },
          operationTheatre: { available: true, quantity: 5, lastUpdated: minutesAgo(10) },
          ctScan: { available: true, quantity: 1, lastUpdated: minutesAgo(10) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(10) },
          xRay: { available: true, quantity: 4, lastUpdated: minutesAgo(10) },
          bloodBank: { available: true, quantity: 1, lastUpdated: minutesAgo(10) },
          dialysis: { available: true, quantity: 6, lastUpdated: minutesAgo(10) },
          ecg: { available: true, quantity: 6, lastUpdated: minutesAgo(10) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 4, lastUpdated: minutesAgo(10) },
          ctScan: { available: true, quantity: 1, lastUpdated: minutesAgo(10) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(10) },
          ultrasound: { available: true, quantity: 3, lastUpdated: minutesAgo(10) },
          bloodTest: { available: true, quantity: 300, lastUpdated: minutesAgo(10) },
          ecg: { available: true, quantity: 6, lastUpdated: minutesAgo(10) },
          pathology: { available: true, quantity: 50, lastUpdated: minutesAgo(10) },
          other: { available: true, quantity: 2, lastUpdated: minutesAgo(10) },
        },
        specialists: {
          cardiologist: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(10) },
          neurologist: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(10) },
          orthopedic: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(10) },
          pediatrician: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(10) },
          surgeon: { status: 'Available', doctorCount: 4, lastUpdated: minutesAgo(10) },
          other: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(10) },
        },
        medicines: generateMedicines('District Hospital'),
        lastResourceUpdate: minutesAgo(10),
      },
      {
        name: 'Apex Trauma & Critical Care',
        email: 'apex@smartcare.demo',
        phone: '+91 522 266 7799',
        address: 'Sitapur Road Highway, Sector B',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'Specialized Hospital',
        hospitalType: 'Specialized Hospital',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: 'Apex Level 1 Trauma Center', ambulanceAvailable: true, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9500, 26.8800] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 80, occupied: 50, available: 30, lastUpdated: minutesAgo(5) },
          icu: { total: 30, occupied: 22, available: 8, lastUpdated: minutesAgo(5) }, // 8 VACANT ICU
          nicu: { total: 8, occupied: 6, available: 2, lastUpdated: minutesAgo(5) },
          picu: { total: 8, occupied: 5, available: 3, lastUpdated: minutesAgo(5) },
          emergency: { total: 30, occupied: 18, available: 12, lastUpdated: minutesAgo(5) },
        },
        facilities: {
          icu: { available: true, quantity: 30, lastUpdated: minutesAgo(5) },
          ventilator: { available: true, quantity: 20, lastUpdated: minutesAgo(5) },
          operationTheatre: { available: true, quantity: 8, lastUpdated: minutesAgo(5) },
          ctScan: { available: true, quantity: 2, lastUpdated: minutesAgo(5) },
          mri: { available: true, quantity: 1, lastUpdated: minutesAgo(5) },
          xRay: { available: true, quantity: 5, lastUpdated: minutesAgo(5) },
          bloodBank: { available: true, quantity: 1, lastUpdated: minutesAgo(5) },
          dialysis: { available: true, quantity: 8, lastUpdated: minutesAgo(5) },
          ecg: { available: true, quantity: 8, lastUpdated: minutesAgo(5) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 5, lastUpdated: minutesAgo(5) },
          ctScan: { available: true, quantity: 2, lastUpdated: minutesAgo(5) },
          mri: { available: true, quantity: 1, lastUpdated: minutesAgo(5) },
          ultrasound: { available: true, quantity: 4, lastUpdated: minutesAgo(5) },
          bloodTest: { available: true, quantity: 500, lastUpdated: minutesAgo(5) },
          ecg: { available: true, quantity: 8, lastUpdated: minutesAgo(5) },
          pathology: { available: true, quantity: 100, lastUpdated: minutesAgo(5) },
          other: { available: true, quantity: 4, lastUpdated: minutesAgo(5) },
        },
        specialists: {
          cardiologist: { status: 'Available', doctorCount: 4, lastUpdated: minutesAgo(5) }, // ACTIVE ON-DUTY
          neurologist: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(5) },
          orthopedic: { status: 'Available', doctorCount: 4, lastUpdated: minutesAgo(5) },
          pediatrician: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(5) },
          surgeon: { status: 'Available', doctorCount: 6, lastUpdated: minutesAgo(5) },
          other: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(5) },
        },
        medicines: generateMedicines('Specialized Hospital'),
        lastResourceUpdate: minutesAgo(5),
      },
      {
        name: 'CityCare Multispeciality Hospital',
        email: 'citycare@smartcare.demo',
        phone: '+91 522 245 9001',
        address: 'Sector 4, Gomti Nagar Extension',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'Multispeciality Hospital',
        hospitalType: 'Multispeciality Hospital',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: 'Level 2 Emergency', ambulanceAvailable: true, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9500, 26.8500] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 100, occupied: 65, available: 35, lastUpdated: minutesAgo(7) },
          icu: { total: 20, occupied: 17, available: 3, lastUpdated: minutesAgo(7) },
          nicu: { total: 10, occupied: 7, available: 3, lastUpdated: minutesAgo(7) },
          picu: { total: 8, occupied: 5, available: 3, lastUpdated: minutesAgo(7) },
          emergency: { total: 15, occupied: 10, available: 5, lastUpdated: minutesAgo(7) },
        },
        facilities: {
          icu: { available: true, quantity: 20, lastUpdated: minutesAgo(7) },
          ventilator: { available: true, quantity: 12, lastUpdated: minutesAgo(7) },
          operationTheatre: { available: true, quantity: 6, lastUpdated: minutesAgo(7) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(7) }, // CT SCAN UNAVAILABLE (DEMO CONTRAST)
          mri: { available: true, quantity: 1, lastUpdated: minutesAgo(7) },
          xRay: { available: true, quantity: 4, lastUpdated: minutesAgo(7) },
          bloodBank: { available: true, quantity: 1, lastUpdated: minutesAgo(7) },
          dialysis: { available: true, quantity: 8, lastUpdated: minutesAgo(7) },
          ecg: { available: true, quantity: 5, lastUpdated: minutesAgo(7) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 4, lastUpdated: minutesAgo(7) },
          ctScan: { available: false, quantity: 0, lastUpdated: minutesAgo(7) }, // CT Scan unavailable
          mri: { available: true, quantity: 1, lastUpdated: minutesAgo(7) },
          ultrasound: { available: true, quantity: 2, lastUpdated: minutesAgo(7) },
          bloodTest: { available: true, quantity: 200, lastUpdated: minutesAgo(7) },
          ecg: { available: true, quantity: 5, lastUpdated: minutesAgo(7) },
          pathology: { available: true, quantity: 40, lastUpdated: minutesAgo(7) },
          other: { available: true, quantity: 2, lastUpdated: minutesAgo(7) },
        },
        specialists: {
          cardiologist: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(7) },
          neurologist: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(7) },
          orthopedic: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(7) },
          pediatrician: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(7) },
          surgeon: { status: 'Available', doctorCount: 4, lastUpdated: minutesAgo(7) },
          other: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(7) },
        },
        medicines: generateMedicines('Multispeciality Hospital'),
        lastResourceUpdate: minutesAgo(7),
      },
      {
        name: 'MetroCare Hospital',
        email: 'metrocare@smartcare.demo',
        phone: '+91 522 278 1122',
        address: 'Faizabad Road, Indira Nagar',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'Multispeciality Hospital',
        hospitalType: 'Multispeciality Hospital',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: 'Emergency Clinic', ambulanceAvailable: true, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9600, 26.8600] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 150, occupied: 110, available: 40, lastUpdated: minutesAgo(22) },
          icu: { total: 25, occupied: 22, available: 3, lastUpdated: minutesAgo(22) },
          nicu: { total: 8, occupied: 6, available: 2, lastUpdated: minutesAgo(22) },
          picu: { total: 6, occupied: 4, available: 2, lastUpdated: minutesAgo(22) },
          emergency: { total: 20, occupied: 14, available: 6, lastUpdated: minutesAgo(22) },
        },
        facilities: {
          icu: { available: true, quantity: 25, lastUpdated: minutesAgo(22) },
          ventilator: { available: true, quantity: 15, lastUpdated: minutesAgo(22) },
          operationTheatre: { available: true, quantity: 8, lastUpdated: minutesAgo(22) },
          ctScan: { available: true, quantity: 2, lastUpdated: minutesAgo(22) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(22) },
          xRay: { available: true, quantity: 5, lastUpdated: minutesAgo(22) },
          bloodBank: { available: true, quantity: 1, lastUpdated: minutesAgo(22) },
          dialysis: { available: true, quantity: 6, lastUpdated: minutesAgo(22) },
          ecg: { available: true, quantity: 6, lastUpdated: minutesAgo(22) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 5, lastUpdated: minutesAgo(22) },
          ctScan: { available: true, quantity: 2, lastUpdated: minutesAgo(22) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(22) },
          ultrasound: { available: true, quantity: 3, lastUpdated: minutesAgo(22) },
          bloodTest: { available: true, quantity: 300, lastUpdated: minutesAgo(22) },
          ecg: { available: true, quantity: 6, lastUpdated: minutesAgo(22) },
          pathology: { available: true, quantity: 50, lastUpdated: minutesAgo(22) },
          other: { available: true, quantity: 1, lastUpdated: minutesAgo(22) },
        },
        specialists: {
          cardiologist: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(22) },
          neurologist: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(22) },
          orthopedic: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(22) },
          pediatrician: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(22) },
          surgeon: { status: 'Available', doctorCount: 5, lastUpdated: minutesAgo(22) },
          other: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(22) },
        },
        medicines: generateMedicines('Multispeciality Hospital'),
        lastResourceUpdate: minutesAgo(22),
      },
      {
        name: 'Sunrise Emergency Hospital',
        email: 'sunrise@smartcare.demo',
        phone: '+91 522 299 8811',
        address: 'Shaheed Path, South City',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'Emergency Hospital',
        hospitalType: 'Emergency Hospital',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: '24x7 Emergency Resuscitation', ambulanceAvailable: true, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9700, 26.8400] },
        verified: true,
        verificationStatus: 'Verified',
        beds: {
          general: { total: 70, occupied: 55, available: 15, lastUpdated: minutesAgo(18) },
          icu: { total: 12, occupied: 9, available: 3, lastUpdated: minutesAgo(18) },
          nicu: { total: 4, occupied: 3, available: 1, lastUpdated: minutesAgo(18) },
          picu: { total: 4, occupied: 3, available: 1, lastUpdated: minutesAgo(18) },
          emergency: { total: 20, occupied: 12, available: 8, lastUpdated: minutesAgo(18) },
        },
        facilities: {
          icu: { available: true, quantity: 12, lastUpdated: minutesAgo(18) },
          ventilator: { available: true, quantity: 7, lastUpdated: minutesAgo(18) },
          operationTheatre: { available: true, quantity: 3, lastUpdated: minutesAgo(18) },
          ctScan: { available: true, quantity: 1, lastUpdated: minutesAgo(18) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(18) },
          xRay: { available: true, quantity: 3, lastUpdated: minutesAgo(18) },
          bloodBank: { available: true, quantity: 1, lastUpdated: minutesAgo(18) },
          dialysis: { available: false, quantity: 0, lastUpdated: minutesAgo(18) },
          ecg: { available: true, quantity: 4, lastUpdated: minutesAgo(18) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 3, lastUpdated: minutesAgo(18) },
          ctScan: { available: true, quantity: 1, lastUpdated: minutesAgo(18) },
          mri: { available: false, quantity: 0, lastUpdated: minutesAgo(18) },
          ultrasound: { available: true, quantity: 2, lastUpdated: minutesAgo(18) },
          bloodTest: { available: true, quantity: 150, lastUpdated: minutesAgo(18) },
          ecg: { available: true, quantity: 4, lastUpdated: minutesAgo(18) },
          pathology: { available: true, quantity: 20, lastUpdated: minutesAgo(18) },
          other: { available: true, quantity: 1, lastUpdated: minutesAgo(18) },
        },
        specialists: {
          cardiologist: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(18) },
          neurologist: { status: 'Not Available', doctorCount: 0, lastUpdated: minutesAgo(18) },
          orthopedic: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(18) },
          pediatrician: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(18) },
          surgeon: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(18) },
          other: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(18) },
        },
        medicines: generateMedicines('Emergency Hospital'),
        lastResourceUpdate: minutesAgo(18),
      },
      {
        name: 'Unity General Hospital',
        email: 'unity@smartcare.demo',
        phone: '+91 522 288 3344',
        address: 'Chowk Heritage Zone',
        district: 'Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        facilityType: 'District Hospital',
        hospitalType: 'General Hospital',
        emergencyCapability: { hasEmergencyDesk: true, traumaLevel: 'General Ward Triage', ambulanceAvailable: false, operation24x7: true },
        location: { type: 'Point', coordinates: [80.9200, 26.8600] },
        verified: false, // ADMIN VERIFICATION TEST CASE
        verificationStatus: 'Pending Verification',
        beds: {
          general: { total: 100, occupied: 75, available: 25, lastUpdated: minutesAgo(14) },
          icu: { total: 10, occupied: 8, available: 2, lastUpdated: minutesAgo(14) },
          nicu: { total: 5, occupied: 4, available: 1, lastUpdated: minutesAgo(14) },
          picu: { total: 4, occupied: 3, available: 1, lastUpdated: minutesAgo(14) },
          emergency: { total: 10, occupied: 7, available: 3, lastUpdated: minutesAgo(14) },
        },
        facilities: {
          icu: { available: true, quantity: 10, lastUpdated: minutesAgo(14) },
          ventilator: { available: true, quantity: 5, lastUpdated: minutesAgo(14) },
          operationTheatre: { available: true, quantity: 3, lastUpdated: minutesAgo(14) },
          ctScan: { available: true, quantity: 1, lastUpdated: minutesAgo(14) },
          mri: { available: true, quantity: 1, lastUpdated: minutesAgo(14) },
          xRay: { available: true, quantity: 3, lastUpdated: minutesAgo(14) },
          bloodBank: { available: true, quantity: 1, lastUpdated: minutesAgo(14) },
          dialysis: { available: true, quantity: 4, lastUpdated: minutesAgo(14) },
          ecg: { available: true, quantity: 3, lastUpdated: minutesAgo(14) },
        },
        diagnostics: {
          xRay: { available: true, quantity: 3, lastUpdated: minutesAgo(14) },
          ctScan: { available: true, quantity: 1, lastUpdated: minutesAgo(14) },
          mri: { available: true, quantity: 1, lastUpdated: minutesAgo(14) },
          ultrasound: { available: true, quantity: 2, lastUpdated: minutesAgo(14) },
          bloodTest: { available: true, quantity: 150, lastUpdated: minutesAgo(14) },
          ecg: { available: true, quantity: 3, lastUpdated: minutesAgo(14) },
          pathology: { available: true, quantity: 30, lastUpdated: minutesAgo(14) },
          other: { available: true, quantity: 1, lastUpdated: minutesAgo(14) },
        },
        specialists: {
          cardiologist: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(14) },
          neurologist: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(14) },
          orthopedic: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(14) },
          pediatrician: { status: 'Available', doctorCount: 2, lastUpdated: minutesAgo(14) },
          surgeon: { status: 'Available', doctorCount: 3, lastUpdated: minutesAgo(14) },
          other: { status: 'Available', doctorCount: 1, lastUpdated: minutesAgo(14) },
        },
        medicines: generateMedicines('District Hospital'),
        lastResourceUpdate: minutesAgo(14),
      },
    ];

    const createdFacilities = await Hospital.insertMany(facilitiesData);
    console.log(`[Seed]: Created ${createdFacilities.length} healthcare facilities across tiers.`);

    const facilityMap = {};
    createdFacilities.forEach((h) => {
      facilityMap[h.email] = h;
    });

    // 2. Create Users (Admin, Doctors, Frontline Health Worker, Facility Staff)
    const adminUser = await User.create({
      name: 'Dr. Alok Verma (Health Director)',
      email: 'admin@smartcare.demo',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 00000',
      professionalId: 'ADM-UP-2026-001',
    });

    const docArjun = await User.create({
      name: 'Dr. Arjun Mehta',
      email: 'arjun@smartcare.demo',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+91 98765 11111',
      professionalId: 'DOC-UP-45210',
      specialization: 'General Physician / Medical Officer',
      hospitalName: 'Mohanlalganj Community PHC',
      hospitalId: facilityMap['phc.mohanlalganj@smartcare.demo']._id,
      facilityType: 'PHC',
    });

    // NEW: FRONTLINE HEALTH WORKER USER
    const workerAsha = await User.create({
      name: 'Asha Devi',
      email: 'asha.devi@smartcare.demo',
      password: 'Worker@123',
      role: 'frontline_health_worker',
      phone: '+91 98765 99999',
      professionalId: 'FHW-ASHA-8821',
      frontlineDesignation: 'Senior ASHA Facilitator / ANM',
      hospitalName: 'Mohanlalganj Community PHC',
      hospitalId: facilityMap['phc.mohanlalganj@smartcare.demo']._id,
      facilityType: 'PHC',
    });

    // Facility Staff Logins
    const hospApex = await User.create({
      name: 'Apex Trauma Coordination Desk',
      email: 'apex@smartcare.demo',
      password: 'Hospital@123',
      role: 'hospital',
      phone: '+91 522 266 7799',
      hospitalId: facilityMap['apex@smartcare.demo']._id,
      hospitalName: 'Apex Trauma & Critical Care',
      facilityType: 'Specialized Hospital',
    });

    const hospCityCare = await User.create({
      name: 'CityCare Medical Administration',
      email: 'citycare@smartcare.demo',
      password: 'Hospital@123',
      role: 'hospital',
      phone: '+91 522 245 9001',
      hospitalId: facilityMap['citycare@smartcare.demo']._id,
      hospitalName: 'CityCare Multispeciality Hospital',
      facilityType: 'Multispeciality Hospital',
    });

    const hospDistrict = await User.create({
      name: 'Dr. RML District Hospital Desk',
      email: 'district.hospital@smartcare.demo',
      password: 'Hospital@123',
      role: 'hospital',
      phone: '+91 522 239 8888',
      hospitalId: facilityMap['district.hospital@smartcare.demo']._id,
      hospitalName: 'Dr. Ram Manohar Lohia District Hospital',
      facilityType: 'District Hospital',
    });

    // Link adminUserId to facilities
    await Hospital.findByIdAndUpdate(facilityMap['apex@smartcare.demo']._id, { adminUserId: hospApex._id });
    await Hospital.findByIdAndUpdate(facilityMap['citycare@smartcare.demo']._id, { adminUserId: hospCityCare._id });
    await Hospital.findByIdAndUpdate(facilityMap['district.hospital@smartcare.demo']._id, { adminUserId: hospDistrict._id });

    console.log('[Seed]: Created Admin, Doctors, Frontline Worker, and Facility users.');

    // 3. Create Sample Demo Referrals & Patient Continuity Records
    const apexId = facilityMap['apex@smartcare.demo']._id;
    const cityCareId = facilityMap['citycare@smartcare.demo']._id;
    const phcId = facilityMap['phc.mohanlalganj@smartcare.demo']._id;

    const ref1 = await Referral.create({
      referralId: 'REF-DEMO-1001',
      doctorId: docArjun._id,
      createdBy: docArjun._id,
      creatorRole: 'doctor',
      patientReference: 'PAT-DEMO-001',
      patientAge: 58,
      patientGender: 'Male',
      emergencyLevel: 'Critical',
      requiredBed: 'ICU',
      requiredSpecialist: 'Cardiologist',
      requiredFacilities: ['Ventilator', 'Operation Theatre', 'ECG'],
      requiredDiagnostics: ['ECG', 'CT Scan'],
      requiredMedicines: ['Atropine Inj', 'Medical Oxygen Cylinder'],
      sourceFacility: {
        hospitalId: phcId,
        name: 'Mohanlalganj Community PHC',
        facilityType: 'PHC',
        district: 'Lucknow',
      },
      targetFacility: {
        hospitalId: apexId,
        name: 'Apex Trauma & Critical Care',
        facilityType: 'Specialized Hospital',
        district: 'Lucknow',
      },
      escalationTier: 'Specialized Hospital',
      notes: 'Patient presented with acute crushing substernal chest pain, diaphoresis, ST elevation on PHC ECG. PHC lacks ICU & Cardiologist. Urgent transfer to Apex Level 1 Trauma Center requested.',
      selectedHospital: apexId,
      status: 'Accepted',
      timeline: [
        {
          status: 'Created',
          updatedBy: docArjun._id,
          note: 'Emergency triage initiated at Mohanlalganj Community PHC',
          timestamp: minutesAgo(50),
        },
        {
          status: 'Pending',
          updatedBy: docArjun._id,
          note: 'Dispatched to Apex Trauma & Critical Care (96% suitability match)',
          timestamp: minutesAgo(45),
        },
        {
          status: 'Accepted',
          updatedBy: hospApex._id,
          note: 'Critical referral accepted. Emergency cardiac catheterization team on standby.',
          timestamp: minutesAgo(20),
        },
      ],
    });

    const ref2 = await Referral.create({
      referralId: 'REF-DEMO-1002',
      doctorId: workerAsha._id,
      createdBy: workerAsha._id,
      creatorRole: 'frontline_health_worker',
      patientReference: 'PAT-DEMO-002',
      patientAge: 27,
      patientGender: 'Female',
      emergencyLevel: 'Urgent',
      requiredBed: 'General',
      requiredSpecialist: 'Pediatrician',
      requiredFacilities: ['X-Ray', 'Ultrasound'],
      requiredDiagnostics: ['Ultrasound', 'Blood Test'],
      requiredMedicines: ['Amoxicillin 250mg', 'ORS Packets'],
      sourceFacility: {
        hospitalId: facilityMap['sc.gosainganj@smartcare.demo']._id,
        name: 'Sub-Centre Gosainganj',
        facilityType: 'Sub-Centre',
        district: 'Lucknow',
      },
      targetFacility: {
        hospitalId: cityCareId,
        name: 'CityCare Multispeciality Hospital',
        facilityType: 'Multispeciality Hospital',
        district: 'Lucknow',
      },
      escalationTier: 'Multispeciality Hospital',
      notes: 'Post-partum high fever and abdominal distress. Sub-Centre lacks diagnostic ultrasound. Escalating to CityCare.',
      selectedHospital: cityCareId,
      status: 'Pending',
      timeline: [
        {
          status: 'Created',
          updatedBy: workerAsha._id,
          note: 'Referral created by Frontline Health Worker Asha Devi',
          timestamp: minutesAgo(30),
        },
        {
          status: 'Pending',
          updatedBy: workerAsha._id,
          note: 'Transmitted to CityCare Multispeciality Hospital desk',
          timestamp: minutesAgo(25),
        },
      ],
    });

    // 4. Seed Patient Continuity Records
    await Patient.create({
      patientId: 'PAT-DEMO-001',
      name: 'Ramesh Kumar',
      age: 58,
      gender: 'Male',
      contact: '+91 98765 43210',
      abhaNumber: 'ABHA-91-8842-1029',
      bloodGroup: 'B+',
      currentFacility: {
        facilityId: apexId,
        name: 'Apex Trauma & Critical Care',
        facilityType: 'Specialized Hospital',
      },
      initialFacility: {
        facilityId: phcId,
        name: 'Mohanlalganj Community PHC',
        facilityType: 'PHC',
      },
      referralHistory: [
        {
          referralId: ref1.referralId,
          referralRef: ref1._id,
          sourceFacilityName: 'Mohanlalganj Community PHC',
          sourceFacilityType: 'PHC',
          targetFacilityName: 'Apex Trauma & Critical Care',
          targetFacilityType: 'Specialized Hospital',
          emergencyLevel: 'Critical',
          reason: 'Acute ST-elevation myocardial infarction requiring immediate catheterization & ICU care',
          status: 'Accepted',
          timestamp: minutesAgo(50),
        },
      ],
      activeReferralId: ref1._id,
      notes: 'Patient known hypertensive. Transferred via ACLS ambulance.',
    });

    await Patient.create({
      patientId: 'PAT-DEMO-002',
      name: 'Sunita Sharma',
      age: 27,
      gender: 'Female',
      contact: '+91 98765 88888',
      abhaNumber: 'ABHA-91-4411-9032',
      bloodGroup: 'O+',
      currentFacility: {
        facilityId: cityCareId,
        name: 'CityCare Multispeciality Hospital',
        facilityType: 'Multispeciality Hospital',
      },
      initialFacility: {
        facilityId: facilityMap['sc.gosainganj@smartcare.demo']._id,
        name: 'Sub-Centre Gosainganj',
        facilityType: 'Sub-Centre',
      },
      referralHistory: [
        {
          referralId: ref2.referralId,
          referralRef: ref2._id,
          sourceFacilityName: 'Sub-Centre Gosainganj',
          sourceFacilityType: 'Sub-Centre',
          targetFacilityName: 'CityCare Multispeciality Hospital',
          targetFacilityType: 'Multispeciality Hospital',
          emergencyLevel: 'Urgent',
          reason: 'Post-partum fever with severe abdominal pain requiring ultrasound diagnostics',
          status: 'Pending',
          timestamp: minutesAgo(30),
        },
      ],
      activeReferralId: ref2._id,
      notes: 'Initial triage by ASHA worker. Vitals stable.',
    });

    // 5. Seed Notifications
    await Notification.create({
      recipientId: hospApex._id,
      recipientRole: 'hospital',
      type: 'critical_alert',
      title: '🚨 CRITICAL EMERGENCY REFERRAL: REF-DEMO-1001',
      message: 'Dr. Arjun Mehta (Mohanlalganj PHC) dispatched CRITICAL cardiac patient PAT-DEMO-001 requiring ICU & Cardiologist.',
      referralId: ref1._id,
      read: false,
    });

    await Notification.create({
      recipientId: docArjun._id,
      recipientRole: 'doctor',
      type: 'referral_accepted',
      title: 'Referral Accepted: REF-DEMO-1001',
      message: 'Apex Trauma & Critical Care accepted referral REF-DEMO-1001. Cardiac catheterization team ready.',
      referralId: ref1._id,
      read: true,
    });

    await Notification.create({
      recipientId: workerAsha._id,
      recipientRole: 'frontline_health_worker',
      type: 'referral_status',
      title: 'Referral Dispatched: REF-DEMO-1002',
      message: 'Your referral for Sunita Sharma has been received by CityCare Multispeciality Hospital triage desk.',
      referralId: ref2._id,
      read: false,
    });

    console.log('[Seed]: Successfully populated complete public-health network and demo records!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
