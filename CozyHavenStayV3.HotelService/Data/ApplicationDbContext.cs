using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.HotelService.Models;

namespace CozyHavenStayV3.HotelService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Hotel> Hotels { get; set; } = null!;
        public DbSet<Room> Rooms { get; set; } = null!;
        public DbSet<RoomBlock> RoomBlocks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Hotel>(b =>
            {
                b.ToTable("Hotels");
                b.HasKey(h => h.Id);

                b.Property(h => h.Name).HasMaxLength(150).IsRequired();
                b.Property(h => h.Location).HasMaxLength(200).IsRequired();
                b.Property(h => h.Description).HasMaxLength(1000);

                b.HasMany(h => h.Rooms)
                    .WithOne(r => r.Hotel)
                    .HasForeignKey(r => r.HotelId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Room>(b =>
            {
                b.ToTable("Rooms");
                b.HasKey(r => r.Id);

                b.Property(r => r.RoomSize).HasMaxLength(50).IsRequired();
                b.Property(r => r.BaseFare).HasColumnType("decimal(10,2)");

               
                b.Property(r => r.BedType)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                b.HasMany(r => r.RoomBlocks)
                    .WithOne(rb => rb.Room)
                    .HasForeignKey(rb => rb.RoomId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<RoomBlock>(b =>
            {
                b.ToTable("RoomBlocks");
                b.HasKey(rb => rb.Id);

                b.Property(rb => rb.Source)
                    .HasConversion<string>()
                    .HasMaxLength(20);
            });
        }
    }
}