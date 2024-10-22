import React, { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return <table className="min-w-full">{children}</table>;
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-100">{children}</thead>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="border-b">{children}</tr>;
}

export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${className || ""}`}>
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className || ""}`}>
      {children}
    </td>
  );
}
