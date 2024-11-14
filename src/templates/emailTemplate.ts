export const generateSignupConfirmationTemplate = (userName: string) => {
    const subject = "Re-Light LMS - サインアップ確認";
    const text = `こんにちは、${userName}さん。\n
                  \nRe-Light LMS へのサインアップが完了しました。これから学習を開始しましょう！\n
                  \nサポートが必要な場合はいつでもご連絡ください。\n
                  \nRe-Light LMS チーム`;

    const html = `
      <h1>こんにちは、${userName}さん</h1>
      <p>Re-Light LMS へのサインアップが完了しました。これから学習を開始しましょう！</p>
      <p>サポートが必要な場合はいつでもご連絡ください。</p>
      <br/>
      <p>Re-Light LMS チーム</p>
    `;
    return { subject, text, html };
  };

  export const generateCompanySignupConfirmationTemplate = (userName: string, companyCode: string) => {
    const subject = "Re-Light LMS - 企業管理者アカウントの登録完了";
    const text = `こんにちは、${userName}さん。\n
                  \nRe-Light LMS への企業管理者アカウントのサインアップが完了しました。\n
                  \nあなたの企業コードは以下の通りです:
                  \n企業コード: ${companyCode}\n
                  \nこの企業コードは、他の従業員があなたの企業アカウントに参加する際に使用されます。\n
                  \n従業員がアカウントを作成する際にこのコードを伝えてください。\n
                  \n管理者専用のダッシュボードにアクセスして、従業員の登録や進捗を管理しましょう。\n
                  \nRe-Light LMS チーム`;
    
    const html = `
      <h1>こんにちは、${userName}さん</h1>
      <p>Re-Light LMS への企業管理者アカウントのサインアップが完了しました。</p>
      <p>あなたの企業コードは以下の通りです:</p>
      <p><strong>企業コード: ${companyCode}</strong></p>
      <p>この企業コードは、他の従業員があなたの企業アカウントに参加する際に使用されます。</p>
      <p>従業員がアカウントを作成する際に、このコードを伝えてください。</p>
      <br/>
      <p>Re-Light LMS チーム</p>
    `;
    return { subject, text, html };
  };

  /**
   * パスワードリセット用のメールテンプレート
   * @param resetLink - パスワードリセット用リンク
   */
  export const generatePasswordResetTemplate = (resetLink: string) => {
    const subject = "Re-Light LMS - パスワードリセット";
    const text = `パスワードのリセットをリクエストされました。\n
                  以下のリンクをクリックしてパスワードをリセットしてください。\n
                  \nパスワードリセットリンク: ${resetLink}\n
                  \nもしこのリクエストに覚えがない場合は、無視してください。`;
    const html = `
      <h1>パスワードリセットのご案内</h1>
      <p>パスワードのリセットをリクエストされました。</p>
      <p>以下のリンクをクリックしてパスワードをリセットしてください。</p>
      <a href="${resetLink}" style="color: #3869d4;">パスワードをリセットする</a>
      <br/><br/>
      <p>もしこのリクエストに覚えがない場合は、このメールを無視してください。</p>
    `;
    return { subject, text, html };
  };
  