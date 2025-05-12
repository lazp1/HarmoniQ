using System.Net;
using System.Net.Mail;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace HRMSApi.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private const int BATCH_SIZE = 5; // Process 5 emails at a time

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        
        _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? throw new InvalidOperationException("SMTP server configuration is missing");
        _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? throw new InvalidOperationException("SMTP port configuration is missing"));
        _smtpUsername = _configuration["EmailSettings:SmtpUsername"] ?? throw new InvalidOperationException("SMTP username configuration is missing");
        _smtpPassword = _configuration["EmailSettings:SmtpPassword"] ?? throw new InvalidOperationException("SMTP password configuration is missing");
        _senderEmail = _configuration["EmailSettings:SenderEmail"] ?? throw new InvalidOperationException("Sender email configuration is missing");
        _senderName = _configuration["EmailSettings:SenderName"] ?? throw new InvalidOperationException("Sender name configuration is missing");
    }

    private SmtpClient CreateSmtpClient()
    {
        // For SMTPS (port 465), we need to specify the host without the protocol
        var host = _smtpServer.Replace("smtp://", "").Replace("smtps://", "");
        
        var client = new SmtpClient(host)
        {
            Port = _smtpPort,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
            EnableSsl = true,
            Timeout = 30000 // 30 seconds timeout
        };

        return client;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
    {
        using var smtpClient = CreateSmtpClient();
        using var mailMessage = new MailMessage
        {
            From = new MailAddress(_senderEmail, _senderName),
            Subject = subject,
            Body = body,
            IsBodyHtml = isHtml
        };
        mailMessage.To.Add(toEmail);

        try
        {
            await smtpClient.SendMailAsync(mailMessage);
        }
        catch (SmtpException ex)
        {
            var details = new StringBuilder();
            details.AppendLine($"Failed to send email to {toEmail}");
            details.AppendLine($"SMTP Status Code: {ex.StatusCode}");
            details.AppendLine($"SMTP Server Response: {ex.Message}");
            details.AppendLine($"SMTP Server: {_smtpServer}:{_smtpPort}");
            details.AppendLine($"SSL Enabled: {smtpClient.EnableSsl}");
            details.AppendLine($"Using Default Credentials: {smtpClient.UseDefaultCredentials}");
            details.AppendLine($"From Address: {mailMessage.From}");

            throw new Exception(details.ToString(), ex);
        }
        catch (Exception ex)
        {
            throw new Exception($"Unexpected error sending email to {toEmail}: {ex.Message}", ex);
        }
    }

    public async Task SendBulkEmailAsync(List<string> toEmails, string subject, string body, bool isHtml = true)
    {
        var failures = new List<(string email, string errorMessage)>();

        // Process emails in batches to prevent overwhelming the SMTP server
        for (int i = 0; i < toEmails.Count; i += BATCH_SIZE)
        {
            var batch = toEmails.Skip(i).Take(BATCH_SIZE);
            var tasks = batch.Select(async email => 
            {
                try 
                {
                    await SendEmailAsync(email, subject, body, isHtml);
                    return (email, errorMessage: (string?)null);
                }
                catch (Exception ex)
                {
                    return (email, errorMessage: ex.Message);
                }
            });
            
            var results = await Task.WhenAll(tasks);
            var batchFailures = results.Where(r => r.errorMessage != null)
                                     .Select(r => (r.email, r.errorMessage!));
            failures.AddRange(batchFailures);

            // Add a small delay between batches to avoid overwhelming the server
            if (i + BATCH_SIZE < toEmails.Count)
            {
                await Task.Delay(1000); // 1 second delay between batches
            }
        }

        if (failures.Any())
        {
            var errorMessage = new StringBuilder("Some emails failed to send:\n");
            foreach (var (email, error) in failures)
            {
                errorMessage.AppendLine($"- {email}: {error}");
            }
            throw new Exception(errorMessage.ToString());
        }
    }
}
