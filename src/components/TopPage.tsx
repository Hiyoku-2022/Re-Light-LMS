"use client";

import { useState } from "react";
import { Button } from "@/components/UI/Button";
import { Card } from "@/components/UI/Card";
import Link from "next/link";
import Image from "next/image";
import { SignupForm } from "@/components/Forms/UserSignupForm";
import { UserLoginForm } from "@/components/Forms/UserLoginForm";
import { CompanySignUpForm } from "@/components/Forms/CompanySignUpForm";
import { CompanyLoginForm } from "@/components/Forms/CompanyLoginForm";
import { PasswordResetRequestForm } from "@/components/Forms/PasswordResetRequestForm";

export function TopPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentForm, setCurrentForm] = useState<
    "signup" | "login" | "companyPreSignup" | "companyLogin" | "passwordReset" | "companyCodeRequest"
  >("signup");

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      toggleModal();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
          onClick={handleOverlayClick}
        ></div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={toggleModal}
            >
              ✕
            </button>
            {/* モーダル内に表示するフォームを切り替え */}
            {currentForm === "signup" ? (
              <SignupForm onSwitchForm={(formType) => setCurrentForm(formType)} />
            ) : currentForm === "login" ? (
              <UserLoginForm onSwitchForm={(formType) => setCurrentForm(formType)} />
            ) : currentForm === "companyPreSignup" ? (
              <CompanySignUpForm onSwitchForm={(formType) => setCurrentForm(formType)} />
            ) : currentForm === "companyLogin" ? (
              <CompanyLoginForm onSwitchForm={(formType) => setCurrentForm(formType)} />
            ) : currentForm === "passwordReset" ? (
              <PasswordResetRequestForm onSwitchForm={(formType) => setCurrentForm(formType)} />
            ) : (
              <SignupForm onSwitchForm={(formType) => setCurrentForm(formType)} />
            )}
          </div>
        </div>
      )}

      <header className="bg-white shadow">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Image src="/Logo.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
            <span className="text-xl text-soft-blue">Re-Light LMS</span>
          </div>
          <div className="space-x-4">
            <Button
              variant="outline"
              className="bg-soft-blue text-white hover:text-gray-400"
              onClick={() => {
                setCurrentForm("signup");
                toggleModal();
              }}
            >
              新規登録 / ログイン
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <section className="bg-blue-100 p-6 rounded-lg flex flex-col items-center justify-between md:flex-row ">
          <div className="text-center">
            <h1 className="text-2xl text-navy font-bold mb-2 text-left">世界で通用するエンジニアへ</h1>
            <p className="text-light-blue mb-4 text-left">Re-Light LMSでプログラミングを学んでトップエンジニアを目指しましょう。</p>
            <Image
            src="/TopImage.png"
            alt="Illustration"
            className="h-72 w-96 mt-4 md:mt-0 inline-block md:hidden"
            width={384}
            height={288}
            style={{ objectFit: "cover" }}
            />
            <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-4 mt-10">
              <Button
                variant="default"
                className="bg-light-green text-white hover:text-gray-400 mb-2 md:mb-0 w-3/4 md:w-auto"
                onClick={() => {
                  setCurrentForm("login");
                  toggleModal();
                }}
              >
                ユーザー登録 / ログイン
              </Button>
              <Button
                className="bg-light-green text-white hover:text-gray-400 mb-2 md:mb-0 w-3/4 md:w-auto"
                onClick={() => {
                  setCurrentForm("companyLogin");
                  toggleModal();
                }}
              >
                会社登録 / ログイン
              </Button>
            </div>
          </div>
          <Image
            src="/TopImage.png"
            alt="Illustration"
            className="h-72 w-96 mt-4 md:mt-0 hidden  md:inline-block"
            width={384}
            height={288}
            style={{ objectFit: "cover" }}
          />
        </section>
        <section className="mt-8">
          <h2 className="text-xl text-navy font-bold mb-4">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <Image
                src="/HTML.svg"
                alt="HTML"
                width={150}
                height={150}
                className="h-36 w-64 object-cover mb-4"
              />
              <h3 className="text-lg text-light-blue mb-2">HTML</h3>
              <p className="text-light-gray">
                まずはウェブサイトに文字を表示する方法から学んでいきましょう。
              </p>
            </Card>
            <Card className="p-4">
              <Image
                src="/CSS.svg"
                alt="CSS"
                width={150}
                height={150}
                className="h-36 w-64 object-cover mb-4"
              />
              <h3 className="text-lg text-light-blue mb-2">CSS</h3>
              <p className="text-light-gray">
                コースを終了すると、Webアプリやサイトのデザインを作成するスキルが身につきます。
              </p>
            </Card>
            <Card className="p-4">
              <Image
                src="/Bootstrap.svg"
                alt="Bootstrap"
                width={150}
                height={150}
                className="h-36 w-64 object-cover mb-4"
              />
              <h3 className="text-lg text-light-blue mb-2">Bootstrap</h3>
              <p className="text-light-gray">
                開発をより高速に進めることができるようになります。
              </p>
            </Card>
            <Card className="p-4">
              <Image
                src="/JavaScript.svg"
                alt="JavaScript"
                width={150}
                height={150}
                className="h-36 w-64 object-cover mb-4"
              />
              <h3 className="text-lg text-light-blue mb-2">JavaScript</h3>
              <p className="text-light-gray">
                画面に動きをつけたり、サーバーと情報を送信することができるようになります。
              </p>
            </Card>
            <Card className="p-4">
              <Image
                src="/PHP.svg"
                alt="PHP"
                width={150}
                height={150}
                className="h-36 w-64 object-cover mb-4"
              />
              <h3 className="text-lg text-light-blue mb-2">PHP</h3>
              <p className="text-light-gray">
                オンラインショップ機能を実装したWebサイトを開発できるようになります。
              </p>
            </Card>
            <Card className="p-4">
              <Image
                src="/DataBase.svg"
                alt="DataBase"
                width={150}
                height={150}
                className="h-36 w-64 object-cover mb-4"
              />
              <h3 className="text-lg text-light-blue mb-2">DataBase</h3>
              <p className="text-light-gray">
                データベースについて理解を深め、効率的なデータ管理を行う方法を学んでいきます。
              </p>
            </Card>
          </div>
        </section>
      </main>
      <footer className="bg-white shadow mt-8">
        <div className="container mx-auto p-4 flex justify-between">
          <div className="space-x-4">
            {/* <Link href="#" className="text-muted-foreground" prefetch={false}>
              プライバシー
            </Link>
            <Link href="#" className="text-muted-foreground" prefetch={false}>
              利用規約
            </Link> */}
          </div>
          <div className="text-muted-foreground">© 2024 - Re-Light. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
