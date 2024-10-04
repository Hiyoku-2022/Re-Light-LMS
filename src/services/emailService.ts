import { sendEmail } from "@/utils/sendEmail"; 
import { generateSignupConfirmationTemplate, generatePasswordResetTemplate, generateCompanySignupConfirmationTemplate } from "@/templates/emailTemplate";

/**
 * サインアップ確認メールを送信
 * @param to - 受信者のメールアドレス
 * @param userName - ユーザー名
 */
export async function sendSignupConfirmationEmail(to: string, userName: string): Promise<void> {
  const { subject, text, html } = generateSignupConfirmationTemplate(userName);
  await sendEmail({ to, subject, text, html });
}

/**
 * パスワードリセット用のメールを送信
 * @param to - 受信者のメールアドレス
 * @param resetLink - パスワードリセットリンク
 */
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const { subject, text, html } = generatePasswordResetTemplate(resetLink);
  await sendEmail({ to, subject, text, html });
}

/**
 * 企業サインアップ確認メールを送信
 * @param to - 受信者のメールアドレス
 * @param userName - 担当者名
 * @param companyCode - 企業コード
 */
export async function sendCompanySignupConfirmationEmail(to: string, userName: string, companyCode: string): Promise<void> {
  const { subject, text, html } = generateCompanySignupConfirmationTemplate(userName, companyCode);
  await sendEmail({ to, subject, text, html });
}
