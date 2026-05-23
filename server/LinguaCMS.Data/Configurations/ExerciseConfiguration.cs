using LinguaCMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinguaCMS.Data.Configurations;

public class ExerciseConfiguration : IEntityTypeConfiguration<Exercise>
{
    public void Configure(EntityTypeBuilder<Exercise> builder)
    {
        builder.HasKey(ex => ex.Id);
        builder.Property(ex => ex.ContentJson).IsRequired();
        builder.HasOne(ex => ex.Lesson).WithMany(l => l.Exercises).HasForeignKey(ex => ex.LessonId);
    }
}
