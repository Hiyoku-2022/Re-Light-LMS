import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function TopPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <img
              src="/Logo.svg"
              alt="Logo"
              className="h-10 w-10"
              width="40"
              height="40"
              style={{ aspectRatio: "40/40" }}
            />
            <span className="text-xl text-soft-blue">Re-Light LMS</span>
          </div>
          <div className="space-x-4">
            <Button variant="outline" className="bg-soft-blue text-white">新規登録 / ログイン</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <section className="bg-blue-100 p-6 rounded-lg flex flex-col items-center justify-between md:flex-row">
          <div>
            <h1 className="text-2xl text-navy font-bold mb-2">世界で通用するエンジニアへ</h1>
            <p className="text-light-blue mb-4">Re-Light LMSでプログラミングを学んでトップエンジニアを目指しましょう。</p>
            <div className="space-x-4 flex flex-col items-center md:flex-row mt-10">
              <Button variant="default" className="bg-light-green text-white mb-2 md:mb-0 w-full md:w-auto">
                ユーザー登録 / ログイン
              </Button>
              <Button className="bg-light-green text-white mb-2 md:mb-0 w-full md:w-auto mx-auto">
                会社登録 / ログイン
              </Button>
            </div>
          </div>
          <img
            src="/TopImage.png"
            alt="Illustration"
            className="h-72 w-96 mt-4 md:mt-0"
            width="200"
            height="200"
            style={{ aspectRatio: "200/200", objectFit: "cover" }}
          />
        </section>
        <section className="mt-8">
          <h2 className="text-xl text-navy font-bold mb-4">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <img
                src="/HTML.svg"
                alt="HTML"
                className="h-36 w-64 object-cover mb-4"
                width="150"
                height="150"
                style={{ aspectRatio: "150/150", objectFit: "cover" }}
              />
              <h3 className="text-lg text-light-blue mb-2">HTML</h3>
              <p className="text-light-gray">まずはウェブサイトに文字を表示する方法から学んでいきましょう。</p>
            </Card>
            <Card className="p-4">
              <img
                src="/CSS.svg"
                alt="CSS"
                className="h-36 w-64 object-cover mb-4"
                width="150"
                height="150"
                style={{ aspectRatio: "150/150", objectFit: "cover" }}
              />
              <h3 className="text-lg text-light-blue mb-2">CSS</h3>
              <p className="text-light-gray">コースを終了すると、Webアプリやサイトのデザインを作成するスキルが身につきます。</p>
            </Card>
            <Card className="p-4">
              <img
                src="/Bootstrap.svg"
                alt="Bootstrap"
                className="h-36 w-64 object-cover mb-4"
                width="150"
                height="150"
                style={{ aspectRatio: "150/150", objectFit: "cover" }}
              />
              <h3 className="text-lg text-light-blue mb-2">Bootstrap</h3>
              <p className="text-light-gray">開発をより高速に進めることができるようになります。</p>
            </Card>
            <Card className="p-4">
              <img
                src="/JavaScript.svg"
                alt="JavaScript"
                className="h-36 w-64 object-cover mb-4"
                width="150"
                height="150"
                style={{ aspectRatio: "150/150", objectFit: "cover" }}
              />
              <h3 className="text-lg text-light-blue mb-2">JavaScript</h3>
              <p className="text-light-gray">画面に動きをつけたり、サーバーと情報を送信することができるようになります。</p>
            </Card>
            <Card className="p-4">
              <img
                src="/PHP.svg"
                alt="PHP"
                className="h-36 w-64 object-cover mb-4"
                width="150"
                height="150"
                style={{ aspectRatio: "150/150", objectFit: "cover" }}
              />
              <h3 className="text-lg text-light-blue mb-2">PHP</h3>
              <p className="text-light-gray">オンラインショップ機能を実装したWebサイトを開発できるようになります。</p>
            </Card>
            <Card className="p-4">
              <img
                src="/DataBase.svg"
                alt="DataBase"
                className="h-36 w-64 object-cover mb-4"
                width="150"
                height="150"
                style={{ aspectRatio: "150/150", objectFit: "cover" }}
              />
              <h3 className="text-lg text-light-blue mb-2">DataBase</h3>
              <p className="text-light-gray">データベースについて理解を深め、効率的なデータ管理を行う方法を学んでいきましょう。</p>
            </Card>
          </div>
        </section>
      </main>
      <footer className="bg-white shadow mt-8">
        <div className="container mx-auto p-4 flex justify-between">
          <div className="space-x-4">
            <Link href="#" className="text-muted-foreground" prefetch={false}>
              プライバシー
            </Link>
            <Link href="#" className="text-muted-foreground" prefetch={false}>
              利用規約
            </Link>
          </div>
          <div className="text-muted-foreground">© 2024 - Re-Light. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
