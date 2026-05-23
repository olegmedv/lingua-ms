using LinguaCMS.Application.Auth.Models;
using MediatR;

namespace LinguaCMS.Application.Auth.Queries;

public record GetMeQuery(Guid UserId) : IRequest<UserDto>;
