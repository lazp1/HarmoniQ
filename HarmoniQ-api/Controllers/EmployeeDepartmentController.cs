using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using Microsoft.AspNetCore.Authorization;

// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeeDepartmentController : ControllerBase
{
  private readonly DatabaseHelper _dbHelper;

  public EmployeeDepartmentController(DatabaseHelper dbHelper)
  {
    _dbHelper = dbHelper;
  }

  [HttpGet("employee/{employeeId}")]
  public IActionResult GetDepartmentByEmployeeId(int employeeId)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = "SELECT * FROM Departments WHERE Id IN (SELECT DepartmentId FROM Employees_Departments WHERE EmployeeId = @EmployeeId)";
    using var command = new MySqlCommand(query, connection);
    command.Parameters.AddWithValue("@EmployeeId", employeeId);
    using var reader = command.ExecuteReader();

    var departments = new List<object>();
    while (reader.Read())
    {
      departments.Add(new
      {
        Id = reader["Id"],
        Name = reader["Name"]
      });
    }
    return Ok(departments);
  }

  [HttpGet]
  public IActionResult GetAllEmployeeDepartments()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = @"
      SELECT ed.Id, ed.EmployeeId, ed.DepartmentId, 
             e.FirstName, e.LastName,
             d.Name as DepartmentName
      FROM Employees_Departments ed
      JOIN Employees e ON ed.EmployeeId = e.Id
      JOIN Departments d ON ed.DepartmentId = d.Id";

    using var command = new MySqlCommand(query, connection);
    using var reader = command.ExecuteReader();

    var mappings = new List<object>();
    while (reader.Read())
    {
      mappings.Add(new
      {
        Id = Convert.ToInt32(reader["Id"]),
        EmployeeId = Convert.ToInt32(reader["EmployeeId"]),
        DepartmentId = Convert.ToInt32(reader["DepartmentId"]),
        EmployeeName = $"{reader["FirstName"]} {reader["LastName"]}",
        DepartmentName = reader["DepartmentName"].ToString()
      });
    }
    return Ok(mappings);
  }

  [HttpPut("{id}")]
  public IActionResult UpdateEmployeeDepartment(int id, [FromBody] EmployeeDepartment employeeDepartment)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "UPDATE Employees_Departments SET EmployeeId = @EmployeeId, DepartmentId = @DepartmentId WHERE Id = @Id";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@Id", id);
    command.Parameters.AddWithValue("@EmployeeId", employeeDepartment.EmployeeId);
    command.Parameters.AddWithValue("@DepartmentId", employeeDepartment.DepartmentId);

    command.ExecuteNonQuery();
    // Check if the update was successful
    // If no rows were affected, it means the employee department was not found
    if (command.ExecuteNonQuery() == 0)
    {
      return NotFound(new { Message = "Employee department not found" });
    }
    return Ok(new { Message = "Employee department updated successfully" });
  }

  [HttpPut("employee/{employeeId}")]
  public IActionResult UpdateDepartmentByEmployeeId(int employeeId, [FromBody] EmployeeDepartment employeeDepartment)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "UPDATE Employees_Departments SET DepartmentId = @DepartmentId WHERE EmployeeId = @EmployeeId";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@EmployeeId", employeeId);
    command.Parameters.AddWithValue("@DepartmentId", employeeDepartment.DepartmentId);

    command.ExecuteNonQuery();
    if (command.ExecuteNonQuery() == 0)
    {
      var insertQuery = "INSERT INTO Employees_Departments (EmployeeId, DepartmentId) VALUES (@EmployeeId, @DepartmentId)";
      using var insertCommand = new MySqlCommand(insertQuery, connection);

      insertCommand.Parameters.AddWithValue("@EmployeeId", employeeDepartment.EmployeeId);
      insertCommand.Parameters.AddWithValue("@DepartmentId", employeeDepartment.DepartmentId);

      insertCommand.ExecuteNonQuery();
      return Ok(new { Message = "Employee department not found, new employee department added successfully" });

    }
    return Ok(new { Message = "Employee department updated successfully" });
  }

}
