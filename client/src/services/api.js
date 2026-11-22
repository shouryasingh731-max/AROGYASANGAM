import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and redirect to login if not already on login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const hospitalAPI = {
  getAll: (params) => api.get('/facilities', { params }),
  getById: (id) => api.get(`/facilities/${id}`),
  getNearby: (params) => api.get('/facilities/nearby', { params }),
  search: (params) => api.get('/facilities/search', { params }),
  getTypes: () => api.get('/facilities/types'),
  updateBeds: (id, bedsData) => api.put(`/facilities/${id}/beds`, bedsData),
  updateFacilities: (id, facilitiesData) => api.put(`/facilities/${id}/facilities`, facilitiesData),
  updateDiagnostics: (id, diagnosticsData) => api.put(`/facilities/${id}/diagnostics`, diagnosticsData),
  updateMedicines: (id, medicinesData) => api.put(`/facilities/${id}/medicines`, medicinesData),
  updateSpecialists: (id, specialistsData) => api.put(`/facilities/${id}/specialists`, specialistsData),
  updateProfile: (id, profileData) => api.put(`/facilities/${id}`, profileData),
};

export const facilityAPI = hospitalAPI;

export const matchingAPI = {
  matchHospitals: (requirements) => api.post('/matching/facilities', requirements),
  matchFacilities: (requirements) => api.post('/matching/facilities', requirements),
};

export const referralAPI = {
  create: (referralData) => api.post('/referrals', referralData),
  getDoctorReferrals: (params) => api.get('/referrals/doctor', { params }),
  getMyReferrals: (params) => api.get('/referrals/my', { params }),
  getHospitalReferrals: (params) => api.get('/referrals/hospital', { params }),
  getById: (id) => api.get(`/referrals/${id}`),
  updateStatus: (id, statusData) => api.put(`/referrals/${id}/status`, statusData),
};

export const patientAPI = {
  getById: (id) => api.get(`/patients/${id}`),
  getReferrals: (id) => api.get(`/patients/${id}/referrals`),
  createOrUpdate: (data) => api.post('/patients', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getHospitals: (params) => api.get('/admin/hospitals', { params }),
  verifyHospital: (id, action) => api.put(`/admin/hospitals/${id}/verify`, { action }),
  getDoctors: () => api.get('/admin/doctors'),
  toggleDoctorStatus: (id) => api.put(`/admin/doctors/${id}/toggle`),
  getAllReferrals: (params) => api.get('/admin/referrals', { params }),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const simulationAPI = {
  autoGeneratePatient: (params) => api.post('/simulation/auto-patient', params),
  advanceStep: (referralId, data) => api.post(`/simulation/advance/${referralId}`, data),
  reroute: (referralId, data) => api.post(`/simulation/reroute/${referralId}`, data),
  getStatus: () => api.get('/simulation/status'),
};

export const trackingAPI = {
  getTracking: (referralId) => api.get(`/tracking/${referralId}`),
  updateLocation: (referralId, locationData) => api.put(`/tracking/${referralId}/location`, locationData),
  startSimulation: (referralId) => api.post(`/tracking/${referralId}/simulate/start`),
  pauseSimulation: (referralId) => api.post(`/tracking/${referralId}/simulate/pause`),
  stepSimulation: (referralId) => api.post(`/tracking/${referralId}/simulate/step`),
  resetSimulation: (referralId) => api.post(`/tracking/${referralId}/simulate/reset`),
};

export default api;
