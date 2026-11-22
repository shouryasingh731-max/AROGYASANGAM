const mongoose = require('mongoose');

const patientReferralHistorySchema = new mongoose.Schema(
  {
    referralId: {
      type: String,
      required: true,
    },
    referralRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
    },
    sourceFacilityName: {
      type: String,
      default: 'Referring Facility',
    },
    sourceFacilityType: {
      type: String,
      default: 'PHC',
    },
    targetFacilityName: {
      type: String,
      default: 'Receiving Facility',
    },
    targetFacilityType: {
      type: String,
      default: 'District Hospital',
    },
    emergencyLevel: {
      type: String,
      default: 'Normal',
    },
    reason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Pending',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, 'Patient reference ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 130,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    contact: {
      type: String,
      default: '+91 98765 00000',
    },
    abhaNumber: {
      type: String,
      default: 'ABHA-91-8842-1029',
    },
    bloodGroup: {
      type: String,
      default: 'O+',
    },
    currentFacility: {
      facilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
      name: {
        type: String,
        default: 'Community Health Centre',
      },
      facilityType: {
        type: String,
        default: 'PHC',
      },
    },
    initialFacility: {
      facilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
      name: {
        type: String,
        default: 'Sub-Centre Gosainganj',
      },
      facilityType: {
        type: String,
        default: 'Sub-Centre',
      },
    },
    referralHistory: {
      type: [patientReferralHistorySchema],
      default: [],
    },
    activeReferralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);
