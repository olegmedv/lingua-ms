using LinguaCMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinguaCMS.Data.Configurations;

public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
    public void Configure(EntityTypeBuilder<LessonProgress> builder)
    {
        builder.HasKey(p => p.Id);
        builder.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId);
        builder.HasOne(p => p.Lesson).WithMany().HasForeignKey(p => p.LessonId);
    }
}
