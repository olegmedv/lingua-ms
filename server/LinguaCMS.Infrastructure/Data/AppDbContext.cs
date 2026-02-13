using LinguaCMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LinguaCMS.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<LessonProgress> LessonProgress => Set<LessonProgress>();
    public DbSet<UserStats> UserStats => Set<UserStats>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
            e.Property(u => u.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Language>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<Lesson>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Title).IsRequired().HasMaxLength(200);
            e.HasOne(l => l.Language).WithMany(la => la.Lessons).HasForeignKey(l => l.LanguageId);
        });

        modelBuilder.Entity<Exercise>(e =>
        {
            e.HasKey(ex => ex.Id);
            e.Property(ex => ex.ContentJson).IsRequired();
            e.HasOne(ex => ex.Lesson).WithMany(l => l.Exercises).HasForeignKey(ex => ex.LessonId);
        });

        modelBuilder.Entity<LessonProgress>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId);
            e.HasOne(p => p.Lesson).WithMany().HasForeignKey(p => p.LessonId);
        });

        modelBuilder.Entity<UserStats>(e =>
        {
            e.HasKey(s => s.UserId);
            e.HasOne(s => s.User).WithOne().HasForeignKey<UserStats>(s => s.UserId);
        });
    }
}
