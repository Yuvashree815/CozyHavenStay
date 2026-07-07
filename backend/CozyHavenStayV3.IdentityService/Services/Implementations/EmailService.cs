using System.Net;
using System.Net.Mail;
using CozyHavenStayV3.IdentityService.Services.Interfaces;

namespace CozyHavenStayV3.IdentityService.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            var smtpHost = _configuration["EmailSettings:SmtpHost"]!;
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]!);
            var senderEmail = _configuration["EmailSettings:SenderEmail"]!;
            var senderName = _configuration["EmailSettings:SenderName"]!;
            var appPassword = _configuration["EmailSettings:AppPassword"]!;

            var subject = "Reset Your CozyHavenStay Password";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body {{ font-family: Arial, sans-serif; background: #f8f6f2; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 40px auto; background: white;
                  border-radius: 12px; overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
    .header {{ background: linear-gradient(135deg, #1a3c5e, #2d6a9f);
               padding: 2rem; text-align: center; }}
    .header h1 {{ color: white; margin: 0; font-size: 1.5rem; }}
    .header p {{ color: rgba(255,255,255,0.8); margin: 0.5rem 0 0; font-size: 0.9rem; }}
    .body {{ padding: 2rem; }}
    .body p {{ color: #5a5a7a; line-height: 1.6; margin-bottom: 1rem; }}
    .btn {{ display: inline-block; background: #c9a84c; color: #1a3c5e;
             padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none;
             font-weight: 700; font-size: 1rem; margin: 1rem 0; }}
    .footer {{ background: #f8f6f2; padding: 1rem 2rem;
               text-align: center; color: #9090a8; font-size: 0.8rem; }}
    .warning {{ background: #fff3cd; border: 1px solid #ffeeba;
                border-radius: 8px; padding: 0.75rem 1rem;
                color: #856404; font-size: 0.85rem; margin-top: 1rem; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>🏨 CozyHavenStay</h1>
      <p>Password Reset Request</p>
    </div>
    <div class='body'>
      <p>Hello,</p>
      <p>We received a request to reset the password for your CozyHavenStay account.
         Click the button below to reset your password:</p>
      <div style='text-align: center;'>
        <a href='{resetLink}' class='btn'>Reset My Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style='word-break: break-all; color: #1a3c5e; font-size: 0.85rem;'>
        {resetLink}
      </p>
      <div class='warning'>
        ⚠️ This link will expire in <strong>1 hour</strong>.
        If you did not request a password reset, please ignore this email.
      </div>
    </div>
    <div class='footer'>
      © 2026 CozyHavenStay · All rights reserved
    </div>
  </div>
</body>
</html>";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(senderEmail, appPassword),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message);
        }
    }
}