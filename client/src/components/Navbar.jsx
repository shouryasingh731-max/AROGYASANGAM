import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLowData } from '../context/LowDataContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Activity,
  LogOut,
  UserRound,
  Menu,
  X,
  Stethoscope,
  Building2,
  ShieldCheck,
  Search,
  PlusCircle,
  FileText,
  Bed,
  Zap,
  Ambulance,
  Languages,
  Wifi,
  WifiOff,
  HeartHandshake,
  FlaskConical,
  Pill,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isDoctor, isHospital, isAdmin, isFrontlineWorker } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { lowDataMode, toggleLowDataMode, isOnline } = useLowData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Determine home path by role
  const getHomePath = () => {
    if (!user) return '/';
    if (isFrontlineWorker) return '/frontline';
    if (isDoctor) return '/doctor';
    if (isHospital) return '/hospital';
    if (isAdmin) return '/admin';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
      {/* Top micro banner for Demo Mode & Connectivity */}
      <div className="bg-slate-900 text-white text-[11px] px-4 py-1 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t('demoMode')}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden md:inline">
            Public-Health Referral & Access Coordination Network
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connectivity Status */}
          <span className="flex items-center gap-1 text-[11px] text-slate-300">
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Offline Cache Active</span>
              </>
            )}
          </span>

          {/* Low Data Mode Toggle */}
          <button
            type="button"
            onClick={toggleLowDataMode}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold transition-all ${
              lowDataMode
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle lightweight data mode for rural / low bandwidth connectivity"
          >
            {lowDataMode ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            <span>{lowDataMode ? t('lowDataActive') : t('lowDataMode')}</span>
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-primary text-white hover:bg-primary-600 transition-colors"
            title="Toggle English / Hindi (हिन्दी)"
          >
            <Languages className="w-3 h-3" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={getHomePath()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-blue-600 to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:scale-105 group-hover:shadow-primary/40 transition-all duration-200">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-tight text-navy group-hover:text-primary transition-colors">
                  AROGYA
                </span>
                <span className="text-xl font-black tracking-tight text-secondary">
                  SANGAM
                </span>
              </div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500 -mt-1 hidden sm:flex items-center gap-1">
                <span>{t('brandSubtitle')}</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1">
              {/* Frontline Health Worker Nav */}
              {isFrontlineWorker && (
                <>
                  <Link
                    to="/frontline"
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/frontline')
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>Frontline Desk</span>
                  </Link>
                  <Link
                    to="/doctor/create-referral"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/doctor/create-referral')
                        ? 'bg-primary text-white font-bold'
                        : 'bg-primary-50 text-primary hover:bg-primary-100 font-bold'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('navNewReferral')}</span>
                  </Link>
                  <Link
                    to="/doctor/find-hospitals"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/doctor/find-hospitals')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>{t('navFindFacilities')}</span>
                  </Link>
                  <Link
                    to="/doctor/referrals"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor/referrals')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    {t('navMyReferrals')}
                  </Link>
                </>
              )}

              {/* Doctor Nav */}
              {isDoctor && !isFrontlineWorker && (
                <>
                  <Link
                    to="/doctor"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    {t('navDashboard')}
                  </Link>
                  <Link
                    to="/doctor/create-referral"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/doctor/create-referral')
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-primary-50 text-primary hover:bg-primary-100 font-semibold'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('navNewReferral')}</span>
                  </Link>
                  <Link
                    to="/doctor/find-hospitals"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/doctor/find-hospitals')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>{t('navFindFacilities')}</span>
                  </Link>
                  <Link
                    to="/doctor/referrals"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/doctor/referrals')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    {t('navMyReferrals')}
                  </Link>
                </>
              )}

              {/* Facility Nav */}
              {isHospital && (
                <>
                  <Link
                    to="/hospital"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/hospital')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    {t('navDashboard')}
                  </Link>
                  <Link
                    to="/hospital/referrals"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/hospital/referrals')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    {t('navIncomingTriage')}
                  </Link>
                  <Link
                    to="/hospital/beds"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/hospital/beds')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <Bed className="w-4 h-4" />
                    <span>{t('resBeds')}</span>
                  </Link>
                  <Link
                    to="/hospital/diagnostics"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/hospital/diagnostics')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>{t('resDiagnostics')}</span>
                  </Link>
                  <Link
                    to="/hospital/medicines"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/hospital/medicines')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <Pill className="w-4 h-4" />
                    <span>{t('resMedicines')}</span>
                  </Link>
                </>
              )}

              {/* Admin Nav */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    {t('navDashboard')}
                  </Link>
                  <Link
                    to="/admin/verify-hospitals"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/verify-hospitals')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Facilities</span>
                  </Link>
                  <Link
                    to="/admin/referrals"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/referrals')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    All Referrals
                  </Link>
                  <Link
                    to="/admin/doctors"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/doctors')
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    Health Workers & Doctors
                  </Link>
                </>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/doctor/find-hospitals" className="text-sm font-medium text-slate-600 hover:text-navy">
                Search Healthcare Facilities
              </Link>
              <Link to="/live-automation" className="text-sm font-medium text-slate-600 hover:text-navy">
                Referral Automation Demo
              </Link>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Live Emergency Referral Automation Link */}
            <Link
              to="/live-automation"
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm ${
                isActive('/live-automation')
                  ? 'bg-primary text-white border-primary shadow-primary/30'
                  : 'bg-gradient-to-r from-blue-50 to-teal-50 text-navy border-blue-200 hover:border-primary/40 hover:bg-blue-100/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Scenario Demo</span>
              <span className="sm:hidden">Demo</span>
            </Link>

            {user ? (
              <>
                <NotificationDropdown />

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                {/* User Pill */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-navy font-bold text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-navy truncate max-w-[140px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {user.frontlineDesignation || user.role} {user.hospitalName && `• ${user.hospitalName}`}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs px-3.5 py-2">
                  {t('navLogin')}
                </Link>
                <Link to="/register" className="btn-primary text-xs px-3.5 py-2">
                  {t('navRegister')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-navy hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2">
          {user ? (
            <>
              {isFrontlineWorker && (
                <>
                  <Link
                    to="/frontline"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-800"
                  >
                    Frontline Health Worker Dashboard
                  </Link>
                  <Link
                    to="/doctor/create-referral"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-primary"
                  >
                    + Create New Referral
                  </Link>
                  <Link
                    to="/doctor/find-hospitals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Find Facilities & Diagnostics
                  </Link>
                  <Link
                    to="/doctor/referrals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    My Referrals
                  </Link>
                </>
              )}

              {isDoctor && !isFrontlineWorker && (
                <>
                  <Link
                    to="/doctor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Doctor Dashboard
                  </Link>
                  <Link
                    to="/doctor/create-referral"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-primary"
                  >
                    + Create Referral
                  </Link>
                  <Link
                    to="/doctor/find-hospitals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Search Healthcare Facilities
                  </Link>
                  <Link
                    to="/doctor/referrals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    My Referrals
                  </Link>
                </>
              )}

              {isHospital && (
                <>
                  <Link
                    to="/hospital"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Facility Dashboard
                  </Link>
                  <Link
                    to="/hospital/referrals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Incoming Triage
                  </Link>
                  <Link
                    to="/hospital/beds"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Update Beds
                  </Link>
                  <Link
                    to="/hospital/diagnostics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Update Diagnostics
                  </Link>
                  <Link
                    to="/hospital/medicines"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Update Medicines
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/verify-hospitals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    Verify Facilities
                  </Link>
                  <Link
                    to="/admin/referrals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700"
                  >
                    All Referrals
                  </Link>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-bold text-navy">{user.name}</div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-rose-600 font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary w-full text-center text-xs py-2.5 block"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center text-xs py-2.5 block"
              >
                Register Portal Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
