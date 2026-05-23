using LinguaCMS.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Xunit;

namespace LinguaCMS.ArchitectureTests;

public class DataLocationTests
{
    private const string DataAssemblyName = "LinguaCMS.Data";

    [Fact]
    public void AppDbContext_lives_in_Data_assembly()
    {
        Assert.Equal(DataAssemblyName, typeof(AppDbContext).Assembly.GetName().Name);
    }

    [Fact]
    public void EF_configurations_live_in_Data_assembly()
    {
        var configs = typeof(AppDbContext).Assembly
            .GetTypes()
            .Where(t => t.GetInterfaces().Any(i =>
                i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)))
            .ToList();

        Assert.NotEmpty(configs);
        Assert.All(configs, c => Assert.Equal(DataAssemblyName, c.Assembly.GetName().Name));
    }

    [Fact]
    public void Migrations_live_in_Data_assembly()
    {
        var migrations = typeof(AppDbContext).Assembly
            .GetTypes()
            .Where(t => typeof(Migration).IsAssignableFrom(t) && !t.IsAbstract)
            .ToList();

        Assert.NotEmpty(migrations);
        Assert.All(migrations, m => Assert.Equal(DataAssemblyName, m.Assembly.GetName().Name));
    }
}
