using LinguaCMS.Application.Auth.Commands;
using LinguaCMS.Data;
using LinguaCMS.Domain.Entities;
using LinguaCMS.Infrastructure.Services;
using NetArchTest.Rules;
using Xunit;

namespace LinguaCMS.ArchitectureTests;

public class ProjectDependencyTests
{
    [Fact]
    public void Domain_does_not_depend_on_any_internal_project()
    {
        var result = Types.InAssembly(typeof(AppUser).Assembly)
            .Should()
            .NotHaveDependencyOnAny("LinguaCMS.Data", "LinguaCMS.Application", "LinguaCMS.Infrastructure", "LinguaCMS.API")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Data_depends_only_on_Domain_among_internal_projects()
    {
        var result = Types.InAssembly(typeof(AppDbContext).Assembly)
            .Should()
            .NotHaveDependencyOnAny("LinguaCMS.Application", "LinguaCMS.Infrastructure", "LinguaCMS.API")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Application_does_not_depend_on_Infrastructure_or_API()
    {
        var result = Types.InAssembly(typeof(RegisterCommand).Assembly)
            .Should()
            .NotHaveDependencyOnAny("LinguaCMS.Infrastructure", "LinguaCMS.API")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Infrastructure_does_not_depend_on_API()
    {
        var result = Types.InAssembly(typeof(JwtTokenService).Assembly)
            .Should()
            .NotHaveDependencyOn("LinguaCMS.API")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    private static string Format(TestResult result) =>
        result.FailingTypes is null
            ? "(no failing types reported)"
            : string.Join(", ", result.FailingTypes.Select(t => t.FullName));
}
