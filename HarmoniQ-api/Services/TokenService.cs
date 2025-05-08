using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HRMSApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace HRMSApi.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException()));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                // expires: DateTime.Now.AddMinutes(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal ValidateToken(string token)
        {

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]))
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                var email = principal.Claims.All(c => c.Type != ClaimTypes.Email) ? null : principal.Claims.First(c => c.Type == ClaimTypes.Email).Value;
                var role = principal.Claims.All(c => c.Type != ClaimTypes.Role) ? null : principal.Claims.First(c => c.Type == ClaimTypes.Role).Value;
                return principal;
            }
            catch
            {
                return null; // Το token είναι άκυρο ή έχει λήξει
            }
        }
    }
}
