const mongoose = require('mongoose');

const bedCategorySchema = new mongoose.Schema(
  {
    total: { type: Number, required: true, min: 0, default: 0 },
    occupied: { type: Number, required: true, min: 0, default: 0 },
    available: { type: Number, required: true, min: 0, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const facilityItemSchema = new mongoose.Schema(
  {
    available: { type: Boolean, default: false },
    quantity: { type: Number, default: 1, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const specialistItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Available', 'Not Available', 'Accepting Referrals'],
      default: 'Available',
    },
    doctorCount: { type: Number, default: 1, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Hospital email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Hospital phone is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Hospital address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: 'Lucknow',
    },
    state: {
      type: String,
      required: true,
      trim: true,
      default: 'Uttar Pradesh',
    },
    district: {
      type: String,
      required: true,
      trim: true,
      default: 'Lucknow',
    },
    facilityType: {
      type: String,
      enum: [
        'Sub-Centre',
        'PHC',
        'Rural Hospital',
        'District Hospital',
        'Specialized Hospital',
        'Multispeciality Hospital',
        'Emergency Hospital',
        'Multispeciality',
        'Trauma & Critical Care',
        'Specialty Hospital',
        'General Hospital',
        'Emergency Clinic',
      ],
      default: 'District Hospital',
    },
    hospitalType: {
      type: String,
      default: function () {
        return this.facilityType || 'Multispeciality';
      },
    },
    emergencyCapability: {
      hasEmergencyDesk: { type: Boolean, default: true },
      traumaLevel: { type: String, default: 'Level 2' },
      ambulanceAvailable: { type: Boolean, default: true },
      operation24x7: { type: Boolean, default: true },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [80.9462, 26.8467],
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending Verification', 'Rejected'],
      default: 'Pending Verification',
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    beds: {
      general: { type: bedCategorySchema, default: () => ({ total: 50, occupied: 30, available: 20 }) },
      icu: { type: bedCategorySchema, default: () => ({ total: 10, occupied: 8, available: 2 }) },
      nicu: { type: bedCategorySchema, default: () => ({ total: 5, occupied: 3, available: 2 }) },
      picu: { type: bedCategorySchema, default: () => ({ total: 5, occupied: 3, available: 2 }) },
      emergency: { type: bedCategorySchema, default: () => ({ total: 10, occupied: 6, available: 4 }) },
    },
    facilities: {
      icu: { type: facilityItemSchema, default: () => ({ available: true, quantity: 10 }) },
      ventilator: { type: facilityItemSchema, default: () => ({ available: true, quantity: 5 }) },
      operationTheatre: { type: facilityItemSchema, default: () => ({ available: true, quantity: 3 }) },
      ctScan: { type: facilityItemSchema, default: () => ({ available: true, quantity: 1 }) },
      mri: { type: facilityItemSchema, default: () => ({ available: false, quantity: 0 }) },
      xRay: { type: facilityItemSchema, default: () => ({ available: true, quantity: 2 }) },
      bloodBank: { type: facilityItemSchema, default: () => ({ available: true, quantity: 1 }) },
      dialysis: { type: facilityItemSchema, default: () => ({ available: true, quantity: 4 }) },
      ecg: { type: facilityItemSchema, default: () => ({ available: true, quantity: 2 }) },
    },
    diagnostics: {
      xRay: { type: facilityItemSchema, default: () => ({ available: true, quantity: 2 }) },
      ctScan: { type: facilityItemSchema, default: () => ({ available: true, quantity: 1 }) },
      mri: { type: facilityItemSchema, default: () => ({ available: false, quantity: 0 }) },
      ultrasound: { type: facilityItemSchema, default: () => ({ available: true, quantity: 2 }) },
      bloodTest: { type: facilityItemSchema, default: () => ({ available: true, quantity: 100 }) },
      ecg: { type: facilityItemSchema, default: () => ({ available: true, quantity: 4 }) },
      pathology: { type: facilityItemSchema, default: () => ({ available: true, quantity: 50 }) },
      other: { type: facilityItemSchema, default: () => ({ available: true, quantity: 1 }) },
    },
    specialists: {
      cardiologist: { type: specialistItemSchema, default: () => ({ status: 'Available', doctorCount: 2 }) },
      neurologist: { type: specialistItemSchema, default: () => ({ status: 'Available', doctorCount: 1 }) },
      orthopedic: { type: specialistItemSchema, default: () => ({ status: 'Available', doctorCount: 2 }) },
      pediatrician: { type: specialistItemSchema, default: () => ({ status: 'Available', doctorCount: 2 }) },
      surgeon: { type: specialistItemSchema, default: () => ({ status: 'Available', doctorCount: 3 }) },
      other: { type: specialistItemSchema, default: () => ({ status: 'Available', doctorCount: 1 }) },
    },
    medicines: [
      {
        name: { type: String, required: true },
        status: { type: String, enum: ['Available', 'Unavailable'], default: 'Available' },
        quantity: { type: String, default: 'Sufficient' },
        lastUpdated: { type: Date, default: Date.now },
      },
    ],
    lastResourceUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to sync facilityName with name
hospitalSchema.virtual('facilityName').get(function () {
  return this.name;
});

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ facilityType: 1 });
hospitalSchema.index({ district: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
