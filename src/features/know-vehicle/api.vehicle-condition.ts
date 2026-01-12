import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const upsertVehicleCondition = async (payload) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_BASE_URL}/vehicle-condition`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const verifyVehicleCondition = async (vehicleNumber) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/vehicle-condition/${vehicleNumber}/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
