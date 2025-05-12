namespace HRMSApi.Models.Requests;

public class BulkEmailRequest
{
    public List<int>? SpecificEmployeeIds { get; set; }
    public List<int>? DepartmentIds { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; } = false;
}
