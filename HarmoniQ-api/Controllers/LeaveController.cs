using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using System.IdentityModel.Tokens.Jwt;

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
                Status = reader["Status"],
                EmployeeDetails = new Dictionary<string, object>()
            });
        }

        using var employeeConnection = _dbHelper.GetConnection();
        employeeConnection.Open();
        var employeeQuery = "SELECT * FROM Employees WHERE Id = @Id";
        foreach (var leave in leaves)
        {
            using var employeeCommand = new MySqlCommand(employeeQuery, employeeConnection);
            employeeCommand.Parameters.AddWithValue("@Id", ((dynamic)leave).EmployeeId);
            using var employeeReader = employeeCommand.ExecuteReader();
            if (employeeReader.Read())
            {
                leave.EmployeeDetails["FirstName"] = employeeReader["FirstName"];
                leave.EmployeeDetails["LastName"] = employeeReader["LastName"];
                leave.EmployeeDetails["Email"] = employeeReader["Email"];
            }
        }

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

        LeaveWithEmployee? leave = null;
        if (reader.Read())
        {
            leave = new LeaveWithEmployee
            {
                Id = reader["Id"],
                EmployeeId = reader["EmployeeId"],
                StartDate = reader["StartDate"],
                EndDate = reader["EndDate"],
                Reason = reader["Reason"],
                Status = reader["Status"],
                EmployeeDetails = new Dictionary<string, object>()
            };
        }

        if (leave == null)
        {
            return NotFound(new { Message = "Leave not found" });
        }

        connection.Close();

        using var employeeConnection = _dbHelper.GetConnection();
        employeeConnection.Open();
        var employeeQuery = "SELECT * FROM Employees WHERE Id = @Id";
        using var employeeCommand = new MySqlCommand(employeeQuery, employeeConnection);
        employeeCommand.Parameters.AddWithValue("@Id", ((dynamic)leave).EmployeeId);
        using var employeeReader = employeeCommand.ExecuteReader();

        if (employeeReader.Read())
        {
            leave.EmployeeDetails["FirstName"] = employeeReader["FirstName"];
            leave.EmployeeDetails["LastName"] = employeeReader["LastName"];
            leave.EmployeeDetails["Email"] = employeeReader["Email"];
        }

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

        // Get the current user's info
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtToken = tokenHandler.ReadJwtToken(token);
        var userRole = jwtToken.Claims.FirstOrDefault(c => c.Type == "role")?.Value;
        var userId = int.Parse(jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value ?? "0");

        // Get user's employee ID
        var userEmployeeQuery = "SELECT Id FROM Employees WHERE UserId = @UserId";
        using var userEmployeeCommand = new MySqlCommand(userEmployeeQuery, connection);
        userEmployeeCommand.Parameters.AddWithValue("@UserId", userId);
        var currentEmployeeId = Convert.ToInt32(userEmployeeCommand.ExecuteScalar() ?? 0);

        // Get the leave's current status
        var currentStatusQuery = "SELECT Status, EmployeeId FROM Leaves WHERE Id = @Id";
        using var statusCommand = new MySqlCommand(currentStatusQuery, connection);
        statusCommand.Parameters.AddWithValue("@Id", id);
        using var statusReader = statusCommand.ExecuteReader();

        if (!statusReader.Read())
        {
            return NotFound(new { Message = "Leave request not found" });
        }

        var currentStatus = statusReader["Status"].ToString();
        var leaveEmployeeId = Convert.ToInt32(statusReader["EmployeeId"]);
        statusReader.Close();

        // If status is being changed to Approved or Rejected, check permissions
        if (leave.Status != currentStatus && (leave.Status == "Approved" || leave.Status == "Rejected"))
        {
            // Check if it's user's own leave
            if (leaveEmployeeId == currentEmployeeId && userRole != "Admin")
            {
                return BadRequest(new { Message = "You cannot approve/reject your own leave request" });
            }

            // Check if the leave belongs to a manager
            bool isManagerLeave = false;
            var managerCheckQuery = "SELECT COUNT(*) FROM Managers_Departments WHERE EmployeeId = @EmployeeId";
            using var managerCheckCommand = new MySqlCommand(managerCheckQuery, connection);
            managerCheckCommand.Parameters.AddWithValue("@EmployeeId", leaveEmployeeId);
            isManagerLeave = Convert.ToInt32(managerCheckCommand.ExecuteScalar()) > 0;

            // Only admin can approve manager leaves
            if (isManagerLeave && userRole != "Admin")
            {
                return BadRequest(new { Message = "Only administrators can approve/reject manager leaves" });
            }

            // If user is manager, check if they manage this employee's department
            if (userRole == "Manager")
            {
                var deptCheckQuery = @"
                    SELECT COUNT(*) 
                    FROM Managers_Departments md
                    JOIN Employees_Departments ed ON md.DepartmentId = ed.DepartmentId
                    WHERE md.EmployeeId = @ManagerId 
                    AND ed.EmployeeId = @EmployeeId";
                using var deptCheckCommand = new MySqlCommand(deptCheckQuery, connection);
                deptCheckCommand.Parameters.AddWithValue("@ManagerId", currentEmployeeId);
                deptCheckCommand.Parameters.AddWithValue("@EmployeeId", leaveEmployeeId);
                bool managesEmployee = Convert.ToInt32(deptCheckCommand.ExecuteScalar()) > 0;

                if (!managesEmployee)
                {
                    return BadRequest(new { Message = "You can only approve/reject leaves for employees in your department" });
                }
            }
        }

        // Update the leave
        var updateQuery = "UPDATE Leaves SET EmployeeId = @EmployeeId, StartDate = @StartDate, EndDate = @EndDate, Reason = @Reason, Status = @Status WHERE Id = @Id";
        using var updateCommand = new MySqlCommand(updateQuery, connection);

        updateCommand.Parameters.AddWithValue("@Id", leave.Id);
        updateCommand.Parameters.AddWithValue("@EmployeeId", leave.EmployeeId);
        updateCommand.Parameters.AddWithValue("@StartDate", leave.StartDate);
        updateCommand.Parameters.AddWithValue("@EndDate", leave.EndDate);
        updateCommand.Parameters.AddWithValue("@Reason", leave.Reason);
        updateCommand.Parameters.AddWithValue("@Status", leave.Status);

        updateCommand.ExecuteNonQuery();
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

    [HttpGet("remaining/{employeeId}")]
    public IActionResult GetRemainingLeaves(int employeeId)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        // First check if employee exists
        var employeeQuery = "SELECT COUNT(*) FROM Employees WHERE Id = @EmployeeId";
        using var empCommand = new MySqlCommand(employeeQuery, connection);
        empCommand.Parameters.AddWithValue("@EmployeeId", employeeId);
        var employeeExists = Convert.ToInt32(empCommand.ExecuteScalar()) > 0;

        if (!employeeExists)
        {
            return NotFound(new { Message = "Employee not found" });
        }

        var query = @"SELECT SUM(DATEDIFF(EndDate, StartDate) + 1) as UsedLeaves 
                     FROM Leaves 
                     WHERE EmployeeId = @EmployeeId 
                     AND Status = 'Approved' 
                     AND YEAR(StartDate) = YEAR(CURRENT_DATE())";
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@EmployeeId", employeeId);

        var result = command.ExecuteScalar();
        var usedLeaves = result != DBNull.Value && result != null ? Convert.ToInt32(result) : 0;

        var totalAllowedLeaves = 21; // Annual leave allowance
        var remainingLeaves = totalAllowedLeaves - usedLeaves;

        return Ok(new
        {
            TotalAllowedLeaves = totalAllowedLeaves,
            UsedLeaves = usedLeaves,
            RemainingLeaves = remainingLeaves
        });
    }
}

internal class LeaveWithEmployee
{
    public required object Id { get; set; }
    public required object EmployeeId { get; set; }
    public required object StartDate { get; set; }
    public required object EndDate { get; set; }
    public required object Reason { get; set; }
    public required object Status { get; set; }
    public required Dictionary<string, object> EmployeeDetails { get; set; }
}