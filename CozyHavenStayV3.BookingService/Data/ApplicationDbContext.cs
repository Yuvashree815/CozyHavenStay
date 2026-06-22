using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.BookingService.Models;

namespace CozyHavenStayV3.BookingService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<BookingGuest> BookingGuests { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Booking>(b =>
            {
                b.ToTable("Bookings");
                b.HasKey(x => x.Id);

                b.Property(x => x.BaseFare).HasColumnType("decimal(10,2)");
                b.Property(x => x.SurchargeAmount).HasColumnType("decimal(10,2)");
                b.Property(x => x.TotalFare).HasColumnType("decimal(10,2)");

                b.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                b.HasMany(x => x.Guests)
                    .WithOne(g => g.Booking)
                    .HasForeignKey(g => g.BookingId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne(x => x.Payment)
                    .WithOne(p => p.Booking)
                    .HasForeignKey<Payment>(p => p.BookingId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<BookingGuest>(b =>
            {
                b.ToTable("BookingGuests");
                b.HasKey(x => x.Id);
            });

            builder.Entity<Payment>(b =>
            {
                b.ToTable("Payments");
                b.HasKey(x => x.Id);

                b.Property(x => x.Amount).HasColumnType("decimal(10,2)");

                b.Property(x => x.Method)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                b.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                b.Property(x => x.TransactionReference).HasMaxLength(100);
            });
        }
    }
}