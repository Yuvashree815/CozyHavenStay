using Microsoft.EntityFrameworkCore;
using CozyHavenStayV3.IdentityService.Models;

namespace CozyHavenStayV3.IdentityService.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>(b =>
            {
                b.ToTable("Users");

                b.HasKey(u => u.Id);

                b.Property(u => u.FullName).HasMaxLength(150).IsRequired();
                b.Property(u => u.Email).HasMaxLength(256).IsRequired();
                b.Property(u => u.PasswordHash).IsRequired();
                b.Property(u => u.Gender).HasMaxLength(20).IsRequired();
                b.Property(u => u.PhoneNumber).HasMaxLength(20).IsRequired();
                b.Property(u => u.Address).HasMaxLength(300).IsRequired();

                b.HasIndex(u => u.Email).IsUnique();

                b.HasOne(u => u.Role)
                    .WithMany(r => r.Users)
                    .HasForeignKey(u => u.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<Role>(b =>
            {
                b.ToTable("Roles");

                b.HasKey(r => r.Id);

                b.Property(r => r.Name).HasMaxLength(50).IsRequired();
                b.HasIndex(r => r.Name).IsUnique();

                
                b.HasData(
                    new Role { Id = 1, Name = "User", Description = "User role for CozyHavenStayV3" },
                    new Role { Id = 2, Name = "HotelOwner", Description = "HotelOwner role for CozyHavenStayV3" },
                    new Role { Id = 3, Name = "Admin", Description = "Admin role for CozyHavenStayV3" }
                );
            });
        }
    }
}