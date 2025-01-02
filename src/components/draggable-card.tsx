import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { styled } from "styled-components";

interface ICardProps {
  isDragging: boolean;
}

const Card = styled.div<ICardProps>`
  background: ${(props) =>
    props.isDragging
      ? props.theme.primaryAccent
      : `${props.theme.primaryAccent}40`}; // 40 adds 25% opacity
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: ${(props) =>
    props.isDragging
      ? "0px 8px 16px rgba(45, 0, 102, 0.15)"
      : "0px 2px 4px rgba(45, 0, 102, 0.1)"};
  transition: all 0.3s ease;
  border: ${(props) => props.theme.borders.soft};
  font-size: 0.9rem;
  color: ${(props) =>
    props.isDragging ? props.theme.background : props.theme.textPrimary};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 4px 8px rgba(45, 0, 102, 0.1);
    background: ${(props) =>
      `${props.theme.primaryAccent}80`}; // 80 adds 50% opacity
  }

  &::before {
    content: "★";
    margin-right: 0.5rem;
    color: ${(props) =>
      props.isDragging ? props.theme.textPrimary : props.theme.primaryAccent};
    font-size: 0.8rem;
  }
`;

interface IDraggableCard {
  toDoId?: string;
  toDoText: string;
  index: number;
  boardId: string;
}

function DraggableCard({ toDoId, toDoText, index, boardId }: IDraggableCard) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: toDoId || "",
    data: {
      type: "card",
      toDoId,
      boardId,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      {toDoText}
    </Card>
  );
}

export default React.memo(DraggableCard);
