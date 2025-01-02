import { styled } from "styled-components";
import { cardDrop, cardListSelector, lastToDoIndexSelector } from "../atoms";
import { useRecoilValue } from "recoil";
import { useForm } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useEffect, useRef } from "react";
import { IBoard, ITodo } from "../interface/todo-interface";
import { createToDo } from "../api/todo-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DraggableCard from "./draggable-card";

interface IAreaProps {
  isDraggingOver: boolean;
  isDraggingFromThis: boolean;
}

const Area = styled.div<IAreaProps>`
  background: ${(props) =>
    props.isDraggingOver
      ? `${props.theme.primaryAccent}40` // 40 adds 25% opacity
      : props.isDraggingFromThis
      ? `${props.theme.secondaryAccent}40` // 40 adds 25% opacity
      : "white"};
  width: 100%;
  flex-grow: 1;
  transition: all 0.3s ease-in-out;
  padding: 1rem;
  border-radius: 8px;
  min-height: 100px;
  border: ${(props) => props.theme.borders.soft};
`;

const Title = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;

  span {
    font-size: 1.25rem;
    font-weight: bold;
    color: ${(props) => props.theme.textPrimary};

    &::before,
    &::after {
      content: "✦";
      margin: 0 0.5rem;
      color: ${(props) => props.theme.secondaryAccent};
      font-size: 0.8rem;
    }
  }
`;

const Wrapper = styled.div`
  width: 280px;
  background: ${(props) => props.theme.gradients.primary};
  padding: 1.5rem;
  border-radius: 12px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: ${(props) => props.theme.borders.pixel};
  box-shadow: 6px 6px 0 rgba(45, 0, 102, 0.2);
`;

const Form = styled.form`
  width: 100%;
  margin-bottom: 1rem;

  input {
    width: 100%;
    height: 36px;
    border: ${(props) => props.theme.borders.soft};
    border-radius: 8px;
    padding: 0 1rem;
    font-size: 0.9rem;
    background: white;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${(props) => props.theme.primaryAccent};
      box-shadow: 0 0 0 3px rgba(200, 162, 200, 0.2);
    }

    &::placeholder {
      color: ${(props) => props.theme.textSecondary};
    }
  }
`;

interface IBoardProps {
  index: number;
  boardId: string;
  title: string;
  token: string | null;
}

function Board({ index, boardId, title, token }: IBoardProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<ITodo>();
  const isCardDrop = useRecoilValue(cardDrop);
  const toDoList = useRecoilValue(cardListSelector(boardId));
  const lastIndex = useRecoilValue(lastToDoIndexSelector(boardId));

  const lastIndexRef = useRef(100);
  useEffect(() => {
    lastIndexRef.current = lastIndex ? lastIndex : 0;
  }, [lastIndex]);

  const createToDoMutation = useMutation({
    mutationFn: (newTodo: ITodo) => createToDo(newTodo, token),
    onMutate: async (newTodo: ITodo) => {
      await queryClient.cancelQueries({ queryKey: ["boards data", token] });
      const prevData = queryClient.getQueryData<IBoard[]>([
        "boards data",
        token,
      ]);
      const tempId = "temporaryIdForTodo";
      queryClient.setQueryData<IBoard[]>(["boards data", token], (prev) => {
        if (!prev) return prevData;
        return prevData?.map((thisboard) => {
          if (thisboard.boardId === boardId) {
            return {
              ...thisboard,
              toDoList: !thisboard.toDoList
                ? undefined
                : [...thisboard.toDoList, { ...newTodo, todoId: tempId }],
            };
          } else {
            return thisboard;
          }
        });
      });
      return { prevData };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["boards data", token], context?.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["boards data", token] });
    },
  });

  const onValid = async (todo: ITodo) => {
    if (!token) return;
    const newTodo: ITodo = {
      text: todo.text,
      board: { boardId },
      orderIndex: lastIndexRef.current + 40,
    };
    createToDoMutation.mutate(newTodo);
    setValue("text", "");
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: boardId,
    data: {
      type: "board",
      boardId,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Wrapper ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Title>{title}</Title>
      <Form onSubmit={handleSubmit(onValid)}>
        <input
          {...register("text", { required: true })}
          type="text"
          placeholder={`Add task on ${title}`}
        />
      </Form>
      <SortableContext
        items={toDoList?.map((todo) => todo.todoId) || []}
        strategy={verticalListSortingStrategy}
      >
        <Area>
          {toDoList?.map((todo, index) => (
            <DraggableCard
              key={todo.todoId}
              index={index}
              toDoId={todo.todoId}
              toDoText={todo.text}
              boardId={boardId}
            />
          ))}
        </Area>
      </SortableContext>
    </Wrapper>
  );
}

export default React.memo(Board);
