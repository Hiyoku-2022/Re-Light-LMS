import nodemailer from "nodemailer";

// テスト用のメール送信関数
const sendTestEmail = async () => {
  const transporter = nodemailer.createTransport({
    host: "mail92.onamae.ne.jp", // 使用する SMTP サーバーのホスト名
    port: 465,                   // 使用するポート（SSL/TLS）
    secure: true,                // ポート 465 の場合は true
    auth: {
      user: "system@re-light-lms.com", // 実際のメールアドレスを設定
      pass: "Hiyoku-engineer.202211",    // 実際のメールアドレスのパスワードを設定
    },
  });

  const mailOptions = {
    from: "system@re-light-lms.com", // 送信元のメールアドレス
    to: "shimayanobuhiko@gmail.com",    // 受信者のメールアドレス
    subject: "テストメール",          // メールの件名
    text: "これはテストメールです",      // メール本文
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("メール送信成功:", info.messageId);
  } catch (error) {
    console.error("メール送信エラー:", error);
  }
};

// テストメール送信を実行
sendTestEmail();
