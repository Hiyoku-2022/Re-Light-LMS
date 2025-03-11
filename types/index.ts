export type Content = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stepOrder: number;
  type: "content" | "task";
  elements?: ContentElement[];
};

export type ContentElement = {
  id: string;
  elementType: "text" | "video" | "image" | "code";
  content?: string;
  url?: string;
  caption?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
};
