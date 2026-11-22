const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Draft', 'Created', 'Sent', 'Pending', 'Accepted', 'Rejected', 'Transfer', 'Completed', 'Cancelled'],
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const referralSchema = new mongoose.Schema(
  {
    referralId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: function () {
        return this.doctorId;
      },
    },
    creatorRole: {
      type: String,
      enum: ['doctor', 'frontline_health_worker', 'admin'],
      default: 'doctor',
    },
    patientReference: {
      type: String,
      required: [true, 'Patient reference ID is required'],
      trim: true,
      index: true,
    },
    patientAge: {
      type: Number,
      required: true,
      min: 0,
      max: 130,
    },
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    emergencyLevel: {
      type: String,
      enum: ['Normal', 'Urgent', 'Critical'],
      required: true,
      default: 'Normal',
      index: true,
    },
    requiredBed: {
      type: String,
      enum: ['General', 'ICU', 'NICU', 'PICU', 'Emergency'],
      required: true,
      default: 'ICU',
    },
    requiredFacilities: {
      type: [String],
      default: [],
    },
    requiredDiagnostics: {
      type: [String],
      default: [],
    },
    requiredSpecialist: {
      type: String,
      required: true,
      default: 'Cardiologist',
    },
    requiredMedicines: {
      type: [String],
      default: [],
    },
    sourceFacility: {
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
      name: { type: String, default: 'Referring Health Facility' },
      facilityType: { type: String, default: 'PHC' },
      district: { type: String, default: 'Lucknow' },
    },
    targetFacility: {
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
      name: { type: String, default: '' },
      facilityType: { type: String, default: '' },
      district: { type: String, default: '' },
    },
    escalationTier: {
      type: String,
      default: 'District Hospital',
    },
    notes: {
      type: String,
      default: '',
    },
    documents: [
      {
        name: { type: String, required: true },
        fileType: { type: String, default: 'PDF' },
        size: { type: String, default: '1.2 MB' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    recommendedHospitals: [
      {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
        name: String,
        score: Number,
        breakdown: Object,
        explanations: [String],
        missing: [String],
      },
    ],
    selectedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    status: {
      type: String,
      enum: ['Draft', 'Created', 'Sent', 'Pending', 'Accepted', 'Rejected', 'Transfer', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    timeline: {
      type: [timelineItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Referral', referralSchema);
