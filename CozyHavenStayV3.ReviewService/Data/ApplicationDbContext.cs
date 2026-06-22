using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.ReviewService.Models;

namespace CozyHavenStayV3.ReviewService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Review> Reviews { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Review>(b =>
            {
                b.ToTable("Reviews");
                b.HasKey(r => r.Id);

                b.Property(r => r.Comment).HasMaxLength(1000);

                
                b.HasIndex(r => r.BookingId).IsUnique();
            });
        }
    }
}