import { styled } from "styled-components";
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
  toDos: ITodo[];
  board: IBoard;
  token: string | null;
  isCardDrop: boolean;
}

function Board({ index, toDos, board, token, isCardDrop }: IBoardProps) {
  console.log("board : ", board.title);
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<ITodo>();

  const lastIndexRef = useRef(100);
  useEffect(() => {
    const lastIndex = toDos[toDos.length - 1]?.orderIndex;
    lastIndexRef.current = lastIndex ? lastIndex : 0;
  }, [toDos]);

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
          if (thisboard.boardId === board.boardId) {
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
      alert("Error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["boards data", token] });
    },
  });

  const onValid = async (todo: ITodo) => {
    if (!token) return;
    const newTodo: ITodo = {
      board: board,
      text: todo.text,
      orderIndex: lastIndexRef.current + 40,
    };
    createToDoMutation.mutate(newTodo);
    setValue("text", "");
  };
  return (
    <Draggable
      key={board.boardId}
      draggableId={board.boardId + ""}
      index={index}
    >
      {(magic) => (
        <Wrapper ref={magic.innerRef} {...magic.draggableProps}>
          <Title {...magic.dragHandleProps}>
            <span>{board.title}</span>
          </Title>
          <Form onSubmit={handleSubmit(onValid)}>
            <input
              {...register("text", { required: true })}
              type="text"
              placeholder={`Add task on ${board.title}`}
            />
          </Form>
          <Droppable
            droppableId={index + ""}
            isDropDisabled={isCardDrop}
            key={board.boardId}
          >
            {(magic, snapshot) => (
              <Area
                ref={magic.innerRef}
                {...magic.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
                isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
              >
                {toDos.map((todo, index) => {
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
