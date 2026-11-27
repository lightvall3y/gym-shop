using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GymShop.Api.Domain;
using Microsoft.IdentityModel.Tokens;

namespace GymShop.Api.Services;

public class TokenService(IConfiguration config)
{
    public const string Issuer = "gymshop-api";
    public const string Audience = "gymshop-web";

    public static SymmetricSecurityKey SigningKey(IConfiguration config) =>
        new(Encoding.UTF8.GetBytes(config["JWT_SECRET"] ?? throw new InvalidOperationException("JWT_SECRET is not set")));

    public string Create(AppUser user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim("name", user.DisplayName),
        };
        var token = new JwtSecurityToken(
            Issuer, Audience, claims, expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(SigningKey(config), SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
