import { DragDropContext, DragStart, DropResult } from "react-beautiful-dnd";
import styled from "styled-components";
import { Suspense, useEffect, useState } from "react";
import BoardForm from "../components/board-form";
import _ from "lodash";
import TrashCan from "../components/TrashBin";
import { StrictModeDroppable, useAuth } from "../util";
import { IBoard, IBoardUpdate, IToDoState } from "../interface/todo-interface";
import {
  deleteBoard,
  deleteToDo,
  getBoards,
  moveBoard,
  moveToDo,
} from "../api/todo-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import { IUserProfile } from "../interface/profie-interface";
import { getProfile } from "../api/profile-api";

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
`;
const Boards = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 10px;
`;

export default function TodosPage() {
  console.log("todos page ");
  const navigate = useNavigate();
  const { isLogin } = useAuth();
  const token = isLogin();
  const [toDos, setToDos] = useState<IToDoState>({});
  const [boards, setBoards] = useState<IBoardUpdate[]>([]);

  const [lastBIndex, setLastBIndex] = useState(999);

  const [isCardDrop, setCardDrop] = useState(false);
  const [boardDrop, setBoardDrop] = useState(false);
  const [showTrashCan, setShowTrashCan] = useState(false);

  const queryClient = useQueryClient();
  const { data: fetchedData, isError } = useQuery<IBoard[]>({
    queryKey: ["boards data", token],
    queryFn: async () => getBoards(token),
    staleTime: 1000 * 60 * 15,
    refetchOnMount: false,
  });
  const { data: userData } = useQuery<IUserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => getProfile(token),
    refetchOnMount: false,
  });

  if (isError) {
    navigate("/login");
  }

  useEffect(() => {
    if (!isLogin()) {
      navigate("/login");
    }
    if (fetchedData != null) {
      try {
        // updateData(fetchedData);?
        let prevBoards: IBoardUpdate[] = [...boards];
        let prevTodoStates: IToDoState = { ...toDos };

        prevBoards = prevBoards.filter(
          (item) => item.boardId !== "temporaryIdForBoard"
        );

        Object.keys(prevTodoStates).forEach((boardId) => {
          prevTodoStates[boardId] = prevTodoStates[boardId].filter(
            (todo) => todo.todoId !== "temporaryIdForTodo"
          );
        });

        fetchedData.forEach((thisBoard) => {
          const idx = prevBoards.findIndex(
            (item) => item.boardId === thisBoard.boardId
          );
          if (idx !== -1) {
            if (!_.isEqual(prevBoards[idx], thisBoard)) {
              prevBoards[idx] = thisBoard;
            }
          } else {
            prevBoards.push(thisBoard);
          }
        });

        const newBoards: IBoardUpdate[] = fetchedData;
        const newToDoStates: IToDoState = fetchedData.reduce<IToDoState>(
          (acc, cur) => {
            acc[cur.boardId] = cur.toDoList ? cur.toDoList : [];
            return acc;
          },
          {}
        );

        newBoards.forEach((thisBoard) => {
          const idx = prevBoards.findIndex(
            (item) => item.boardId === thisBoard.boardId
          );
          if (idx !== -1) {
            if (!_.isEqual(prevBoards[idx], thisBoard)) {
              prevBoards[idx] = thisBoard;
            }
          } else {
            prevBoards.push(thisBoard);
          }
        });

        Object.entries(newToDoStates).forEach(([thisBoardId, thisTodos]) => {
          const prevTodos = prevTodoStates[thisBoardId];

          if (!prevTodos) {
            prevTodoStates[thisBoardId] = [...thisTodos];
          } else {
            if (!_.isEqual(prevTodos, thisTodos)) {
              prevTodoStates[thisBoardId] = [...thisTodos];
            }
          }
        });

        setBoards(prevBoards);
        setToDos(prevTodoStates);
      } catch (error) {
        alert("데이터를 가져오지 못했습니다.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedData, isLogin]);

  useEffect(() => {
    if (boards.length > 0) {
      setLastBIndex((prev) => {
        return boards[boards.length - 1].orderIndex;
      });
    }
  }, [boards, setLastBIndex]);

  const onDragStart = (info: DragStart) => {
    setShowTrashCan(true);
    if (info.source.droppableId !== "boards") {
      //Dragging Card
      setBoardDrop(true);
      setCardDrop(false);
    } else {
      //Dragging board
      setBoardDrop(false);
      setCardDrop(true);
    }
  };
  const onDragEnd = async (info: DropResult) => {
    const { destination, source } = info;
    const token = isLogin();

    if (
      !token ||
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      setShowTrashCan(false);
      return;
    }

    if (destination.droppableId === "boards") {
      //board 이동
      //db의 board orderIndex 수정
      let prevIndex: number | null;
      let nextIndex: number | null;
      if (
        boards[destination.index - 1] == null &&
        boards[destination.index + 1] == null
      ) {
        //아무것도 없는 위치로 이동
        prevIndex = 0;
        nextIndex = 0;
      } else if (boards[destination.index - 1] == null) {
        //맨 앞으로 이동
        prevIndex = null;
        nextIndex = boards[destination.index].orderIndex;
      } else if (boards[destination.index + 1] == null) {
        //맨 뒤로 이동
        prevIndex = boards[destination.index].orderIndex;
        nextIndex = null;
      } else if (boards[source.index - 1] == null) {
        //맨 앞에서 뒤로 이동
        prevIndex = boards[destination.index].orderIndex;
        nextIndex = boards[destination.index + 1].orderIndex;
      } else {
        prevIndex = boards[destination.index - 1].orderIndex;
        nextIndex = boards[destination.index].orderIndex;
      }

      let currIndex: number;
      if (prevIndex != null && nextIndex != null) {
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex) {
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        currIndex = prevIndex + 10;
      } else {
        return;
      }
      let gap: number = nextIndex ? nextIndex - currIndex : 999;
      let thisBoard: IBoard = {
        ...boards[source.index],
        orderIndex: currIndex,
      };

      setBoards((boards) => {
        const boardsCopy = [...boards];
        const taskBoard = {
          ...boardsCopy[source.index],
          orderIndex: currIndex,
        };
        boardsCopy.splice(source.index, 1);
        boardsCopy.splice(destination.index, 0, taskBoard);
        return boardsCopy;
      });

      await moveBoard(thisBoard, gap, token);
      if (gap <= 3) {
        queryClient.invalidateQueries({ queryKey: ["boards data", token] });
      }
    } else if (destination.droppableId === source.droppableId) {
      //같은 board간 이동
      //db의 todo card orderIndex 수정
      let prevIndex: number | undefined;
      let nextIndex: number | undefined;

      if (
        toDos[boards[Number(source.droppableId)].boardId][
          destination.index - 1
        ] === undefined &&
        toDos[boards[Number(source.droppableId)].boardId][
          destination.index + 1
        ] === undefined
      ) {
        //아무것도 없는 board로 이동
        prevIndex = undefined;
        nextIndex = undefined;
      } else if (
        toDos[boards[Number(source.droppableId)].boardId][
          destination.index - 1
        ] === undefined
      ) {
        //맨 앞으로 이동
        prevIndex = undefined;
        nextIndex =
          toDos[boards[Number(source.droppableId)].boardId][destination.index]
            .orderIndex;
      } else if (
        toDos[boards[Number(source.droppableId)].boardId][
          destination.index + 1
        ] === undefined
      ) {
        //맨 뒤로 이동
        prevIndex =
          toDos[boards[Number(source.droppableId)].boardId][destination.index]
            .orderIndex;
        nextIndex = undefined;
      } else if (
        toDos[boards[Number(source.droppableId)].boardId][source.index - 1] ===
        undefined
      ) {
        prevIndex =
          toDos[boards[Number(source.droppableId)].boardId][destination.index]
            .orderIndex;
        nextIndex =
          toDos[boards[Number(source.droppableId)].boardId][
            destination.index + 1
          ].orderIndex;
      } else {
        prevIndex =
          toDos[boards[Number(source.droppableId)].boardId][
            destination.index - 1
          ].orderIndex;
        nextIndex =
          toDos[boards[Number(source.droppableId)].boardId][destination.index]
            .orderIndex;
      }

      let currIndex: number;
      if (prevIndex != null && nextIndex != null) {
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex == null) {
        currIndex = 10;
      } else if (prevIndex == null && nextIndex) {
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        currIndex = prevIndex + 10;
      } else {
        return;
      }

      let gap: number = nextIndex ? nextIndex - currIndex : 999;
      let thisTodo = {
        ...toDos[boards[Number(source.droppableId)].boardId][source.index],
        orderIndex: currIndex,
      };
      setToDos((prev) => {
        const boardCopy = [...prev[boards[Number(source.droppableId)].boardId]];
        const taskObj = { ...boardCopy[source.index], orderIndex: currIndex };
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, taskObj);
        const newToDoObj = {
          ...prev,
          [boards[Number(source.droppableId)].boardId]: boardCopy,
        };
        return newToDoObj;
      });

      await moveToDo(thisTodo, gap, token);
      if (gap <= 3) {
        queryClient.invalidateQueries({ queryKey: ["boards data", token] });
      }
    }

    if (destination.droppableId === "trashBin") {
      if (source.droppableId === "boards") {
        //board 삭제
        setBoards((prev) => {
          const boardsCopy = [...prev];
          boardsCopy.splice(source.index, 1);
          return boardsCopy;
        });
        setToDos((prev) => {
          const newObj = { ...prev };
          delete newObj[boards[source.index].boardId];
          return newObj;
        });
        await deleteBoard(boards[source.index], token);
        queryClient.invalidateQueries({ queryKey: ["boards data", token] });
      } else {
        //todo card 삭제
        setToDos((prev) => {
          const boardCopy = [
            ...prev[boards[Number(source.droppableId)].boardId],
          ];
          boardCopy.splice(source.index, 1);
          const newToDoObj = {
            ...prev,
            [boards[Number(source.droppableId)].boardId]: boardCopy,
          };
          return newToDoObj;
        });
        await deleteToDo(
          toDos[boards[Number(source.droppableId)].boardId][source.index],
          token
        );
      }
    } else if (destination.droppableId !== source.droppableId) {
      //card Cross board movement
      //db의 todo card orderIndex 수정
      let prevIndex: number | undefined;
      let nextIndex: number | undefined;
      if (
        toDos[boards[Number(destination.droppableId)].boardId][
          destination.index - 1
        ] === undefined &&
        toDos[boards[Number(destination.droppableId)].boardId][
          destination.index
        ] === undefined
      ) {
        //아무것도 없는 board로 이동
        prevIndex = undefined;
        nextIndex = undefined;
      } else if (
        toDos[boards[Number(destination.droppableId)].boardId][
          destination.index - 1
        ] === undefined
      ) {
        //맨 앞으로 이동
        prevIndex = undefined;
        nextIndex =
          toDos[boards[Number(destination.droppableId)].boardId][
            destination.index
          ].orderIndex;
      } else if (
        toDos[boards[Number(destination.droppableId)].boardId][
          destination.index
        ] === undefined
      ) {
        //맨 뒤로 이동
        prevIndex =
          toDos[boards[Number(destination.droppableId)].boardId][
            destination.index - 1
          ].orderIndex;
        nextIndex = undefined;
      } else {
        prevIndex =
          toDos[boards[Number(destination.droppableId)].boardId][
            destination.index - 1
          ].orderIndex;
        nextIndex =
          toDos[boards[Number(destination.droppableId)].boardId][
            destination.index
          ].orderIndex;
      }

      let currIndex: number;
      if (prevIndex != null && nextIndex != null) {
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex == null) {
        currIndex = 10;
      } else if (prevIndex == null && nextIndex) {
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        currIndex = prevIndex + 10;
      } else {
        return;
      }

      let gap: number = nextIndex ? nextIndex - currIndex : 999;
      let thisTodo = {
        ...toDos[boards[Number(source.droppableId)].boardId][source.index],
        orderIndex: currIndex,
        board: boards[Number(destination.droppableId)],
      };

      setToDos((prev) => {
        const sourceBoard = [
          ...prev[boards[Number(source.droppableId)].boardId],
        ];
        const targetBoard = [
          ...prev[boards[Number(destination.droppableId)].boardId],
        ];
        const taskObj = {
          ...sourceBoard[source.index],
          orderIndex: currIndex,
          board: boards[Number(destination.droppableId)],
        };
        sourceBoard.splice(source.index, 1);
        targetBoard.splice(destination.index, 0, taskObj);
        const newToDoObj = {
          ...prev,
          [boards[Number(source.droppableId)].boardId]: sourceBoard,
          [boards[Number(destination.droppableId)].boardId]: targetBoard,
        };
        return newToDoObj;
      });

      await moveToDo(thisTodo, gap, token);
      if (gap <= 3) {
        queryClient.invalidateQueries({ queryKey: ["boards data", token] });
      }
    }

    setShowTrashCan(false);
  };

  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Wrapper className="wrapper">
          <Suspense fallback={<div>Loading...</div>}>
            <BoardForm
              username={userData?.username}
              token={token}
              lastBIndex={lastBIndex}
            />
          </Suspense>
          <StrictModeDroppable
            droppableId="boards"
            direction="horizontal"
            isDropDisabled={boardDrop}
          >
            {(magic) => (
              <Boards
                className="boards"
                ref={magic.innerRef}
                {...magic.droppableProps}
              >
                {boards.map((board, index) => {
                  return (
                    <Board
                      index={index}
                      board={board}
                      key={board.boardId}
                      toDos={toDos[board.boardId]}
                      token={token}
                      isCardDrop={isCardDrop}
                    />
                  );
                })}
                {magic.placeholder}
              </Boards>
            )}
          </StrictModeDroppable>
          <TrashCan show={showTrashCan} />
        </Wrapper>
      </DragDropContext>
    </>
  );
}
