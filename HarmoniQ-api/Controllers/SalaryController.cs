using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class SalaryController : ControllerBase
{
    private readonly DatabaseHelper _dbHelper;

    public SalaryController(DatabaseHelper dbHelper)
    {
        _dbHelper = dbHelper;
    }

    [HttpGet]
    public IActionResult GetAllSalariesWithEmployeeDetails()
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        var query = @"
        SELECT s.Id, s.EmployeeId, s.created_at, s.Amount, s.SubmitterId, s.Status, 
            e.FirstName AS EmployeeFirstName, e.LastName AS EmployeeLastName, u.Email AS SubmitterEmail
        FROM Salaries s
        JOIN Employees e ON s.EmployeeId = e.Id
        JOIN Users u ON s.SubmitterId = u.Id";

        using var command = new MySqlCommand(query, connection);
        using var reader = command.ExecuteReader();

        var salariesWithEmployees = new List<object>();
        while (reader.Read())
        {
            salariesWithEmployees.Add(new
            {
                Id = reader["Id"],
                EmployeeId = reader["EmployeeId"],
                Amount = reader["Amount"],
                SubmitterId = reader["SubmitterId"],
                Status = reader["Status"],
                CreatedAt = reader["created_at"],
                EmployeeFirstName = reader["EmployeeFirstName"],
                EmployeeLastName = reader["EmployeeLastName"],
                SubmitterEmail = reader["SubmitterEmail"]
            });
        }

        return Ok(salariesWithEmployees);
    }

    [HttpGet("{id}")]
    public IActionResult GetSalaryById(int id)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        var query = "SELECT * FROM Salaries WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);
        using var reader = command.ExecuteReader();

        if (reader.Read())
        {
            var salary = new
            {
                Id = reader["Id"],
                EmployeeId = reader["EmployeeId"],
                Amount = reader["Amount"],
                SubmitterId = reader["SubmitterId"],
                Status = reader["Status"]
            };
            return Ok(salary);
        }
        return NotFound();
    }

    [HttpPost]
    public IActionResult AddSalary([FromBody] Salary salary)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "INSERT INTO Salaries (EmployeeId, Amount, SubmitterId, Status) VALUES (@EmployeeId, @Amount, @SubmitterId, @Status)";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@EmployeeId", salary.EmployeeId);
        command.Parameters.AddWithValue("@Amount", salary.Amount);
        command.Parameters.AddWithValue("@SubmitterId", salary.SubmitterId);
        command.Parameters.AddWithValue("@Status", salary.Status);

        command.ExecuteNonQuery();
        return Ok(new { Message = "Salary added successfully" });
    }

    [HttpPut("{id}")]
    public IActionResult UpdateSalary(int id, [FromBody] Salary salary)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "UPDATE Salaries SET EmployeeId = @EmployeeId, Amount = @Amount, SubmitterId = @SubmitterId, Status = @Status WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@EmployeeId", salary.EmployeeId);
        command.Parameters.AddWithValue("@Amount", salary.Amount);
        command.Parameters.AddWithValue("@SubmitterId", salary.SubmitterId);
        command.Parameters.AddWithValue("@Status", salary.Status);
        command.Parameters.AddWithValue("@Id", id);

        command.ExecuteNonQuery();
        return Ok(new { Message = "Salary updated successfully" });
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteSalary(int id)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "DELETE FROM Salaries WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@Id", id);

        command.ExecuteNonQuery();
        return Ok(new { Message = "Salary deleted successfully" });
    }
}

