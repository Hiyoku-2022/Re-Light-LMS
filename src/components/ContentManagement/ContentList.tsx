import { useState } from "react";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Content } from "./ContentManagement";
import Modal from "@/components/ui/Modal";

interface ContentListProps {
  contents: Content[];
  onDeleteContent: (id: string) => void;
  onEditContent: (content: Content) => void;
  onReorder: (reorderedContents: Content[]) => void;
  onElementReorder: (contentId: string, reorderedElements: Content["elements"]) => void;
}

export default function ContentList({
  contents,
  onDeleteContent,
  onEditContent,
  onReorder,
  onElementReorder,
}: ContentListProps) {
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);

  const handleContentDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedContents = Array.from(contents);
    const [removed] = reorderedContents.splice(result.source.index, 1);
    reorderedContents.splice(result.destination.index, 0, removed);

    onReorder(reorderedContents);
  };

  const handleElementDragEnd = (contentId: string, result: DropResult) => {
    if (!result.destination) return;

    const content = contents.find((c) => c.id === contentId);
    if (!content) return;

    const reorderedElements = Array.from(content.elements || []);
    const [removed] = reorderedElements.splice(result.source.index, 1);
    reorderedElements.splice(result.destination.index, 0, removed);

    onElementReorder(contentId, reorderedElements);
  };

  const toggleContentExpand = (id: string) => {
    setExpandedContent(expandedContent === id ? null : id);
  };

  const handleDelete = (id: string) => {
    const isConfirmed = window.confirm("このコンテンツを本当に削除してもよろしいですか？");
    if (isConfirmed) {
      onDeleteContent(id);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleContentDragEnd}>
        <Droppable droppableId="contents">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {contents.map((content, index) => (
                <Draggable key={content.id} draggableId={content.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-4 border rounded-lg mb-2 bg-gray-50 shadow"
                    >
                      <div className="flex justify-between items-center">
                        <div onClick={() => toggleContentExpand(content.id)} className="cursor-pointer">
                          <h3 className="font-semibold">{content.title}</h3>
                          <p>{content.description}</p>
                        </div>
                        <div className="space-x-2">
                          <button onClick={() => onEditContent(content)} className="bg-blue-500 text-white px-2 py-1 rounded">
                            編集
                          </button>
                          {/* プレビューボタン */}
                          <button
                            onClick={() => setPreviewContent(content)}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            プレビュー
                          </button>
                          <button onClick={() => handleDelete(content.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                            削除
                          </button>
                        </div>
                      </div>

                      {expandedContent === content.id && content.elements && (
                        <DragDropContext onDragEnd={(result) => handleElementDragEnd(content.id, result)}>
                          <Droppable droppableId={`elements-${content.id}`}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.droppableProps} className="mt-2 border-t pt-2">
                                {content.elements.map((element, elIndex) => (
                                  <Draggable key={element.id} draggableId={element.id} index={elIndex}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="p-2 bg-white border mb-2 rounded"
                                      >
                                        <p className="font-semibold">
                                          {elIndex + 1}. {element.type}
                                        </p>
                                        {element.type === "text" && <p>{element.content}</p>}
                                        {element.type === "video" && (
                                          <a
                                            href={element.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline"
                                          >
                                            動画を表示
                                          </a>
                                        )}
                                        {element.type === "image" && element.url && (
                                          <>
                                            <Image 
                                              src={element.url} 
                                              alt={element.caption || "画像"} 
                                              className="w-full" 
                                              width={element.width || 500}
                                              height={element.height || 300}
                                              objectFit="cover"
                                            />
                                            {element.caption && <p className="text-sm">{element.caption}</p>}
                                          </>
                                        )}
                                        {element.type === "code" && (
                                          <pre className="bg-gray-100 p-2 rounded">
                                            <code>{element.content}</code>
                                          </pre>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* プレビューモーダル */}
      {previewContent && (
        <Modal onClose={() => setPreviewContent(null)}>
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">{previewContent.title}</h2>
            <p>{previewContent.description}</p>
            {previewContent.elements.map((element, index) => (
              <div key={index} className="mt-4">
                {element.type === "text" && <div dangerouslySetInnerHTML={{ __html: element.content || "" }} />}
                {element.type === "video" && (
                  <video controls className="w-full">
                    <source src={element.url} type="video/mp4" />
                    お使いのブラウザは動画再生に対応していません。
                  </video>
                )}
                {element.type === "image" && element.url && (
                  <Image
                    src={element.url}
                    alt={element.caption || "画像"}
                    className="w-full"
                    width={element.width || 500}
                    height={element.height || 300}
                    objectFit="cover"
                  />
                )}
                {element.type === "code" && (
                  <pre className="bg-gray-100 p-2 rounded">
                    <code>{element.content}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
