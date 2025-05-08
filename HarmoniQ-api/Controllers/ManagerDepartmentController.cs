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

  //get manager department by employee id
  [HttpGet("employee/{employeeId}")]
  public IActionResult GetManagerDepartmentByEmployeeId(int employeeId)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = "SELECT * FROM Managers_Departments INNER JOIN Departments ON Departments.Id = Managers_Departments.DepartmentId WHERE EmployeeId = @EmployeeId";

    using var command = new MySqlCommand(query, connection);
    command.Parameters.AddWithValue("@EmployeeId", employeeId);
    using var reader = command.ExecuteReader();

    var managerDepartments = new List<object>();
    while (reader.Read())
    {
      managerDepartments.Add(new
      {
        Id = reader["Id"],
        EmployeeId = reader["EmployeeId"],
        DepartmentId = reader["DepartmentId"],
        DepartmentName = reader["Name"]
      });
    }
    return Ok(managerDepartments);
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
