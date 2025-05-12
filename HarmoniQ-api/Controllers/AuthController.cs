using HRMSApi.Models;
using HRMSApi.Services;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace HRMSApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly PasswordHasher _passwordHasher;
        private readonly UserService _userService;
        private readonly DatabaseHelper _dbHelper;

        public AuthController(TokenService tokenService, PasswordHasher passwordHasher, UserService userService, DatabaseHelper dbHelper)
        {
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
            _userService = userService;
            _dbHelper = dbHelper;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var user = await _userService.GetUserByEmailAsync(login.Email);
            if (user == null || !_passwordHasher.VerifyPassword(login.Password, user.PasswordHash))
                return Unauthorized(new { Message = "Λάθος στοιχεία σύνδεσης" });

            // Skip employee check for admin users
            if (user.Role != "Admin")
            {
                // Get employee ID for this user
                int employeeId = await GetEmployeeIdForUser(user.Id);
                if (employeeId == 0) // No employee record found
                    return BadRequest(new { Message = "Δε βρέθηκε υπάλληλος για το συγκεκριμένο χρήστη" });

                // Check if employee is a manager
                bool isManager = await IsEmployeeManager(employeeId);

                // If employee is a manager, update role in database and user object
                if (isManager && user.Role == "User")
                {
                    user.Role = "Manager";
                    // Update role in database
                    using var connection = _dbHelper.GetConnection();
                    await connection.OpenAsync();
                    var updateQuery = "UPDATE Users SET Role = @Role WHERE Id = @Id";
                    using var command = new MySqlCommand(updateQuery, connection);
                    command.Parameters.AddWithValue("@Role", "Manager");
                    command.Parameters.AddWithValue("@Id", user.Id);
                    await command.ExecuteNonQueryAsync();
                }
            }

            var token = _tokenService.GenerateToken(user);
            return Ok(new { Token = token, User = user, Message = "Επιτυχής σύνδεση", StatusCode = 200 });
        }

        private async Task<int> GetEmployeeIdForUser(int userId)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            var query = "SELECT Id FROM Employees WHERE UserId = @UserId";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            var result = await command.ExecuteScalarAsync();
            return result != null ? Convert.ToInt32(result) : 0;
        }

        private async Task<bool> IsEmployeeManager(int employeeId)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            var query = "SELECT COUNT(*) FROM Managers_Departments WHERE EmployeeId = @EmployeeId";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@EmployeeId", employeeId);

            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result) > 0;
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

            // Add the user first to get their ID
            await _userService.AddUserAsync(user);

            // Now check if this user has been added as a manager
            int employeeId = await GetEmployeeIdForUser(user.Id);
            if (employeeId != 0)
            {
                bool isManager = await IsEmployeeManager(employeeId);
                if (isManager)
                {
                    user.Role = "Manager";
                    // Update role in database
                    using var connection = _dbHelper.GetConnection();
                    await connection.OpenAsync();
                    var updateQuery = "UPDATE Users SET Role = @Role WHERE Id = @Id";
                    using var command = new MySqlCommand(updateQuery, connection);
                    command.Parameters.AddWithValue("@Role", "Manager");
                    command.Parameters.AddWithValue("@Id", user.Id);
                    await command.ExecuteNonQueryAsync();
                }
            }

            var token = _tokenService.GenerateToken(user);

            return Ok(new { Token = token, User = user, Message = "Επιτυχής εγγραφή", StatusCode = 200 });
        }
    }
}
