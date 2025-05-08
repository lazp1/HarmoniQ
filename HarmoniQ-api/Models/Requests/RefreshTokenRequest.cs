using System.ComponentModel.DataAnnotations;

namespace HRMSApi.Models
{
    public class RefreshTokenRequest
    {

        [Required(ErrorMessage = "Token is required.")]
        public object Token { get; set; }
    }
}
