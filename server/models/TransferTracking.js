const mongoose = require('mongoose');

const transferTrackingSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      required: true,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
      trim: true,
    },
    ambulanceId: {
      type: String,
      default: 'AMB-UP-32-404',
      trim: true,
    },
    driverId: {
      type: String,
      default: 'DRV-8821',
      trim: true,
    },
    driverName: {
      type: String,
      default: 'Ramesh Singh (ACLS Certified Paramedic)',
      trim: true,
    },
    driverPhone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    currentLocation: {
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
    referringHospital: {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
      name: {
        type: String,
        required: true,
        default: 'Referring Triage Center',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        default: [80.935, 26.842],
      },
      address: {
        type: String,
        default: '',
      },
    },
    receivingHospital: {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
      name: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      address: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['Assigned', 'En Route', 'Near Destination', 'Arrived', 'Transfer Completed'],
      default: 'Assigned',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    estimatedArrivalMinutes: {
      type: Number,
      default: 18,
      min: 0,
    },
    distanceRemainingKm: {
      type: Number,
      default: 7.4,
      min: 0,
    },
    speedKmh: {
      type: Number,
      default: 0,
      min: 0,
    },
    headingDegrees: {
      type: Number,
      default: 0,
    },
    routeWaypoints: [
      {
        type: [Number], // [longitude, latitude]
      },
    ],
    currentWaypointIndex: {
      type: Number,
      default: 0,
    },
    isSimulating: {
      type: Boolean,
      default: false,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON 2dsphere index for location queries
transferTrackingSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('TransferTracking', transferTrackingSchema);
