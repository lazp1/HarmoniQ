using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using Microsoft.AspNetCore.Authorization;
using Google.Protobuf.WellKnownTypes;

// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
  private readonly DatabaseHelper _dbHelper;

  public DashboardController(DatabaseHelper dbHelper)
  {
    _dbHelper = dbHelper;
  }

  [HttpGet("statistics")]
  public IActionResult GetStatistics()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = @"
      SELECT COUNT(*) AS TotalEmployees FROM Employees;
      SELECT COUNT(*) AS TotalLeaves FROM Leaves;
      SELECT COUNT(*) AS TotalManagersDepartments FROM Managers_Departments;
      SELECT COUNT(*) AS TotalSalaries FROM Salaries;
      SELECT COUNT(*) AS TotalUsers FROM Users;
      SELECT COUNT(*) AS TotalDepartments FROM Departments;";
    using var command = new MySqlCommand(query, connection);
    using var reader = command.ExecuteReader();


    reader.Read();
    var totalEmployees = reader["TotalEmployees"];
    reader.NextResult();
    reader.Read();
    var totalLeaves = reader["TotalLeaves"];
    reader.NextResult();
    reader.Read();
    var totalManagersDepartments = reader["TotalManagersDepartments"];
    reader.NextResult();
    reader.Read();
    var totalSalaries = reader["TotalSalaries"];
    reader.NextResult();
    reader.Read();
    var totalUsers = reader["TotalUsers"];
    reader.NextResult();
    reader.Read();
    var totalDepartments = reader["TotalDepartments"];

    return Ok(new
    {
      TotalEmployees = totalEmployees,
      TotalLeaves = totalLeaves,
      TotalManagersDepartments = totalManagersDepartments,
      TotalSalaries = totalSalaries,
      TotalUsers = totalUsers,
      TotalDepartments = totalDepartments
    });
  }

  [HttpGet("statistics/leavespending")]
  public IActionResult GetStatisticsLeavesPending()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = @"
      SELECT
      COUNT(*) AS TotalLeaves 
      FROM Leaves 
      WHERE Status = 'Pending'";
    using var command = new MySqlCommand(query, connection);
    using var reader = command.ExecuteReader();

    var statistics = new List<object>();
    while (reader.Read())
    {
      var totalLeaves = reader["TotalLeaves"];
      statistics.Add(new
      {
        TotalLeaves = totalLeaves
      });
    }

    return Ok(statistics);
  }


  [HttpGet("statistics/leaves")]
  public IActionResult GetStatisticsLeaves()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = @"
      SELECT 
      YEAR(StartDate) AS Year,
      MONTH(StartDate) AS Month,
      COUNT(*) AS TotalLeaves 
      FROM Leaves 
      GROUP BY YEAR(StartDate), MONTH(StartDate)";
    using var command = new MySqlCommand(query, connection);
    using var reader = command.ExecuteReader();

    var statistics = new List<object>();
    while (reader.Read())
    {
      var year = reader["Year"];
      var month = reader["Month"];
      var totalLeaves = reader["TotalLeaves"];
      statistics.Add(new
      {
        Year = year,
        Month = month,
        TotalLeaves = totalLeaves
      });
    }

    return Ok(statistics);
  }

  [HttpGet("statistics/chart")]
  public IActionResult GetStatisticsChart()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = @"
      SELECT COUNT(*) AS TotalDepartments FROM Departments;
      SELECT COUNT(*) AS TotalEmployees FROM Employees;
      SELECT COUNT(*) AS TotalLeaves FROM Leaves;
      SELECT COUNT(*) AS TotalManagersDepartments FROM Managers_Departments;
      SELECT COUNT(*) AS TotalSalaries FROM Salaries;
      SELECT COUNT(*) AS TotalUsers FROM Users";
    using var command = new MySqlCommand(query, connection);
    using var reader = command.ExecuteReader();

    reader.Read();
    var totalEmployees = reader["TotalEmployees"];
    reader.NextResult();
    reader.Read();
    var totalLeaves = reader["TotalLeaves"];
    reader.NextResult();
    reader.Read();
    var totalManagersDepartments = reader["TotalManagersDepartments"];
    reader.NextResult();
    reader.Read();
    var totalSalaries = reader["TotalSalaries"];
    reader.NextResult();
    reader.Read();
    var totalUsers = reader["TotalUsers"];
    reader.NextResult();
    reader.Read();
    var totalDepartments = reader["TotalDepartments"];

    return Ok(new
    {
      TotalEmployees = totalEmployees,
      TotalLeaves = totalLeaves,
      TotalDepartments = totalDepartments,
      TotalManagersDepartments = totalManagersDepartments,
      TotalSalaries = totalSalaries,
      TotalUsers = totalUsers
    });
  }

  [HttpGet("statistics/employees")]
  public IActionResult GetStatisticsEmployees()
  {
    using var connection = _dbHelper.GetConnection();
    connection.Open();

    var query = @"
      SELECT 
      YEAR(HireDate) AS Year,
      MONTH(HireDate) AS Month,
      COUNT(*) AS TotalEmployees 
      FROM Employees 
      GROUP BY YEAR(HireDate), MONTH(HireDate)";
    using var command = new MySqlCommand(query, connection);
    using var reader = command.ExecuteReader();

    var statistics = new List<object>();
    while (reader.Read())
    {
      var year = reader["Year"];
      var month = reader["Month"];
      var totalEmployees = reader["TotalEmployees"];
      statistics.Add(new
      {
        Year = year,
        Month = month,
        TotalEmployees = totalEmployees
      });
    }

    return Ok(statistics);
  }


}
