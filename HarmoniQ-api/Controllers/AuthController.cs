using HRMSApi.Models;
using HRMSApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HRMSApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly PasswordHasher _passwordHasher;

        private readonly UserService _userService;

        public AuthController(TokenService tokenService, PasswordHasher passwordHasher, UserService userService)
        {
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var user = await _userService.GetUserByEmailAsync(login.Email);
            if (user == null || !_passwordHasher.VerifyPassword(login.Password, user.PasswordHash))
                return Unauthorized(new { Message = "Invalid credentials" });
            var token = _tokenService.GenerateToken(user);
            // user.RefreshToken = token;
            // await _userService.UpdateUserAsync(user);
            return Ok(new { Token = token, User = user, Message = "Επιτυχής σύνδεση", StatusCode = 200 });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest register)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _userService.UserExistsAsync(register.Email))
                return BadRequest(new { Message = "Υπάρχει ήδη αυτό το email καταχωρημένο" });

            var user = new User
            {
                Email = register.Email,
                PasswordHash = _passwordHasher.HashPassword(register.Password),
                DepartmentId = register.DepartmentId,
                Role = "User"
            };

            await _userService.AddUserAsync(user);

            var token = _tokenService.GenerateToken(user);

            return Ok(new { Token = token, User = user, Message = "Επιτυχής εγγραφή", StatusCode = 200 });

        }
    }

}
