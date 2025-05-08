using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using Microsoft.AspNetCore.Authorization;

// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class DepartmentController : ControllerBase
{
  private readonly DatabaseHelper _dbHelper;

  public DepartmentController(DatabaseHelper dbHelper)
  {
    _dbHelper = dbHelper;
  }

  [HttpGet]
  public IActionResult GetAllDepartment()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = "SELECT * FROM Departments";
    using var command = new MySqlCommand(query, connection);
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

  [HttpGet("{departmentId}/employees")]
  public IActionResult GetAllEmployeesByDepartment(int departmentId)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = "SELECT * FROM Employees WHERE Id IN (SELECT EmployeeId FROM Employees_Departments WHERE DepartmentId = @DepartmentId)";
    using var command = new MySqlCommand(query, connection);
    command.Parameters.AddWithValue("@DepartmentId", departmentId);
    using var reader = command.ExecuteReader();

    var employees = new List<object>();
    while (reader.Read())
    {
      employees.Add(new
      {
        Id = reader["Id"],
        FirstName = reader["FirstName"],
        LastName = reader["LastName"],
        Email = reader["Email"]
      });
    }
    return Ok(employees);
  }

  // [Authorize(Roles = "User,Manager,Admin")]
  [HttpPost]
  public IActionResult AddDepartment([FromBody] Department department)
  {
    // Console.WriteLine(department.Name);
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "INSERT INTO Departments (Name) VALUES (@Name)";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@Name", department.Name);

    command.ExecuteNonQuery();
    return Ok(new { Message = "Department added successfully" });
  }

  // [Authorize(Roles = "User,Manager,Admin")]
  [HttpPut("{id}")]
  public IActionResult UpdateDepartment(int id, [FromBody] Department department)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "UPDATE Departments SET Name = @Name WHERE Id = @Id";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@Id", id);
    command.Parameters.AddWithValue("@Name", department.Name);

    command.ExecuteNonQuery();
    if (command.ExecuteNonQuery() == 0)
    {
      return NotFound(new { Message = "Department not found" });
    }
    return Ok(new { Message = "Department updated successfully" });
  }

  // [Authorize(Roles = "User,Manager,Admin")]
  [HttpDelete("{id}")]
  public IActionResult DeleteDepartment(int id)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "DELETE FROM Departments WHERE Id = @Id";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@Id", id);

    command.ExecuteNonQuery();
    return Ok(new { Message = "Department deleted successfully" });
  }

  [HttpGet("{id}")]
  public IActionResult GetDepartmentById(int id)
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();
    var query = "SELECT * FROM Departments WHERE Id = @Id";
    using var command = new MySqlCommand(query, connection);

    command.Parameters.AddWithValue("@Id", id);

    using var reader = command.ExecuteReader();
    if (reader.Read())
    {
      return Ok(new
      {
        Id = reader["Id"],
        Name = reader["Name"]
      });
    }
    return NotFound(new { Message = "Department not found" });
  }

}
