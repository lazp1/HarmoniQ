using Google.Protobuf.WellKnownTypes;

namespace HRMSApi.Models
{
    public class Salary
    {
        public int Id { get; internal set; }
        public string EmployeeId { get; set; }
        public string Amount { get; set; }
        public string SubmitterId { get; set; }
        public int Status { get; set; }

        public Timestamp? CreatedAt { get; set; }
    }

    enum Status
    {
        Open,
        Done,
        Closed
    }
}
