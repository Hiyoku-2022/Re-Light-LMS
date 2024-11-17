import { useState } from "react";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Content } from "./ContentManagement";
import Modal from "@/components/UI/Modal";

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
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const handleContentDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedContents = Array.from(contents);
    const [removed] = reorderedContents.splice(result.source.index, 1);
    reorderedContents.splice(result.destination.index, 0, removed);

    onReorder(reorderedContents);
  };

  const handleElementDragEnd = (result: DropResult) => {
    if (!editingContent || !result.destination) return;

    const reorderedElements = Array.from(editingContent.elements || []);
    const [removed] = reorderedElements.splice(result.source.index, 1);
    reorderedElements.splice(result.destination.index, 0, removed);

    // ローカルの編集状態を更新
    setEditingContent({ ...editingContent, elements: reorderedElements });
    // 外部の状態更新関数を呼び出し
    onElementReorder(editingContent.id, reorderedElements);
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

  const closeEditModal = () => {
    setEditingContent(null);
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
                          <button onClick={() => setEditingContent(content)} className="bg-blue-500 text-white px-2 py-1 rounded">
                            プレビュー
                          </button>
                          <button onClick={() => handleDelete(content.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {editingContent && (
        <Modal onClose={closeEditModal}>
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">{editingContent.title} - エレメント編集</h2>
            <DragDropContext onDragEnd={handleElementDragEnd}>
              <Droppable droppableId="elements">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {(editingContent.elements ?? []).map((element, index) => (
                      <Draggable key={element.id} draggableId={element.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-2 bg-white border mb-2 rounded"
                          >
                            <p className="font-semibold">
                              {index + 1}. {element.elementType}
                            </p>
                            {element.elementType === "text" && <p>{element.content}</p>}
                            {element.elementType === "video" && (
                              <a href={element.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                動画を表示
                              </a>
                            )}
                            {element.elementType === "image" && element.url && (
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
                            {element.elementType === "code" && (
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
          </div>
        </Modal>
      )}
    </>
  );
}
