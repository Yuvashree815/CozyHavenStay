import axiosInstance from './axiosInstance';

export const loginApi = (data) =>
  axiosInstance.post('/identity/api/v1/auth/login', data);

export const registerUserApi = (data) =>
  axiosInstance.post('/identity/api/v1/account/register/user', data);

export const registerHotelOwnerApi = (data) =>
  axiosInstance.post('/identity/api/v1/account/register/hotelowner', data);

export const getProfileApi = () =>
  axiosInstance.get('/identity/api/v1/account/profile');

export const updateProfileApi = (data) =>
  axiosInstance.put('/identity/api/v1/account/profile', data);

export const getAllUsersApi = (pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`/identity/api/v1/account/users?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const deactivateUserApi = (id) =>
  axiosInstance.delete(`/identity/api/v1/account/users/${id}`);

export const registerAdminApi = (data) =>
  axiosInstance.post('/identity/api/v1/account/register/admin', data);

export const forgotPasswordApi = (data) =>
  axiosInstance.post('/identity/api/v1/auth/forgot-password', data);

export const resetPasswordApi = (data) =>
  axiosInstance.post('/identity/api/v1/auth/reset-password', data);