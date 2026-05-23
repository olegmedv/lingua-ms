using LinguaCMS.Application.Auth.Commands;
using LinguaCMS.Application.Common.Behaviors;
using MediatR;
using NetArchTest.Rules;
using Xunit;

namespace LinguaCMS.ArchitectureTests;

public class NamingConventionTests
{
    private static readonly System.Reflection.Assembly AppAssembly = typeof(RegisterCommand).Assembly;

    [Fact]
    public void Handlers_end_with_Handler_suffix()
    {
        var result = Types.InAssembly(AppAssembly)
            .That()
            .ImplementInterface(typeof(IRequestHandler<,>))
            .Should()
            .HaveNameEndingWith("Handler")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Pipeline_behaviors_end_with_Behavior_suffix()
    {
        // Generic types carry an arity suffix like `2 in their runtime name, so match either form.
        var result = Types.InAssembly(typeof(LoggingBehavior<,>).Assembly)
            .That()
            .ImplementInterface(typeof(IPipelineBehavior<,>))
            .Should()
            .HaveNameMatching(@"Behavior(`\d+)?$")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Requests_end_with_Command_or_Query_suffix()
    {
        var result = Types.InAssembly(AppAssembly)
            .That()
            .ImplementInterface(typeof(IRequest<>))
            .Or()
            .ImplementInterface(typeof(IRequest))
            .Should()
            .HaveNameMatching(@"(Command|Query)$")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    [Fact]
    public void Interfaces_start_with_I()
    {
        var result = Types.InAssembly(typeof(LinguaCMS.Domain.Interfaces.IJwtTokenService).Assembly)
            .That()
            .ResideInNamespace("LinguaCMS.Domain.Interfaces")
            .And().AreInterfaces()
            .Should()
            .HaveNameStartingWith("I")
            .GetResult();
        Assert.True(result.IsSuccessful, Format(result));
    }

    private static string Format(TestResult result) =>
        result.FailingTypes is null
            ? "(no failing types reported)"
            : string.Join(", ", result.FailingTypes.Select(t => t.FullName));
}
