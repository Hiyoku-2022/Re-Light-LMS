"use client";

import AdminSignUpForm from "@/components/forms/AdminSignUpForm"; // AdminSignUpForm をインポート

export default function AdminPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <AdminSignUpForm />
    </div>
  );
}
