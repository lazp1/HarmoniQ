using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using Microsoft.AspNetCore.Authorization;

// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class ManagerDepartmentController : ControllerBase
{
  private readonly DatabaseHelper _dbHelper;

  public ManagerDepartmentController(DatabaseHelper dbHelper)
  {
    _dbHelper = dbHelper;
  }

  [HttpGet]
  public IActionResult GetManagersDepartments()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = "SELECT * FROM Managers_Departments";
    using var command = new MySqlCommand(query, connection);
    using var reader = command.ExecuteReader();

    var managerDepartments = new List<object>();
    while (reader.Read())
    {
      managerDepartments.Add(new
      {
        Id = reader["Id"],
        EmployeeId = reader["EmployeeId"],
        DepartmentId = reader["DepartmentId"]
      });
    }
    return Ok(managerDepartments);
  }

  [HttpPost]
  public IActionResult AddManagerDepartment([FromBody] ManagerDepartment managerDepartment)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "INSERT INTO Managers_Departments (EmployeeId, DepartmentId) VALUES (@EmployeeId, @DepartmentId)";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@EmployeeId", managerDepartment.EmployeeId);
    command.Parameters.AddWithValue("@DepartmentId", managerDepartment.DepartmentId);

    command.ExecuteNonQuery();
    return Ok(new { Message = "Manager department added successfully" });
  }

  [HttpPut("{id}")]
  public IActionResult UpdateManagerDepartment(int id, [FromBody] ManagerDepartment managerDepartment)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "UPDATE Managers_Departments SET EmployeeId = @EmployeeId, DepartmentId = @DepartmentId WHERE Id = @Id";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@Id", id);
    command.Parameters.AddWithValue("@EmployeeId", managerDepartment.EmployeeId);
    command.Parameters.AddWithValue("@DepartmentId", managerDepartment.DepartmentId);

    command.ExecuteNonQuery();
    if (command.ExecuteNonQuery() == 0)
    {
      return NotFound(new { Message = "Employee department not found" });
    }
    return Ok(new { Message = "Employee department updated successfully" });
  }

  //get manager department info by employee id - returns empty if not a manager
  [HttpGet("employee/{employeeId}")]
  public IActionResult GetManagerDepartmentByEmployeeId(int employeeId)
  {
    try
    {
      using var connection = _dbHelper.GetConnection();
      connection.Open();

      // Get the manager's department information using LEFT JOIN to handle cases where department might not exist
      var query = @"
        SELECT md.Id, md.EmployeeId, md.DepartmentId, d.Name as DepartmentName 
        FROM Managers_Departments md 
        LEFT JOIN Departments d ON d.Id = md.DepartmentId 
        WHERE md.EmployeeId = @EmployeeId";

      using var command = new MySqlCommand(query, connection);
      command.Parameters.AddWithValue("@EmployeeId", employeeId);
      using var reader = command.ExecuteReader();

      var managerDepartments = new List<object>();
      while (reader.Read())
      {
        managerDepartments.Add(new
        {
          Id = Convert.ToInt32(reader["Id"]),
          EmployeeId = employeeId,
          DepartmentId = reader["DepartmentId"] == DBNull.Value ? (int?)null : Convert.ToInt32(reader["DepartmentId"]),
          DepartmentName = reader["DepartmentName"] == DBNull.Value ? null : reader["DepartmentName"].ToString()
        });
      }

      // Return empty array instead of 404 when employee is not a manager
      return Ok(managerDepartments);
    }
    catch (Exception ex)
    {
      return StatusCode(500, new { Message = $"An error occurred while fetching manager department information: {ex.Message}" });
    }
  }

  [HttpDelete("employee/{id}")]
  public IActionResult DeleteManagerDepartmentByEmployeeId(int id)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "DELETE FROM Managers_Departments WHERE EmployeeId = @Id";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@Id", id);

    if (command.ExecuteNonQuery() == 0)
    {
      return NotFound(new { Message = "Employee department not found" });
    }
    return Ok(new { Message = "Employee department deleted successfully" });
  }

}
