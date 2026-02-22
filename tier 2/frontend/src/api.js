import axios from 'axios';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000/api`;

export const getSoilData = async (farmerId) => {
    const response = await axios.get(`${API_BASE}/soil-data?farmer_id=${farmerId}`);
    return response.data;
};

export const getPredictCrop = async (farmerId) => {
    const response = await axios.get(`${API_BASE}/predict-crop?farmer_id=${farmerId}`);
    return response.data;
};

export const getFertilizer = async (farmerId) => {
    const response = await axios.get(`${API_BASE}/fertilizer?farmer_id=${farmerId}`);
    return response.data;
};

export const getDisasterAlerts = async (farmerId) => {
    const response = await axios.get(`${API_BASE}/disaster-alerts?farmer_id=${farmerId}`);
    return response.data;
};

export const getDssInsight = async (farmerId) => {
    const response = await axios.get(`${API_BASE}/dss-insight?farmer_id=${farmerId}`);
    return response.data;
};

export const getDssCustomCropInsight = async (farmerId, targetCrop) => {
    const response = await axios.get(`${API_BASE}/dss-custom-crop-insight?farmer_id=${farmerId}&target_crop=${targetCrop}`);
    return response.data;
};

export const registerFarmer = async (farmerData) => {
    const response = await axios.post(`${API_BASE}/farmer-register`, farmerData);
    return response.data;
};

export const loginFarmer = async (phone) => {
    const response = await axios.post(`${API_BASE}/login`, { phone });
    return response.data;
};
