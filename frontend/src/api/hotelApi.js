import axiosInstance from './axiosInstance';

export const searchHotelsApi = (location, pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`/hotel/api/v1/hotels/search?location=${location}&pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getHotelByIdApi = (id) =>
  axiosInstance.get(`/hotel/api/v1/hotels/${id}`);

export const getMyHotelsApi = () =>
  axiosInstance.get('/hotel/api/v1/hotels/my-hotels');

export const getAllHotelsAdminApi = (pageNumber = 1, pageSize = 10) =>
  axiosInstance.get(`/hotel/api/v1/hotels?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const createHotelApi = (data) =>
  axiosInstance.post('/hotel/api/v1/hotels', data);

export const updateHotelApi = (id, data) =>
  axiosInstance.put(`/hotel/api/v1/hotels/${id}`, data);

export const deactivateHotelApi = (id) =>
  axiosInstance.delete(`/hotel/api/v1/hotels/${id}`);

export const getRoomsByHotelApi = (hotelId) =>
  axiosInstance.get(`/hotel/api/v1/hotels/${hotelId}/rooms`);

export const getAvailableRoomsApi = (hotelId, checkIn, checkOut) =>
  axiosInstance.get(`/hotel/api/v1/hotels/${hotelId}/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}`);

export const getRoomByIdApi = (id) =>
  axiosInstance.get(`/hotel/api/v1/rooms/${id}`);

export const createRoomApi = (hotelId, data) =>
  axiosInstance.post(`/hotel/api/v1/hotels/${hotelId}/rooms`, data);

export const updateRoomApi = (id, data) =>
  axiosInstance.put(`/hotel/api/v1/rooms/${id}`, data);

export const deleteRoomApi = (id) =>
  axiosInstance.delete(`/hotel/api/v1/rooms/${id}`);

export const calculateFareApi = (roomId, data) =>
  axiosInstance.post(`/hotel/api/v1/rooms/${roomId}/calculate-fare`, data);

export const filterHotelsApi = (params) => {
  const query = new URLSearchParams();
  if (params.location) query.append('location', params.location);
  if (params.hasFreeWifi) query.append('hasFreeWifi', true);
  if (params.hasDining) query.append('hasDining', true);
  if (params.hasParking) query.append('hasParking', true);
  if (params.hasSwimmingPool) query.append('hasSwimmingPool', true);
  if (params.hasFitnessCenter) query.append('hasFitnessCenter', true);
  if (params.hasRoomService) query.append('hasRoomService', true);
  if (params.pageNumber) query.append('pageNumber', params.pageNumber);
  if (params.pageSize) query.append('pageSize', params.pageSize);
  return axiosInstance.get(`/hotel/api/v1/hotels/filter?${query.toString()}`);
};