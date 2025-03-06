import Link from "next/link";
import { JSX } from "react";

type Props = {
  currentCourse: string | null;
};
export const BackToCourse = ({ currentCourse }: Props): JSX.Element => {
  return (
    <Link
      href={`/courses/${currentCourse}`}
      className="px-4 py-2 bg-white text-gray-800 rounded-md border-2 fixed left-12 bottom-4"
    >
      一覧へ戻る
    </Link>
  );
};
