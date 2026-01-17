export function validateBrevoEnv() {
    const required = [
        "BREVO_API_KEY",
        "BREVO_SENDER_NAME",
        "BREVO_SENDER_EMAIL",
        "RESET_PASSWORD_URL",
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0)
        throw new Error(`Missing Brevo ENV: ${missing.join(", ")}`);
    return {
        brevoApiKey: process.env.BREVO_API_KEY!,
        senderName: process.env.BREVO_SENDER_NAME!,
        senderEmail: process.env.BREVO_SENDER_EMAIL!,
        resetPasswordURL: process.env.RESET_PASSWORD_URL!,
    };
}
