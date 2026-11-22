import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { referralAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EmergencyBadge, ReferralStatusBadge } from '../../components/StatusBadge';
import ReferralTimeline from '../../components/ReferralTimeline';
import LoadingSpinner from '../../components/LoadingSpinner';
import HealthcareDisclaimer from '../../components/HealthcareDisclaimer';
import AmbulanceTransferTracker from '../../components/AmbulanceTransferTracker';
import {
  FileText,
  Building2,
  Phone,
  MapPin,
  Clock,
  ArrowLeft,
  AlertCircle,
  FileCheck2,
  Download,
  Send,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Ambulance,
} from 'lucide-react';

const ReferralDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [referral, setReferral] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hospital status update action (if viewed by hospital staff or admin)
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchReferral = async () => {
    try {
      setLoading(true);
      const res = await referralAPI.getById(id);
      if (res.data.success) {
        setReferral(res.data.data);
        setAlternatives(res.data.alternativeMatches || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load referral record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferral();
  }, [id]);

  const handleStatusChange = async (newStatus, reason = '') => {
    try {
      setUpdatingStatus(true);
      const res = await referralAPI.updateStatus(id, {
        status: newStatus,
        rejectionReason: reason,
      });
      if (res.data.success) {
        setReferral(res.data.data);
        setAlternatives(res.data.alternativeMatches || []);
        setShowRejectModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update referral status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const isHospitalStaff =
    user?.role === 'hospital' &&
    referral?.selectedHospital &&
    user?.hospitalId === referral.selectedHospital._id;

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSpinner message="Loading clinical referral details and lifecycle timeline..." />
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-navy">{error || 'Referral Not Found'}</h2>
        <button onClick={() => navigate(-1)} className="btn-secondary text-xs mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-slate-500 hover:text-navy flex items-center gap-1.5 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Main Referral Header Card */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xl font-black text-primary">{referral.referralId}</span>
              <EmergencyBadge level={referral.emergencyLevel} />
              <ReferralStatusBadge status={referral.status} />
            </div>
            <p className="text-xs text-slate-500">
              Dispatched on {new Date(referral.createdAt).toLocaleString()} by Dr. {referral.doctorId?.name || 'Referring Physician'}
            </p>
          </div>

          {/* Action Bar (Hospital, Admin, or Demo Simulation) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto Simulation Trigger for Demonstration */}
            {referral.status === 'Pending' && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => handleStatusChange('Accepted', 'Auto-Accepted by Receiving Desk: ICU bed reserved.')}
                className="btn-teal text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Hospital Accept</span>
              </button>
            )}

            {referral.status === 'Accepted' && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => handleStatusChange('Transfer', 'Ambulance dispatched (Unit AMB-UP-32-404). ETA 10 min.')}
                className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>Start Ambulance Transit (Countdown)</span>
              </button>
            )}

            {/* Live GPS Tracking Button */}
            {['Accepted', 'Transfer', 'Completed'].includes(referral.status) && (
              <Link
                to={`/doctor/referrals/${referral._id}/tracking`}
                className="bg-gradient-to-r from-blue-600 via-primary to-indigo-600 hover:opacity-95 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-primary/25 transition-all hover:scale-105"
              >
                <Ambulance className="w-4 h-4 text-white animate-pulse" />
                <span>Track Patient Transfer (GPS Map)</span>
              </Link>
            )}

            {referral.status === 'Transfer' && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => handleStatusChange('Completed', 'Patient safely arrived and admitted into ICU Bed #04.')}
                className="btn-success text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Admission</span>
              </button>
            )}

            {/* Hospital Staff Action Bar */}
            {(isHospitalStaff || isAdmin) && referral.status === 'Pending' && (
              <>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => setShowRejectModal(true)}
                  className="btn-danger text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('Accepted')}
                  className="btn-success text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Referral</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Transit Countdown Widget if in Transfer status */}
        {referral.status === 'Transfer' && (
          <div className="my-6">
            <AmbulanceTransferTracker
              referral={referral}
              allottedSeconds={15}
              autoComplete={true}
              onComplete={() =>
                handleStatusChange(
                  'Completed',
                  `Patient arrived safely at ${referral.selectedHospital?.name || 'hospital'}. Checked into ${referral.requiredBed || 'ICU'} Wing Bed #${Math.floor(1 + Math.random() * 12)}.`
                )
              }
            />
          </div>
        )}

        {/* Milestone Timeline */}
        <div className="my-4">
          <ReferralTimeline timeline={referral.timeline} currentStatus={referral.status} />
        </div>
      </div>

      {/* Rejection Alert Banner & Alternative Matches (Section 28) */}
      {referral.status === 'Rejected' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-900">
                Referral Declined by {referral.selectedHospital?.name || 'Hospital'}
              </h3>
              <p className="text-xs text-red-700 mt-1">
                Reason given: <span className="font-semibold">{referral.rejectionReason || 'Bed/Specialist capacity unavailable.'}</span>
              </p>
            </div>
          </div>

          {/* Section 28: Alternative Recommendations */}
          <div className="mt-5 pt-4 border-t border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                Here are your next best matches:
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alternatives.map((alt) => {
                const h = alt.hospital;
                return (
                  <div key={h._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-sm text-navy">{h.name}</h5>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-primary" />
                            {h.address}, {h.city} • {alt.distanceKm} km away
                          </div>
                        </div>
                        <span className="text-base font-extrabold text-primary">{alt.matchScore}%</span>
                      </div>

                      <div className="mt-2 text-xs space-y-1">
                        <div className="text-emerald-700 font-medium">
                          ✓ {referral.requiredBed} Bed: {alt.availableBedsCount} available
                        </div>
                        <div className="text-slate-600">
                          ✓ Specialist: {h.specialists?.[referral.requiredSpecialist.toLowerCase()]?.status || 'Available'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem(
                            'activeReferralQuery',
                            JSON.stringify({
                              patientReference: referral.patientReference,
                              patientAge: referral.patientAge,
                              patientGender: referral.patientGender,
                              emergencyLevel: referral.emergencyLevel,
                              requiredBed: referral.requiredBed,
                              requiredSpecialist: referral.requiredSpecialist,
                              requiredFacilities: referral.requiredFacilities,
                              notes: referral.notes,
                            })
                          );
                          navigate('/doctor/find-hospitals');
                        }}
                        className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1"
                      >
                        <span>Dispatch to this Hospital</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Requirements & Hospital Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Patient & Requirement Information */}
        <div className="card space-y-3 text-xs">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-primary" />
            Patient Requirements
          </h3>

          <div className="flex justify-between">
            <span className="text-slate-500">Patient Reference:</span>
            <span className="font-bold text-navy">{referral.patientReference}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Demographics:</span>
            <span className="font-semibold text-navy">{referral.patientAge} years, {referral.patientGender}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Requested Bed:</span>
            <span className="font-bold text-primary">{referral.requiredBed} Bed</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Requested Specialist:</span>
            <span className="font-semibold text-navy">{referral.requiredSpecialist}</span>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Required Facilities:</span>
            <div className="flex flex-wrap gap-1">
              {referral.requiredFacilities.map((f, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-50 text-primary rounded font-semibold text-[11px]">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-500 block mb-1">Doctor's Clinical Notes:</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
              {referral.notes || 'No notes provided.'}
            </p>
          </div>
        </div>

        {/* Assigned Hospital Information */}
        <div className="card space-y-3 text-xs">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-primary" />
            Receiving Facility Desk
          </h3>

          <div className="flex justify-between">
            <span className="text-slate-500">Hospital:</span>
            <span className="font-bold text-navy">{referral.selectedHospital?.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Classification:</span>
            <span className="font-semibold text-navy">{referral.selectedHospital?.hospitalType}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Location:</span>
            <span className="font-medium text-slate-700">{referral.selectedHospital?.address}, {referral.selectedHospital?.city}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Emergency Contact:</span>
            <span className="font-semibold text-primary">{referral.selectedHospital?.phone}</span>
          </div>

          {/* Section 30: Document Sharing */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-navy mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-secondary" />
              Attached Medical Reports (Simulated)
            </h4>
            <div className="space-y-1.5">
              {referral.documents?.map((doc, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-navy">{doc.name}</div>
                    <div className="text-[10px] text-slate-400">{doc.fileType} • {doc.size}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Simulated downloading secure report: ${doc.name}`)}
                    className="p-1 text-primary hover:bg-blue-50 rounded"
                    title="View Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-navy mb-2">Decline Referral Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please state clinical reason for declining so the referring doctor can redirect to alternative hospitals.
            </p>
            <textarea
              rows="3"
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g. ICU beds 100% full, catheterization lab undergoing maintenance..."
              className="input-field text-xs mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => handleStatusChange('Rejected', rejectionNote)}
                className="btn-danger text-xs px-4 py-2"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      <HealthcareDisclaimer compact={true} />
    </div>
  );
};

export default ReferralDetails;
