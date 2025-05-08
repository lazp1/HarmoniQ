using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;

[ApiController]
[Route("api/[controller]")]
public class LeaveController : ControllerBase
{
    private readonly DatabaseHelper _dbHelper;

    public LeaveController(DatabaseHelper dbHelper)
    {
        _dbHelper = dbHelper;
    }

    [HttpGet]
    public IActionResult GetAllLeave()
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        var query = "SELECT * FROM Leaves";
        using var command = new MySqlCommand(query, connection);
        using var reader = command.ExecuteReader();

        var leaves = new List<LeaveWithEmployee>();
        while (reader.Read())
        {
            leaves.Add(new LeaveWithEmployee
            {
                Id = reader["Id"],
                EmployeeId = reader["EmployeeId"],
                StartDate = reader["StartDate"],
                EndDate = reader["EndDate"],
                Reason = reader["Reason"],
                Status = reader["Status"]
            });
        }

        using var employeeConnection = _dbHelper.GetConnection();
        employeeConnection.Open();
        var employeeQuery = "SELECT * FROM Employees WHERE Id = @Id";
        foreach (var leave in leaves)
        {
            var employee = new Dictionary<string, object>();
            using var employeeCommand = new MySqlCommand(employeeQuery, employeeConnection);
            employeeCommand.Parameters.AddWithValue("@Id", ((dynamic)leave).EmployeeId);
            using var employeeReader = employeeCommand.ExecuteReader();
            if (employeeReader.Read())
            {
                employee["FirstName"] = employeeReader["FirstName"];
                employee["LastName"] = employeeReader["LastName"];
                employee["Email"] = employeeReader["Email"];
            }
            leave.EmployeeDetails = employee;
        }

        employeeConnection.Close();
        connection.Close();

        return Ok(leaves);
    }

    [HttpGet("{id}")]
    public IActionResult GetLeaveById(int id)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        var query = "SELECT * FROM Leaves WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);
        using var reader = command.ExecuteReader();

        var leave = new LeaveWithEmployee();
        if (reader.Read())
        {
            leave.Id = (int)reader["Id"];
            leave.EmployeeId = (int)reader["EmployeeId"];
            leave.StartDate = (DateTime)reader["StartDate"];
            leave.EndDate = (DateTime)reader["EndDate"];
            leave.Reason = (string)reader["Reason"];
            leave.Status = (string)reader["Status"];
        }

        connection.Close();

        using var employeeConnection = _dbHelper.GetConnection();
        employeeConnection.Open();
        var employeeQuery = "SELECT * FROM Employees WHERE Id = @Id";
        using var employeeCommand = new MySqlCommand(employeeQuery, employeeConnection);
        employeeCommand.Parameters.AddWithValue("@Id", ((dynamic)leave).EmployeeId);
        using var employeeReader = employeeCommand.ExecuteReader();

        var employee = new Dictionary<string, object>();
        if (employeeReader.Read())
        {
            employee["FirstName"] = employeeReader["FirstName"];
            employee["LastName"] = employeeReader["LastName"];
            employee["Email"] = employeeReader["Email"];
        }
        employeeConnection.Close();
        leave.EmployeeDetails = employee;

        return Ok(leave);
    }

    [HttpPost]
    public IActionResult AddLeave([FromBody] Leave leave)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "INSERT INTO Leaves (EmployeeId, StartDate, EndDate, Reason, Status) VALUES (@EmployeeId, @StartDate, @EndDate, @Reason, @Status)";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@EmployeeId", leave.EmployeeId);
        command.Parameters.AddWithValue("@StartDate", leave.StartDate);
        command.Parameters.AddWithValue("@EndDate", leave.EndDate);
        command.Parameters.AddWithValue("@Reason", leave.Reason);
        command.Parameters.AddWithValue("@Status", leave.Status);

        command.ExecuteNonQuery();
        return Ok(new { Message = "Leave added successfully" });
    }

    [HttpPut("{id}")]
    public IActionResult UpdateLeave(int id, [FromBody] Leave leave)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "UPDATE Leaves SET EmployeeId = @EmployeeId, StartDate = @StartDate, EndDate = @EndDate, Reason = @Reason, Status = @Status WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@Id", leave.Id);
        command.Parameters.AddWithValue("@EmployeeId", leave.EmployeeId);
        command.Parameters.AddWithValue("@StartDate", leave.StartDate);
        command.Parameters.AddWithValue("@EndDate", leave.EndDate);
        command.Parameters.AddWithValue("@Reason", leave.Reason);
        command.Parameters.AddWithValue("@Status", leave.Status);

        command.ExecuteNonQuery();
        return Ok(new { Message = "Leave updated successfully" });
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteLeave(int id)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();
        var query = "DELETE FROM Leaves WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@Id", id);

        command.ExecuteNonQuery();
        return Ok(new { Message = "Leave deleted successfully" });
    }

}

internal class LeaveWithEmployee
{
    public object Id { get; set; }
    public object EmployeeId { get; set; }
    public object StartDate { get; set; }
    public object EndDate { get; set; }
    public object Reason { get; set; }
    public object Status { get; set; }
    public Dictionary<string, object> EmployeeDetails { get; set; }
}