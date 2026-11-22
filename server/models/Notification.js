const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ['doctor', 'hospital', 'admin', 'frontline_health_worker'],
      required: true,
    },
    type: {
      type: String,
      enum: [
        'referral_new',
        'referral_accepted',
        'referral_rejected',
        'referral_status',
        'hospital_verification',
        'critical_alert',
        'resource_update_required',
        'system_alert',
      ],
      default: 'system_alert',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
