import ContentManagement from "@/components/ContentManagement/ContentManagement";

export default function ContentManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center my-6">コンテンツ管理</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* ContentManagement コンポーネントの呼び出し */}
        <ContentManagement />
      </div>
    </div>
  );
}
