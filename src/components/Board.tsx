import { styled } from "styled-components";
import { cardDrop, cardListSelector, lastToDoIndexSelector } from "../atoms";
import { useRecoilValue } from "recoil";
import { useForm } from "react-hook-form";
import { Draggable, Droppable } from "react-beautiful-dnd";
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
  background-color: ${(props) =>
    props.isDraggingOver
      ? props.theme.dropArea.draggingOver
      : props.isDraggingFromThis
      ? props.theme.dropArea.fromThis
      : props.theme.dropArea.default};
  width: 95%;
  flex-grow: 1;
  transition: background-color 0.3s ease-in-out;
  padding: 7px 10px 5px 10px;
  border-radius: 5px;
`;
const Title = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
  width: 100%;
  span {
    font-size: 15px;
    font-weight: bold;
  }
`;
const Wrapper = styled.div`
  width: 250px;
  background-color: ${(props) => props.theme.boardColor};
  padding: 10px 5px;
  border-radius: 5px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Form = styled.form`
  width: 93%;
  margin: 10px 0 10px 0;
  input {
    width: 100%;
    height: 25px;
    border: none;
    border-radius: 3px;
    padding: 0 5px 0 5px;
    box-shadow: rgba(99, 99, 99, 0.3) inset 1px 1px 2px 0px;
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
      console.log("on mutate todo", newTodo);
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
      console.log("cannot create card", _err);
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
  return (
    <Draggable key={boardId} draggableId={boardId + ""} index={index}>
      {(magic) => (
        <Wrapper ref={magic.innerRef} {...magic.draggableProps}>
          <Title {...magic.dragHandleProps}>
            <span>{title}</span>
          </Title>
          <Form onSubmit={handleSubmit(onValid)}>
            <input
              {...register("text", { required: true })}
              type="text"
              placeholder={`Add task on ${title}`}
            />
          </Form>
          <Droppable
            droppableId={index + ""}
            isDropDisabled={isCardDrop}
            key={boardId}
          >
            {(magic, snapshot) => (
              <Area
                ref={magic.innerRef}
                {...magic.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
                isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
              >
                {toDoList?.map((todo, index) => {
                  return (
                    <DraggableCard
                      key={todo.todoId}
                      index={index}
                      toDoId={todo.todoId}
                      toDoText={todo.text}
                    />
                  );
                })}
                {magic.placeholder}
              </Area>
            )}
          </Droppable>
        </Wrapper>
      )}
    </Draggable>
  );
}

export default React.memo(Board);
