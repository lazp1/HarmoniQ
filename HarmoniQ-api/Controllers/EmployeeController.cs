using MySql.Data.MySqlClient;
using Microsoft.AspNetCore.Mvc;
using HRMSApi.Models;
using Microsoft.AspNetCore.Authorization;
using HRMSApi.Services;
using System.Security.Claims;
using System.Net;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly DatabaseHelper _dbHelper;
    private readonly TokenService _tokenService;

    public EmployeeController(DatabaseHelper dbHelper, TokenService tokenService)
    {
        _dbHelper = dbHelper;
        _tokenService = tokenService;
    }

    public UnauthorizedResult? CheckForToken()
    {
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized();
        }

        var principal = _tokenService.ValidateToken(token);
        if (principal == null)
        {
            return Unauthorized();
        }
        return null;
    }

    [HttpGet]
    public IActionResult GetAllEmployees()
    {
        var validity = CheckForToken();
        if (validity != null)
        {
            return Unauthorized();
        }


        using var connection = _dbHelper.GetConnection();
        connection.Open();
        //left join query to get department name and job level for each employee from Employees_Departments and Departments tables
        //even if the employee does not have a department assigned
        var query = "SELECT * FROM Employees LEFT JOIN Employees_Departments ON Employees.Id = Employees_Departments.EmployeeId LEFT JOIN Departments ON Employees_Departments.DepartmentId = Departments.Id";
        using var command = new MySqlCommand(query, connection);
        using var reader = command.ExecuteReader();

        var employees = new List<object>();
        while (reader.Read())
        {
            employees.Add(new
            {
                Id = reader["Id"],
                FirstName = reader["FirstName"] == DBNull.Value ? null : reader["FirstName"],
                LastName = reader["LastName"] == DBNull.Value ? null : reader["LastName"],
                Email = reader["Email"],
                Phone = reader["Phone"] == DBNull.Value ? null : reader["Phone"],
                Gender = reader["Gender"] == DBNull.Value ? null : reader["Gender"],
                HireDate = reader["HireDate"] == DBNull.Value ? null : reader["HireDate"],
                BirthDate = reader["BirthDate"] == DBNull.Value ? null : reader["BirthDate"],
                Address = reader["Address"] == DBNull.Value ? null : reader["Address"],
                Country = reader["Country"] == DBNull.Value ? null : reader["Country"],
                City = reader["City"] == DBNull.Value ? null : reader["City"],
                DepartmentId = reader["DepartmentId"] == DBNull.Value ? null : reader["DepartmentId"],
                DepartmentName = reader["Name"] == DBNull.Value ? null : reader["Name"],
                JobLevel = reader["JobLevel"] == DBNull.Value ? null : reader["JobLevel"],
                WorkModel = reader["WorkModel"] == DBNull.Value ? null : reader["WorkModel"],
                MarriedStatus = reader["MarriedStatus"] == DBNull.Value ? null : reader["MarriedStatus"],
                HaveChildren = reader["HaveChildren"] == DBNull.Value ? null : reader["HaveChildren"],
                NumberOfChildren = reader["NumberOfChildren"] == DBNull.Value ? null : reader["NumberOfChildren"],
                DistanceToWork = reader["DistanceToWork"] == DBNull.Value ? null : reader["DistanceToWork"],
                EducationLevel = reader["EducationLevel"] == DBNull.Value ? null : reader["EducationLevel"],
                JobSatisfaction = reader["JobSatisfaction"] == DBNull.Value ? null : reader["JobSatisfaction"],
                EnvironmentSatisfaction = reader["EnvironmentSatisfaction"] == DBNull.Value ? null : reader["EnvironmentSatisfaction"],
                RelationshipSatisfaction = reader["RelationshipSatisfaction"] == DBNull.Value ? null : reader["RelationshipSatisfaction"]
            });
        }
        return Ok(employees);
    }

    [HttpGet("{id}")]
    public IActionResult GetEmployeeById(int id)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        var query = "SELECT * FROM Employees WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@Id", id);

        using var reader = command.ExecuteReader();
        if (!reader.Read())
        {
            return NotFound(new { Message = "Employee not found" });
        }

        return Ok(new
        {
            Id = reader["Id"],
            FirstName = reader["FirstName"] == DBNull.Value ? null : reader["FirstName"],
            LastName = reader["LastName"] == DBNull.Value ? null : reader["LastName"],
            Email = reader["Email"],
            Phone = reader["Phone"] == DBNull.Value ? null : reader["Phone"],
            Gender = reader["Gender"] == DBNull.Value ? null : reader["Gender"],
            HireDate = reader["HireDate"] == DBNull.Value ? null : reader["HireDate"],
            BirthDate = reader["BirthDate"] == DBNull.Value ? null : reader["BirthDate"],
            Address = reader["Address"] == DBNull.Value ? null : reader["Address"],
            Country = reader["Country"] == DBNull.Value ? null : reader["Country"],
            City = reader["City"] == DBNull.Value ? null : reader["City"],
            MarriedStatus = reader["MarriedStatus"] == DBNull.Value ? null : reader["MarriedStatus"],
            HaveChildren = reader["HaveChildren"] == DBNull.Value ? null : reader["HaveChildren"],
            NumberOfChildren = reader["NumberOfChildren"] == DBNull.Value ? null : reader["NumberOfChildren"],
            DistanceToWork = reader["DistanceToWork"] == DBNull.Value ? null : reader["DistanceToWork"],
            EducationLevel = reader["EducationLevel"] == DBNull.Value ? null : reader["EducationLevel"],
            JobLevel = reader["JobLevel"] == DBNull.Value ? null : reader["JobLevel"],
            WorkModel = reader["WorkModel"] == DBNull.Value ? null : reader["WorkModel"],
            JobSatisfaction = reader["JobSatisfaction"] == DBNull.Value ? null : reader["JobSatisfaction"],
            EnvironmentSatisfaction = reader["EnvironmentSatisfaction"] == DBNull.Value ? null : reader["EnvironmentSatisfaction"],
            RelationshipSatisfaction = reader["RelationshipSatisfaction"] == DBNull.Value ? null : reader["RelationshipSatisfaction"]
        });
    }

    [HttpPut("{id}")]
    public IActionResult UpdateEmployee(int id, [FromBody] Employee employee)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        var userIdQuery = "SELECT Id FROM Users WHERE Email = @Email";
        using var userIdCommand = new MySqlCommand(userIdQuery, connection);
        userIdCommand.Parameters.AddWithValue("@Email", employee.Email);
        userIdCommand.Prepare();
        var userIdReader = userIdCommand.ExecuteReader();
        if (!userIdReader.Read())
        {
            return NotFound(new { Message = "User not found" });
        }
        var userId = userIdReader["Id"];
        userIdReader.Close();

        var query = "UPDATE Employees SET FirstName = @FirstName, LastName = @LastName, Email = @Email, Phone = @Phone, Gender = @Gender, HireDate = @HireDate, BirthDate = @BirthDate, Address = @Address, Country = @Country, City = @City, MarriedStatus = @MarriedStatus, HaveChildren = @HaveChildren, NumberOfChildren = @NumberOfChildren, DistanceToWork = @DistanceToWork, JobLevel = @JobLevel, WorkModel = @WorkModel, EducationLevel = @EducationLevel, JobSatisfaction = @JobSatisfaction, EnvironmentSatisfaction = @EnvironmentSatisfaction, RelationshipSatisfaction = @RelationshipSatisfaction, UserId = @UserId WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@FirstName", employee.FirstName);
        command.Parameters.AddWithValue("@LastName", employee.LastName);
        command.Parameters.AddWithValue("@Email", employee.Email);
        command.Parameters.AddWithValue("@Phone", employee.Phone);
        command.Parameters.AddWithValue("@Gender", employee.Gender);
        command.Parameters.AddWithValue("@HireDate", employee.HireDate);
        command.Parameters.AddWithValue("@BirthDate", employee.BirthDate);
        command.Parameters.AddWithValue("@Address", employee.Address);
        command.Parameters.AddWithValue("@Country", employee.Country);
        command.Parameters.AddWithValue("@City", employee.City);
        command.Parameters.AddWithValue("@MarriedStatus", employee.MarriedStatus);
        command.Parameters.AddWithValue("@HaveChildren", employee.HaveChildren);
        command.Parameters.AddWithValue("@NumberOfChildren", employee.NumberOfChildren);
        command.Parameters.AddWithValue("@DistanceToWork", employee.DistanceToWork);
        command.Parameters.AddWithValue("@EducationLevel", employee.EducationLevel);
        command.Parameters.AddWithValue("@JobLevel", employee.JobLevel);
        command.Parameters.AddWithValue("@WorkModel", employee.WorkModel);
        command.Parameters.AddWithValue("@JobSatisfaction", employee.JobSatisfaction);
        command.Parameters.AddWithValue("@EnvironmentSatisfaction", employee.EnvironmentSatisfaction);
        command.Parameters.AddWithValue("@RelationshipSatisfaction", employee.RelationshipSatisfaction);
        command.Parameters.AddWithValue("@UserId", userId);

        command.ExecuteNonQuery();

        if (command.ExecuteNonQuery() == 0)
        {
            return NotFound(new { Message = "Employee not found" });
        }
        if (command.ExecuteNonQuery() > 1)
        {
            return BadRequest(new { Message = "Multiple employees found" });
        }
        return Ok(new { Message = "Employee updated successfully" });
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteEmployee(int id)
    {
        using var connection = _dbHelper.GetConnection();
        connection.Open();

        var selectQuery = "SELECT Email, UserId FROM Employees WHERE Id = @Id";
        using var selectCommand = new MySqlCommand(selectQuery, connection);
        selectCommand.Parameters.AddWithValue("@Id", id);
        using var reader = selectCommand.ExecuteReader();

        if (!reader.Read())
        {
            return NotFound(new { Message = "Employee not found" });
        }

        var email = reader["Email"].ToString();
        var userId = reader["UserId"].ToString();
        reader.Close();

        var query = "DELETE FROM Employees WHERE Id = @Id";
        using var command = new MySqlCommand(query, connection);

        var deleteUserQuery = "DELETE FROM Users WHERE Id = @UserId";
        using var deleteUserCommand = new MySqlCommand(deleteUserQuery, connection);
        deleteUserCommand.Parameters.AddWithValue("@UserId", userId);
        deleteUserCommand.ExecuteNonQuery();


        command.Parameters.AddWithValue("@Id", id);
        command.ExecuteNonQuery();

        return Ok(new { Message = "Employee deleted successfully" });
    }
}
