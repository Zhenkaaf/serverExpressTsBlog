import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

interface SendResetEmailParams {
    toEmail: string;
    resetCode: string;
    resetUrl: string;
    brevoApiKey: string;
    senderName: string;
    senderEmail: string;
}

export async function sendResetEmail({
    toEmail,
    resetCode,
    resetUrl,
    brevoApiKey,
    senderName,
    senderEmail,
}: SendResetEmailParams) {
    const emailApi = new TransactionalEmailsApi();
    (emailApi as any).authentications.apiKey.apiKey = brevoApiKey;

    const message = new SendSmtpEmail();
    message.sender = { name: senderName, email: senderEmail };
    message.to = [{ email: toEmail }];
    message.subject = "Reset password AutoVibe";
    message.htmlContent = `
        <div>
            <p>Your password reset code is: <b>${resetCode}</b></p>
            <p>It is valid for 3 minutes.</p>
            <p>
                <a href="${resetUrl}" target="_blank">Reset password link</a>
            </p>
            <hr />
            <p style="font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} AutoVibe
            </p>
        </div>
    `;

    try {
        const response = await emailApi.sendTransacEmail(message);
        console.log("Письмо отправлено:", response.body);
        return response;
    } catch (err) {
        console.error("sendResetEmail Error", err);
        throw new Error("Failed to send reset email");
    }
}

/*  // Настройка Brevo
        const emailApi = new TransactionalEmailsApi();
        (emailApi as any).authentications.apiKey.apiKey = brevoApiKey;
        // Создание письма
        const message = new SendSmtpEmail();
        message.sender = {
            name: senderName,
            email: senderEmail,
        };
        message.to = [{ email }];
        message.subject = "Reset password AutoVibe";
        message.htmlContent = `
            <div>
                <p>Your password reset code is: <b>${resetCode}</b></p>
                <p>It is valid for 3 minutes.</p>
                <p>
                    <a href="${resetUrl}" target="_blank">Reset password link</a>
                </p>
                <hr />
                <p style="font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} AutoVibe
                </p>
            </div>
        `;
        console.log("Создание письмаOK");
        // Отправка письма и ожидание результата
        const response = await emailApi.sendTransacEmail(message);
        console.log("Письмо отправлено:", response.body); */
