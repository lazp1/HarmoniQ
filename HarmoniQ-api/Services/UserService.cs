using System.Data;
using System.Threading.Tasks;
using HRMSApi.Models;
using MySql.Data.MySqlClient;

namespace HRMSApi.Services
{
    public class UserService
    {
        private readonly DatabaseHelper _dbHelper;

        public UserService(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Get user by email
        public async Task<User> GetUserByEmailAsync(string email)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            const string query = "SELECT Id, Email, PasswordHash, Role FROM Users WHERE Email = @Email";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@Email", email);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new User
                {
                    Id = reader.GetInt32("Id"),
                    Email = reader.GetString("Email"),
                    PasswordHash = reader.GetString("PasswordHash"),
                    Role = reader.GetString("Role")
                };
            }

            return null; // User not found
        }

        // Check if a user exists by email
        public async Task<bool> UserExistsAsync(string email)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            const string query = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@Email", email);

            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result) > 0;
        }

        // Add a new user
        public async Task AddUserAsync(User user)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            const string query = "INSERT INTO Users (Email, PasswordHash, Role) VALUES (@Email, @PasswordHash, @Role)";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@Email", user.Email);
            command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
            command.Parameters.AddWithValue("@Role", user.Role);
            await command.ExecuteNonQueryAsync();

            const string getUserQuery = "SELECT Id FROM Users WHERE Email = @Email";
            using var getUserCommand = new MySqlCommand(getUserQuery, connection);
            getUserCommand.Parameters.AddWithValue("@Email", user.Email);

            user.Id = (int)await getUserCommand.ExecuteScalarAsync();

            await AddEmployee(new Employee { Email = user.Email, UserId = user.Id });
            const string getEmployeeQuery = "SELECT Id FROM Employees WHERE Email = @Email";
            using var getEmployeeCommand = new MySqlCommand(getEmployeeQuery, connection);
            getEmployeeCommand.Parameters.AddWithValue("@Email", user.Email);

            var employeeId = (int)await getEmployeeCommand.ExecuteScalarAsync();
            await AddEmployeeToDepartment(new EmployeeDepartment { EmployeeId = employeeId, DepartmentId = user.DepartmentId }); // Add employee to department

        }

        private async Task AddEmployeeToDepartment(EmployeeDepartment employeeDepartment)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            const string query = "INSERT INTO Employees_Departments (EmployeeId, DepartmentId) VALUES (@EmployeeId, @DepartmentId)";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@EmployeeId", employeeDepartment.EmployeeId);
            command.Parameters.AddWithValue("@DepartmentId", employeeDepartment.DepartmentId);

            await command.ExecuteNonQueryAsync();
        }

        //Create employee from user
        public async Task AddEmployee(Employee employee)
        {
            using var connection = _dbHelper.GetConnection();
            await connection.OpenAsync();

            const string query = "INSERT INTO Employees (FirstName, LastName, Email, Phone, Gender, HireDate, BirthDate, Address, Country, City, MarriedStatus, HaveChildren, NumberOfChildren, DistanceToWork, EducationLevel, JobSatisfaction, EnvironmentSatisfaction, RelationshipSatisfaction, UserId) VALUES (@FirstName, @LastName, @Email, @Phone, @Gender, @HireDate, @BirthDate, @Address, @Country, @City, @MarriedStatus, @HaveChildren, @NumberOfChildren, @DistanceToWork, @EducationLevel, @JobSatisfaction, @EnvironmentSatisfaction, @RelationshipSatisfaction, @UserId)";
            using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@FirstName", employee.FirstName ?? " ");
            command.Parameters.AddWithValue("@LastName", employee.LastName ?? " ");
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
            command.Parameters.AddWithValue("@JobSatisfaction", employee.JobSatisfaction);
            command.Parameters.AddWithValue("@EnvironmentSatisfaction", employee.EnvironmentSatisfaction);
            command.Parameters.AddWithValue("@RelationshipSatisfaction", employee.RelationshipSatisfaction);
            command.Parameters.AddWithValue("@UserId", employee.UserId);

            await command.ExecuteNonQueryAsync();
        }
    }

}
