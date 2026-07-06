import axiosInstance from './axiosInstance';

export const createReviewApi = (data) =>
  axiosInstance.post('/review/api/v1/reviews', data);

export const getHotelReviewsApi = (hotelId, pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`/review/api/v1/reviews/hotel/${hotelId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getHotelRatingSummaryApi = (hotelId) =>
  axiosInstance.get(`/review/api/v1/reviews/hotel/${hotelId}/summary`);