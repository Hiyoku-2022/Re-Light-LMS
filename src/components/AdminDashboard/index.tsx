import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">管理者ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admindashboard/content-management">
          <div className="p-4 border rounded-lg bg-gray-100 text-center hover:bg-gray-200 cursor-pointer">
            コンテンツ管理
          </div>
        </Link>
        <Link href="/admindashboard/task-management">
          <div className="p-4 border rounded-lg bg-gray-100 text-center hover:bg-gray-200 cursor-pointer">
            課題管理
          </div>
        </Link>
        <Link href="/admindashboard/user-management">
          <div className="p-4 border rounded-lg bg-gray-100 text-center hover:bg-gray-200 cursor-pointer">
            ユーザー管理
          </div>
        </Link>
        <Link href="/admindashboard/company-management">
          <div className="p-4 border rounded-lg bg-gray-100 text-center hover:bg-gray-200 cursor-pointer">
            企業管理
          </div>
        </Link>
      </div>
    </div>
  );
}