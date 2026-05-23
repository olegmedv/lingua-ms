using LinguaCMS.Application.Auth.Models;
using MediatR;

namespace LinguaCMS.Application.Auth.Commands;

public record DemoLoginCommand : IRequest<AuthResponse>;
