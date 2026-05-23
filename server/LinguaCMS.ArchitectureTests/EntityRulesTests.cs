using System.Reflection;
using LinguaCMS.Domain.Entities;
using Xunit;

namespace LinguaCMS.ArchitectureTests;

public class EntityRulesTests
{
    [Fact]
    public void Entities_have_no_methods_only_properties()
    {
        var entities = typeof(AppUser).Assembly
            .GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Namespace == "LinguaCMS.Domain.Entities")
            .ToList();

        Assert.NotEmpty(entities);

        var violations = new List<string>();
        foreach (var entity in entities)
        {
            var methods = entity
                .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => !m.IsSpecialName) // exclude property accessors
                .ToList();
            if (methods.Count > 0)
                violations.Add($"{entity.Name}: {string.Join(", ", methods.Select(m => m.Name))}");
        }

        Assert.Empty(violations);
    }

    [Fact]
    public void Entities_have_no_constructors_with_parameters()
    {
        var entities = typeof(AppUser).Assembly
            .GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Namespace == "LinguaCMS.Domain.Entities")
            .ToList();

        var violations = entities
            .Where(t => t.GetConstructors().Any(c => c.GetParameters().Length > 0))
            .Select(t => t.Name)
            .ToList();

        Assert.Empty(violations);
    }
}
