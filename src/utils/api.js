import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://vitto-lending-backend.onrender.com/api';

export const submitApplication = async (data) => {
  const response = await axios.post(`${API_BASE}/apply`, data);
  return response.data;
};
