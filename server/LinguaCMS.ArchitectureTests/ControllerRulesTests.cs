using LinguaCMS.API.Controllers;
using NetArchTest.Rules;
using Xunit;

namespace LinguaCMS.ArchitectureTests;

public class ControllerRulesTests
{
    // Controllers covered by completed thin-controller refactors (REF-015, 016, 017).
    // ExercisesController and FilesController are excluded until REF-018 and REF-019 land.
    private static readonly Type[] ThinControllers =
    {
        typeof(AuthController),
        typeof(LanguagesController),
        typeof(LessonsController),
        typeof(ProgressController)
    };

    [Fact]
    public void Thin_controllers_do_not_use_System_Security_Claims()
    {
        var result = Types.InAssembly(typeof(AuthController).Assembly)
            .That().HaveName(ThinControllers.Select(t => t.Name).ToArray())
            .Should()
            .NotHaveDependencyOn("System.Security.Claims")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Thin_controllers_do_not_use_System_IO()
    {
        var result = Types.InAssembly(typeof(AuthController).Assembly)
            .That().HaveName(ThinControllers.Select(t => t.Name).ToArray())
            .Should()
            .NotHaveDependencyOn("System.IO")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Thin_controllers_do_not_depend_on_IWebHostEnvironment()
    {
        var result = Types.InAssembly(typeof(AuthController).Assembly)
            .That().HaveName(ThinControllers.Select(t => t.Name).ToArray())
            .Should()
            .NotHaveDependencyOn("Microsoft.AspNetCore.Hosting")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    private static string Format(TestResult result) =>
        result.FailingTypes is null
            ? "(no failing types reported)"
            : string.Join(", ", result.FailingTypes.Select(t => t.FullName));
}
