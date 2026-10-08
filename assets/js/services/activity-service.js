import { getState } from "./storage-service.js";
export const recentActivities = (limit = 10) => getState().activities.slice().sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, limit);
