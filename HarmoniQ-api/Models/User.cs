namespace HRMSApi.Models
{
    public class User
    {
        public int Id { get; internal set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
        public int DepartmentId { get; set; }
    }

    enum Role
    {
        Admin,
        Manager,
        User
    }
}
