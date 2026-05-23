using LinguaCMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinguaCMS.Data.Configurations;

public class UserStatsConfiguration : IEntityTypeConfiguration<UserStats>
{
    public void Configure(EntityTypeBuilder<UserStats> builder)
    {
        builder.HasKey(s => s.UserId);
        builder.HasOne(s => s.User).WithOne().HasForeignKey<UserStats>(s => s.UserId);
    }
}
