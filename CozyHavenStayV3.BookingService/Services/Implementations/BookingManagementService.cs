using AutoMapper;
using log4net;
using CozyHavenStayV3.BookingService.Common;
using CozyHavenStayV3.BookingService.DTOs;
using CozyHavenStayV3.BookingService.DTOs.External;
using CozyHavenStayV3.BookingService.Models;
using CozyHavenStayV3.BookingService.Repositories.Interfaces;
using CozyHavenStayV3.BookingService.Services.Interfaces;

namespace CozyHavenStayV3.BookingService.Services.Implementations
{
    public class BookingManagementService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IPaymentService _paymentService;
        private readonly IHotelServiceClient _hotelServiceClient;
        private readonly IMapper _mapper;
        private static readonly ILog Log = LogManager.GetLogger(typeof(BookingManagementService));

        public BookingManagementService(
            IBookingRepository bookingRepository,
            IPaymentService paymentService,
            IHotelServiceClient hotelServiceClient,
            IMapper mapper)
        {
            _bookingRepository = bookingRepository;
            _paymentService = paymentService;
            _hotelServiceClient = hotelServiceClient;
            _mapper = mapper;
        }

        public async Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto)
        {
           
            var isAvailable = await _hotelServiceClient.CheckAvailabilityAsync(dto.RoomId, dto.CheckIn, dto.CheckOut);
            if (!isAvailable)
            {
                throw new InvalidOperationException("This room is not available for the selected dates.");
            }

            
            var fareRequest = new FareCalculationRequest
            {
                CheckIn = dto.CheckIn,
                CheckOut = dto.CheckOut,
                NumberOfAdults = dto.NumberOfAdults,
                NumberOfChildren = dto.NumberOfChildren,
                AllGuestAges = dto.GuestAges
            };
            var fare = await _hotelServiceClient.CalculateFareAsync(dto.RoomId, fareRequest);

            if (fare.ExceedsMaxOccupancy)
            {
                throw new InvalidOperationException("The number of guests exceeds this room's maximum occupancy.");
            }

            
            var booking = new Booking
            {
                UserId = userId,
                HotelId = dto.HotelId,
                RoomId = dto.RoomId,
                CheckIn = dto.CheckIn,
                CheckOut = dto.CheckOut,
                NumberOfAdults = dto.NumberOfAdults,
                NumberOfChildren = dto.NumberOfChildren,
                BaseFare = fare.BaseFare,
                SurchargeAmount = fare.SurchargeAmount,
                TotalFare = fare.TotalFare,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Guests = dto.GuestAges.Select(age => new BookingGuest { Age = age }).ToList()
            };

            await _bookingRepository.AddAsync(booking);
            Log.Info($"Booking {booking.Id} created (Pending) for user {userId}, room {dto.RoomId}.");

            
            var payment = await _paymentService.ProcessPaymentAsync(booking.Id, fare.TotalFare, (PaymentMethod)dto.PaymentMethod);

            
            try
            {
                await _hotelServiceClient.BlockRoomForBookingAsync(dto.RoomId, dto.CheckIn, dto.CheckOut, booking.Id);
            }
            catch (Exception ex)
            {
                
                Log.Error($"Room blocking failed for booking {booking.Id} after payment. Marking booking as Cancelled.", ex);
                booking.Status = BookingStatus.Cancelled;
                await _bookingRepository.UpdateAsync(booking);
                await _paymentService.MarkRefundPendingAsync(payment);
                throw new InvalidOperationException("Unable to confirm your room. Your payment will be refunded.");
            }

            
            booking.Status = BookingStatus.Confirmed;
            await _bookingRepository.UpdateAsync(booking);
            Log.Info($"Booking {booking.Id} confirmed for user {userId}.");

            var result = await _bookingRepository.GetByIdWithDetailsAsync(booking.Id);
            return _mapper.Map<BookingDto>(result);
        }

        public async Task<BookingDto> GetByIdAsync(int bookingId, int userId)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.UserId != userId)
            {
                throw new UnauthorizedAccessException("You do not have permission to view this booking.");
            }

            return _mapper.Map<BookingDto>(booking);
        }

        public async Task<PagedResult<BookingDto>> GetMyBookingsAsync(int userId, int pageNumber, int pageSize)
        {
            var totalCount = await _bookingRepository.CountByUserIdAsync(userId);
            var bookings = await _bookingRepository.GetByUserIdAsync(userId, pageNumber, pageSize);

            return new PagedResult<BookingDto>
            {
                Items = _mapper.Map<List<BookingDto>>(bookings),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<BookingDto> CancelBookingAsync(int bookingId, int userId)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.UserId != userId)
            {
                throw new UnauthorizedAccessException("You do not have permission to cancel this booking.");
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                throw new InvalidOperationException("This booking is already cancelled.");
            }

            booking.Status = BookingStatus.Cancelled;
            await _bookingRepository.UpdateAsync(booking);

            await _paymentService.MarkRefundPendingAsync(booking.Payment);

           
            await _hotelServiceClient.ReleaseBookingBlockAsync(booking.RoomId, booking.Id);

            Log.Info($"Booking {bookingId} cancelled by user {userId}. Refund pending.");

            return _mapper.Map<BookingDto>(booking);
        }

        public async Task<List<BookingDto>> GetByHotelIdAsync(int hotelId, int ownerId)
        {
            var isOwned = await _hotelServiceClient.IsHotelOwnedByAsync(hotelId, ownerId);
            if (!isOwned)
            {
                throw new UnauthorizedAccessException("You do not have permission to view bookings for this hotel.");
            }

            var bookings = await _bookingRepository.GetByHotelIdAsync(hotelId);
            return _mapper.Map<List<BookingDto>>(bookings);
        }
        public async Task<bool> VerifyCompletedStayAsync(int bookingId, int userId, int hotelId)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);

            if (booking is null) return false;
            if (booking.UserId != userId) return false;
            if (booking.HotelId != hotelId) return false;
            if (booking.Status != BookingStatus.Confirmed) return false;

            return true;
        }

        public async Task<List<BookingDto>> GetPendingRefundsAsync(int ownerId)
        {
            var ownedHotelIds = await _hotelServiceClient.GetOwnedHotelIdsAsync(ownerId);

            var allPendingRefunds = await _bookingRepository.GetCancelledWithPendingRefundsAsync();
            var ownedPendingRefunds = allPendingRefunds.Where(b => ownedHotelIds.Contains(b.HotelId)).ToList();

            return _mapper.Map<List<BookingDto>>(ownedPendingRefunds);
        }

        public async Task<BookingDto> ApproveRefundAsync(int bookingId, int ownerId)
        {
            var booking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            var isOwned = await _hotelServiceClient.IsHotelOwnedByAsync(booking.HotelId, ownerId);
            if (!isOwned)
            {
                throw new UnauthorizedAccessException("You do not have permission to approve refunds for this booking.");
            }

            await _paymentService.ApproveRefundAsync(bookingId);

            var updatedBooking = await _bookingRepository.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            return _mapper.Map<BookingDto>(updatedBooking);
        }
    }
}