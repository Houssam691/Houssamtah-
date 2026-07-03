const RESEND_API = "https://api.resend.com/emails";

export async function sendVerificationEmail(params: {
  to: string;
  firstName: string;
  token: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify-email?token=${params.token}`;

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">مرحباً ${params.firstName}!</h2>
      <p>شكراً لتسجيلك في منصتنا. يرجى تأكيد بريدك الإلكتروني بالنقر على الرابط أدناه:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          تأكيد البريد الإلكتروني
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">هذا الرابط صالح لمدة 24 ساعة. إذا لم تقم بالتسجيل، يمكنك تجاهل هذه الرسالة.</p>
      <p style="color: #666; font-size: 14px;">إذا لم يعمل الزر، انسخ الرابط التالي والصقه في متصفحك:</p>
      <p style="color: #4f46e5; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
    </div>
  `;

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "BUPG <noreply@bupg.local>",
        to: params.to,
        subject: "تأكيد البريد الإلكتروني - BUPG",
        html,
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}
