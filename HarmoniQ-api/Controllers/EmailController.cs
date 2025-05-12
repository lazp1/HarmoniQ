using HRMSApi.Models.Requests;
using HRMSApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace HRMSApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly EmailService _emailService;
    private readonly DatabaseHelper _dbHelper;

    public EmailController(EmailService emailService, DatabaseHelper dbHelper)
    {
        _emailService = emailService;
        _dbHelper = dbHelper;
    }

    [HttpPost("bulk")]
    [AllowAnonymous] // Allow this endpoint to be accessed without authentication
    public async Task<IActionResult> SendBulkEmail([FromBody] BulkEmailRequest request)
    {
        try
        {
            using var connection = _dbHelper.GetConnection();
            connection.Open();

            string query;
            MySqlCommand command;

            // Simplified query to get emails based on departments
            if (request.DepartmentIds != null && request.DepartmentIds.Any())
            {
                query = @"SELECT DISTINCT e.email 
                         FROM Employees e 
                         JOIN Employees_Departments ed ON e.id = ed.EmployeeId 
                         WHERE ed.DepartmentId IN (@departmentIds)";

                command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@departmentIds", string.Join(",", request.DepartmentIds));
            }
            else if (request.SpecificEmployeeIds != null && request.SpecificEmployeeIds.Any())
            {
                query = @"SELECT DISTINCT e.email 
                         FROM Employees e 
                         JOIN Employees_Departments ed ON e.id = ed.EmployeeId 
                         WHERE e.id IN (@employeeIds)";

                command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@employeeIds", string.Join(",", request.SpecificEmployeeIds));
            }
            else
            {
                // If no filters specified, send to all employees
                query = "SELECT DISTINCT email FROM Employees";
                command = new MySqlCommand(query, connection);
            }

            using var reader = command.ExecuteReader();
            var emails = new List<string>();

            while (reader.Read())
            {
                var email = reader.GetString("email");
                if (!string.IsNullOrWhiteSpace(email))
                {
                    emails.Add(email);
                }
            }

            if (!emails.Any())
            {
                return NotFound("No employee emails found");
            }

            await _emailService.SendBulkEmailAsync(emails, request.Subject, request.Body, request.IsHtml);

            return Ok($"Emails sent successfully to {emails.Count} employees");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to send emails: {ex.Message}");
        }
    }
}
