import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Stethoscope, Building2, AlertCircle, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import HealthcareDisclaimer from '../components/HealthcareDisclaimer';

const Register = () => {
  const [role, setRole] = useState('doctor'); // 'doctor', 'frontline_health_worker', or 'hospital'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    professionalId: '',
    specialization: 'General Physician',
    frontlineDesignation: 'ASHA',
    hospitalName: '',
    facilityType: 'Sub-Centre',
    address: '',
    city: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    hospitalType: 'District Hospital',
    latitude: '26.8500',
    longitude: '80.9500',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);

    try {
      const payload = {
        name: role === 'hospital' ? formData.hospitalName : formData.name,
        email: formData.email,
        password: formData.password,
        role,
        phone: formData.phone,
        professionalId: formData.professionalId,
        specialization: formData.specialization,
        frontlineDesignation: formData.frontlineDesignation,
        hospitalName: formData.hospitalName,
        facilityType: role === 'hospital' ? (formData.facilityType || formData.hospitalType) : formData.facilityType,
        address: formData.address,
        city: formData.city,
        district: formData.district || formData.city,
        state: formData.state,
        hospitalType: formData.hospitalType,
        coordinates: [parseFloat(formData.longitude) || 80.9462, parseFloat(formData.latitude) || 26.8467],
      };

      const user = await register(payload);
      if (user.role === 'doctor') {
        navigate('/doctor');
      } else if (user.role === 'frontline_health_worker') {
        navigate('/frontline');
      } else {
        navigate('/hospital');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary items-center justify-center text-white shadow-md shadow-primary/20 mb-3">
          <Activity className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-navy tracking-tight">
          Create Portal Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Join the verified AROGYASANGAM public health coordination network
        </p>

        {/* Role Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 w-full max-w-lg">
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'doctor'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setRole('frontline_health_worker')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'frontline_health_worker'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Frontline Worker
            </button>
            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'hospital'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Healthcare Facility
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-card border border-slate-200">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {role === 'hospital' && (
            <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Verification Notice:</span> New healthcare facility accounts are registered in "Pending Verification" status until medical administration approval.
              </div>
            </div>
          )}

          {role === 'frontline_health_worker' && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Frontline Health Access:</span> ASHA, ANM, and CHO workers receive a streamlined coordination interface for rural referrals and resource checks.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'doctor' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Doctor's Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. Arjun Mehta"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Professional Medical ID / Registration #
                    </label>
                    <input
                      type="text"
                      name="professionalId"
                      required
                      value={formData.professionalId}
                      onChange={handleChange}
                      placeholder="MCI-UP-98765"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Specialization
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Surgeon">General Surgeon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Clinic / Hospital Affiliation
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="Demo City Medical Center"
                    className="input-field"
                  />
                </div>
              </>
            )}

            {role === 'frontline_health_worker' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Worker's Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Smt. Asha Devi"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cadre / Designation
                    </label>
                    <select
                      name="frontlineDesignation"
                      value={formData.frontlineDesignation}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="ASHA">ASHA (Accredited Social Health Activist)</option>
                      <option value="ANM">ANM (Auxiliary Nurse Midwife)</option>
                      <option value="CHO">CHO (Community Health Officer)</option>
                      <option value="MPHW">Multi-Purpose Health Worker</option>
                      <option value="Health Assistant">Health Assistant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned District
                    </label>
                    <input
                      type="text"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="Lucknow"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Affiliated Health Centre / Post
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    required
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="Chinhat Sub-Centre / Malihabad PHC"
                    className="input-field"
                  />
                </div>
              </>
            )}

            {role === 'hospital' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Healthcare Facility Name
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    required
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="CityCare Multispeciality Hospital"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Public Health Hierarchy Tier
                    </label>
                    <select
                      name="facilityType"
                      value={formData.facilityType}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="Sub-Centre">Sub-Centre (First Contact)</option>
                      <option value="PHC">PHC (Primary Health Centre)</option>
                      <option value="Rural Hospital">Rural Hospital / CHC</option>
                      <option value="District Hospital">District Hospital (Secondary)</option>
                      <option value="Specialized Hospital">Specialized Hospital (Tertiary)</option>
                      <option value="Multispeciality Hospital">Multispeciality Hospital</option>
                      <option value="Emergency Hospital">Emergency Hospital / Trauma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Sector 4, Gomti Nagar"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="26.8500"
                      className="input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="80.9500"
                      className="input-field text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@medical.org"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Registering organization...</span>
              ) : (
                <>
                  <span>Create {role === 'doctor' ? 'Doctor' : 'Hospital'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Already have an account?</span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In to Portal
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <HealthcareDisclaimer compact={true} />
        </div>
      </div>
    </div>
  );
};

export default Register;
