import axiosInstance from './axiosInstance';

export const createBookingApi = (data) =>
  axiosInstance.post('/booking/api/v1/bookings', data);

export const getBookingByIdApi = (id) =>
  axiosInstance.get(`/booking/api/v1/bookings/${id}`);

export const getMyBookingsApi = (pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`/booking/api/v1/bookings/my-bookings?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const cancelBookingApi = (id) =>
  axiosInstance.post(`/booking/api/v1/bookings/${id}/cancel`);

export const getRefundPolicyApi = (id) =>
  axiosInstance.get(`/booking/api/v1/bookings/${id}/refund-policy`);

export const getHotelBookingsApi = (hotelId) =>
  axiosInstance.get(`/booking/api/v1/bookings/hotel/${hotelId}`);

export const getPendingRefundsApi = () =>
  axiosInstance.get('/booking/api/v1/bookings/pending-refunds');

export const approveRefundApi = (id) =>
  axiosInstance.post(`/booking/api/v1/bookings/${id}/approve-refund`);