import React from "react";
import { Card } from "@/components/UI/Card";
import Image from "next/image";
import Link from "next/link";
import { FiLock } from "react-icons/fi";
import { Header } from "@/components/UI/Header";
import LearningProgressCalendar from "@/components/LearningProgressCalendar";

export interface DashboardProps {
  tutorialsCount: number;
  problemsCount: number;
  totalWatchTime: string;
  unlockedCourses: string[];
  courses?: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
  }>;
}

const Dashboard: React.FC<DashboardProps> = ({
  tutorialsCount,
  problemsCount,
  totalWatchTime,
  unlockedCourses,
  courses = [],
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header dashboardType="user" onToggleSidebar={() => {}} />
      <main className="container mx-auto p-4 pt-20">
        <section className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="md:flex-1 bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold mb-2">学習進捗カレンダー</h2>
            <LearningProgressCalendar />
          </div>
          <div className="lg:w-1/3 bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold mb-2">進捗状況</h2>
            <div className="flex justify-around items-center space-x-2">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-24 h-24">
                  <span className="text-3xl font-bold">{tutorialsCount}</span>
                </div>
                <div className="text-sm mt-2">チュートリアル</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-16 h-16">
                  <span className="text-xl font-bold">{problemsCount}</span>
                </div>
                <div className="text-sm mt-2">問題</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-28 h-28">
                  <span className="text-3xl font-bold">{totalWatchTime}</span>
                </div>
                <div className="text-sm mt-2">総学習時間</div>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-bold text-navy mb-4">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id}>
                {unlockedCourses.includes(course.id) ? (
                  <Link href={`/courses/${course.id}`}>
                    <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                      <Image src={course.image} alt={course.title} width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                      <div className="flex-grow">
                        <h3 className="text-lg text-light-blue mb-2">{course.title}</h3>
                        <p className="text-light-gray">{course.description}</p>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <Card className="p-4 h-full flex flex-col justify-between opacity-50 cursor-not-allowed relative">
                    <div className="absolute top-2 right-2">
                      <FiLock className="text-gray-600 text-2xl" />
                    </div>
                    <Image src={course.image} alt={course.title} width={150} height={150} className="h-36 w-64 object-cover mb-4" priority />
                    <div className="flex-grow">
                      <h3 className="text-lg text-light-blue mb-2">{course.title}</h3>
                      <p className="text-light-gray">{course.description}</p>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
