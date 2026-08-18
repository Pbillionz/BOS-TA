import api from './api';

// Register a new student
export const registerStudent = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login student
export const loginStudent = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// Verify email
export const verifyEmail = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Logout
export const logoutStudent = async () => {
  localStorage.removeItem('token');
  return api.post('/auth/logout');
};

// Update student profile
export const updateStudentProfile = async (studentId, profileData) => {
  const response = await api.put(`/students/${studentId}`, profileData);
  return response.data;
};

// Get student profile
export const getStudentProfile = async (studentId) => {
  const response = await api.get(`/students/${studentId}`);
  return response.data;
};

// Get all mentors
export const getAllMentors = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await api.get(`/mentors${queryParams ? '?' + queryParams : ''}`);
  return response.data;
};

// Get mentor details
export const getMentorDetails = async (mentorId) => {
  const response = await api.get(`/mentors/${mentorId}`);
  return response.data;
};

// Get user applications
export const getUserApplications = async (role = 'student') => {
  const response = await api.get(`/applications?role=${role}`);
  return response.data;
};

// Submit mentorship application
export const submitApplication = async (applicationData) => {
  const response = await api.post('/applications', applicationData);
  return response.data;
};

// Get application details
export const getApplicationDetails = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}`);
  return response.data;
};

// Respond to application (mentor)
export const respondToApplication = async (applicationId, response) => {
  const result = await api.put(`/applications/${applicationId}`, response);
  return result.data;
};

// Cancel application
export const cancelApplication = async (applicationId) => {
  const response = await api.delete(`/applications/${applicationId}`);
  return response.data;
};
