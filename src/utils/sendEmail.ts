import nodemailer from "nodemailer";

// Nodemailer の設定を行う（環境変数から読み込み）
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465, // SSL使用時: 465, 非SSL: 587
  secure: Number(process.env.SMTP_PORT) === 465, // ポート 465 の場合は true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * 汎用的なメール送信関数
 * @param mailOptions - メール送信の設定（宛先、件名、本文など）
 */
export async function sendEmail({ to, subject, text, html }: MailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`メール送信成功: ${info.messageId}`);
  } catch (error) {
    console.error(`メール送信エラー: ${(error as Error).message}`);
    throw new Error(`メール送信に失敗しました: ${(error as Error).message}`);
  }
}