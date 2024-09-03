import { styled } from "styled-components";
import { cardDrop, ITodo, toDoState } from "../atoms";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import { Draggable, Droppable } from "react-beautiful-dnd";
import DragableCard from "./DragableCard";
import React from "react";

interface IAreaProps {
  isDraggingOver: boolean;
  isDraggingFromThis: boolean;
}

const Area = styled.div<IAreaProps>`
  background-color: ${(props) =>
    props.isDraggingOver
      ? "#62A6DE"
      : props.isDraggingFromThis
      ? "#878787"
      : "#A6A6A6"};
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
  boardId: string;
}
interface IForm {
  toDo: string;
}
function Board({ index, toDos, boardId }: IBoardProps) {
  const { register, handleSubmit, setValue } = useForm<IForm>();
  const isCardDrop = useRecoilValue(cardDrop);
  const setToDos = useSetRecoilState(toDoState);
  const onValid = ({ toDo }: IForm) => {
    const newToDo: ITodo = {
      id: Date.now(),
      text: toDo,
    };
    setToDos((prev) => {
      const newToDoObj = {
        ...prev,
        [boardId]: [newToDo, ...prev[boardId]],
      };
      localStorage.setItem("TODO", JSON.stringify(newToDoObj));
      return newToDoObj;
    });
    setValue("toDo", "");
  };
  return (
    <Draggable key={boardId} draggableId={boardId} index={index}>
      {(magic) => (
        <Wrapper ref={magic.innerRef} {...magic.draggableProps}>
          <Title {...magic.dragHandleProps}>
            <span>{boardId}</span>
          </Title>
          <Form onSubmit={handleSubmit(onValid)}>
            <input
              {...register("toDo", { required: true })}
              type="text"
              placeholder={`Add task on ${boardId}`}
            />
          </Form>
          <Droppable droppableId={boardId} isDropDisabled={isCardDrop}>
            {(magic, snapshot) => (
              <Area
                ref={magic.innerRef}
                {...magic.droppableProps}
                isDraggingOver={snapshot.isDraggingOver}
                isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
              >
                {toDos.map((todo, index) => (
                  <DragableCard
                    key={todo.id}
                    index={index}
                    toDoId={todo.id}
                    toDoText={todo.text}
                  />
                ))}
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
