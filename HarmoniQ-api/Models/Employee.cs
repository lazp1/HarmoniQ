namespace HRMSApi.Models
{
    public class Employee
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public required string Email { get; set; }
        public string Phone { get; set; }
        public string Gender { get; set; }
        public DateTime HireDate { get; set; }
        public DateTime BirthDate { get; set; }
        public string Address { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public int MarriedStatus { get; set; }
        public int HaveChildren { get; set; }
        public int NumberOfChildren { get; set; }
        public int DistanceToWork { get; set; }
        public string EducationLevel { get; set; }
        public required int UserId { get; set; }
        public object JobLevel { get; set; }
        public object WorkModel { get; set; }
        public int? JobSatisfaction { get; set; }
        public int? EnvironmentSatisfaction { get; set; }
        public int? RelationshipSatisfaction { get; set; }
    }
}
