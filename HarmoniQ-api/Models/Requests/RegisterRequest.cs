using System.ComponentModel.DataAnnotations;

namespace HRMSApi.Models
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        public required string Password { get; set; }
        public int DepartmentId { get; set; }

        // [Required(ErrorMessage = "Role is required.")]
        public string? Role { get; set; } = "User"; // Admin, Manager or User
    }
}
