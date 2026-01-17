/* import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not defined");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default sgMail; */

/*   try {
            const response = await transporter.sendMail({
                from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
                to: email,
                subject: "Password Reset Code",
                html: `
            <div>
                <p>Your password reset code is: <b>${resetCode}</b></p>
                <p>It is valid for 3 minutes.</p>
                <p>
                    <a href="${resetUrl}">AUTOVIBE</a>
                </p>
                <hr />
                <p style="font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} Autovibe
                </p>
            </div>
                `,
            }); */

/* const response = await sgMail.send({
                to: email,
                from: {
                    email: process.env.FROM_EMAIL!,
                    name: process.env.FROM_NAME!,
                },
                subject: "Password Reset Code",
                html: `
            <div>
                <p>Your password reset code is: <b>${resetCode}</b></p>
                <p>It is valid for 3 minutes.</p>
                <p>
                    <a href="${resetUrl}" target="_blank">AUTOVIBE</a>
                </p>
                <hr />
                <p style="font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} Autovibe
                </p>
            </div>
        `,
            });*/
