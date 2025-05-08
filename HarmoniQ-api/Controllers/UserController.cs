using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using Microsoft.AspNetCore.Authorization;
using HRMSApi.Services;
using System.Security.Claims;
using System.Net;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly DatabaseHelper _dbHelper;
    private readonly TokenService _tokenService;

    public UserController(DatabaseHelper dbHelper, TokenService tokenService)
    {
        _dbHelper = dbHelper;
        _tokenService = tokenService;
    }


    [HttpGet]
    public IActionResult GetAllUsers()
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "SELECT * FROM Users";
        using var command = new MySqlCommand(query, connection);
        using var reader = command.ExecuteReader();

        var users = new List<object>();
        while (reader.Read())
        {
            users.Add(new
            {
                Id = reader["Id"],
                Email = reader["Email"],
                PasswordHash = reader["PasswordHash"] == DBNull.Value ? null : reader["PasswordHash"],
                Role = reader["Role"] == DBNull.Value ? null : reader["Role"],
                RefreshToken = reader["RefreshToken"] == DBNull.Value ? null : reader["RefreshToken"]
            });
        }
        return Ok(users);
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "SELECT * FROM Users WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);
        using var reader = command.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound(new { Message = "User not found" });
        }

        return Ok(new
        {
            Id = reader["Id"],
            Email = reader["Email"],
            PasswordHash = reader["PasswordHash"] == DBNull.Value ? null : reader["PasswordHash"],
            Role = reader["Role"] == DBNull.Value ? null : reader["Role"],
            RefreshToken = reader["RefreshToken"] == DBNull.Value ? null : reader["RefreshToken"]
        });
    }

    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] User user)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();


        var query = "UPDATE Users SET Email = @Email, Role = @Role WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@Email", user.Email);
        command.Parameters.AddWithValue("@Role", user.Role);
        command.ExecuteNonQuery();

        if (command.ExecuteNonQuery() == 0)
        {
            return NotFound(new { Message = "User not found" });
        }
        return Ok(new { Message = "User updated successfully" });
    }
}
