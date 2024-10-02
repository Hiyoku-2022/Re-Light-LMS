import { Card } from "@/components/ui/card";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <div className="flex items-center space-x-2">
          <LogInIcon className="w-6 h-6" />
          <span className="text-xl font-bold">Re-Light LMS</span>
        </div>
        <MenuIcon className="w-6 h-6" />
      </header>
      <main className="p-4 space-y-6">
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">UserName</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-2 p-4 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">1月</span>
                <span className="text-sm">2月</span>
                <span className="text-sm">3月</span>
                <span className="text-sm">4月</span>
                <span className="text-sm">5月</span>
                <span className="text-sm">6月</span>
                <span className="text-sm">7月</span>
                <span className="text-sm">8月</span>
                <span className="text-sm">9月</span>
              </div>
              <div className="h-24 bg-gray-200 rounded-md">
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500 text-sm">GitHub Contribution Graph</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-center">← 2023 年</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-bold">進捗状況</h2>
              <div className="flex items-center justify-between mt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-2xl font-bold">12</div>
                  </div>
                  <div className="text-sm">チャートリール</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">9</div>
                  <div className="text-sm">問題</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">14:33</div>
                  <div className="text-sm">最終閲覧時間</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// 各 SVG アイコンコンポーネントに型を定義
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LogInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
export default Dashboard;