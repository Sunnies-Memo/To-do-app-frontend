import { DragDropContext, DragStart, DropResult } from "react-beautiful-dnd";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { boardState, cardDrop, lastBoardIndex, toDoState } from "../atoms";
import { Suspense, useEffect, useState } from "react";
import BoardForm from "../components/CreateBoard";
import Board from "../components/Board";
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
  const isLogin = useAuth();
  const [toDos, setToDos] = useRecoilState<IToDoState>(toDoState);
  const [boards, setBoards] = useRecoilState<IBoardUpdate[]>(boardState);

  const setLastBIndex = useSetRecoilState(lastBoardIndex);

  const setCardDrop = useSetRecoilState(cardDrop);
  const [boardDrop, setBoardDrop] = useState(false);
  const [showTrashCan, setShowTrashCan] = useState(false);
  /*
  useEffect(() => {
    const storedToDo = localStorage.getItem("TODO");
    storedToDo && setToDos(JSON.parse(storedToDo));
    const storedBoards = localStorage.getItem("BOARDS");
    storedBoards && setBoards(JSON.parse(storedBoards));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  */

  useEffect(() => {
    const token = isLogin();
    const fetchData = async () => {
      if (token !== null) {
        try {
          const toDosData: IBoard[] = await getBoards(token);

          let boardlist: IBoardUpdate[] = [];
          toDosData.forEach((board) => {
            board.boardId &&
              boardlist.push({
                title: board.title,
                boardId: board.boardId,
                orderIndex: board.orderIndex,
                memberId: board.memberId,
              });
          });
          console.log("boardlist", boardlist);
          setBoards(boardlist);

          const obj = toDosData.reduce<IToDoState>((acc, cur) => {
            acc[cur.title] = cur.toDoList ? cur.toDoList : [];
            return acc;
          }, {});

          setToDos(obj);
        } catch (error) {
          console.log("error", error);
          alert("데이터를 가져오지 못했습니다.");
        }
      }
    };
    console.log("fetching");
    fetchData();
  }, []);
  useEffect(() => {
    if (boards.length > 0) {
      setLastBIndex((prev) => {
        return boards[boards.length - 1].orderIndex;
      });
    }
  }, [boards]);

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
    console.log("info", info);
    console.log("board list", boards);

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
        //아무것도 없는 board로 이동
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
      } else {
        prevIndex = boards[destination.index - 1].orderIndex;
        nextIndex = boards[destination.index].orderIndex;
      }

      let currIndex: number;
      console.log("prev next", prevIndex, nextIndex);
      if (prevIndex != null && nextIndex != null) {
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex) {
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        currIndex = prevIndex + 10;
      } else {
        return;
      }
      let gap: number = nextIndex ? nextIndex - currIndex : 2;
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
        console.log("boardsCopy", boardsCopy);
        return boardsCopy;
      });

      await moveBoard(thisBoard, gap, token);
    } else if (destination.droppableId === source.droppableId) {
      //같은 board간 이동
      console.log("destination.droppableId", destination.droppableId);
      console.log("source.droppableId", source.droppableId);
      console.log("destination.index", destination.index);
      console.log("source.index", source.index);
      console.log(
        "destination title",
        boards[Number(destination.droppableId)].title
      );
      console.log(
        "destination todos",
        toDos[boards[Number(destination.droppableId)].title]
      );
      //db의 todo card orderIndex 수정
      let prevIndex: number | undefined;
      let nextIndex: number | undefined;
      if (
        toDos[boards[Number(source.droppableId)].title][
          destination.index - 1
        ] === undefined &&
        toDos[boards[Number(source.droppableId)].title][
          destination.index + 1
        ] === undefined
      ) {
        //아무것도 없는 board로 이동
        prevIndex = undefined;
        nextIndex = undefined;
      } else if (
        toDos[boards[Number(source.droppableId)].title][
          destination.index - 1
        ] === undefined
      ) {
        //맨 앞으로 이동
        prevIndex = undefined;
        nextIndex =
          toDos[boards[Number(source.droppableId)].title][destination.index]
            .orderIndex;
      } else if (
        toDos[boards[Number(source.droppableId)].title][
          destination.index + 1
        ] === undefined
      ) {
        //맨 뒤로 이동
        prevIndex =
          toDos[boards[Number(source.droppableId)].title][destination.index]
            .orderIndex;
        nextIndex = undefined;
      } else {
        prevIndex =
          toDos[boards[Number(source.droppableId)].title][destination.index - 1]
            .orderIndex;
        nextIndex =
          toDos[boards[Number(source.droppableId)].title][destination.index]
            .orderIndex;
      }

      let currIndex: number;
      if (prevIndex != null && nextIndex != null) {
        console.log("a");
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex == null) {
        console.log("b");
        currIndex = 10;
      } else if (prevIndex == null && nextIndex) {
        console.log("c");
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        console.log("d");
        currIndex = prevIndex + 10;
      } else {
        console.log("e");
        return;
      }

      let gap: number = nextIndex ? nextIndex - currIndex : 2;

      let thisTodo = {
        ...toDos[boards[Number(source.droppableId) - 1].title][source.index],
        orderIndex: currIndex,
      };

      setToDos((prev) => {
        const boardCopy = [...prev[source.droppableId]];
        const taskObj = { ...boardCopy[source.index], orderIndex: currIndex };
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, taskObj);
        const newToDoObj = {
          ...prev,
          [source.droppableId]: boardCopy,
        };
        return newToDoObj;
      });

      await moveToDo(thisTodo, gap, token);
    }

    if (destination.droppableId === "trashBin") {
      console.log("trasshbin");
      if (source.droppableId === "boards") {
        //board 삭제
        setBoards((prev) => {
          const boardsCopy = [...prev];
          boardsCopy.splice(source.index, 1);
          return boardsCopy;
        });
        setToDos((prev) => {
          const newObj = { ...prev };
          delete newObj[boards[source.index].title];
          return newObj;
        });
        await deleteBoard(boards[source.index].boardId, token);
      } else {
        //todo card 삭제
        setToDos((prev) => {
          const boardCopy = [...prev[source.droppableId]];
          boardCopy.splice(source.index, 1);
          const newToDoObj = {
            ...prev,
            [source.droppableId]: boardCopy,
          };
          return newToDoObj;
        });
        await deleteToDo(toDos[source.droppableId][source.index].todoId, token);
      }
    } else if (destination.droppableId !== source.droppableId) {
      //card Cross board movement
      //db의 todo card orderIndex 수정
      console.log("destination.droppableId", destination.droppableId);
      console.log("source.droppableId", source.droppableId);
      console.log("destination.index", destination.index);
      console.log("source.index", source.index);
      console.log(
        "destination title",
        boards[Number(destination.droppableId)].title
      );
      console.log(
        "destination todos",
        toDos[boards[Number(destination.droppableId)].title]
      );

      let prevIndex: number | undefined;
      let nextIndex: number | undefined;
      if (
        toDos[boards[Number(destination.droppableId)].title][
          destination.index - 1
        ] === undefined &&
        toDos[boards[Number(destination.droppableId)].title][
          destination.index
        ] === undefined
      ) {
        //아무것도 없는 board로 이동
        console.log("아무것도 없는 board로 이동");
        prevIndex = undefined;
        nextIndex = undefined;
      } else if (
        toDos[boards[Number(destination.droppableId)].title][
          destination.index - 1
        ] === undefined
      ) {
        //맨 앞으로 이동
        console.log("맨 앞으로 이동");
        prevIndex = undefined;
        nextIndex =
          toDos[boards[Number(destination.droppableId)].title][
            destination.index
          ].orderIndex;
      } else if (
        toDos[boards[Number(destination.droppableId)].title][
          destination.index
        ] === undefined
      ) {
        //맨 뒤로 이동
        console.log("맨 뒤로 이동");
        prevIndex =
          toDos[boards[Number(destination.droppableId)].title][
            destination.index - 1
          ].orderIndex;
        nextIndex = undefined;
      } else {
        console.log("이동");
        prevIndex =
          toDos[boards[Number(destination.droppableId)].title][
            destination.index - 1
          ].orderIndex;
        nextIndex =
          toDos[boards[Number(destination.droppableId)].title][
            destination.index
          ].orderIndex;
      }
      console.log("==", prevIndex, nextIndex);

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
        console.log("return?");
        return;
      }
      console.log("curr idx", currIndex);
      let gap: number = nextIndex ? nextIndex - currIndex : 2;
      let thisTodo = {
        ...toDos[boards[Number(source.droppableId)].title][source.index],
        orderIndex: currIndex,
        board: boards[Number(destination.droppableId)],
      };
      console.log("this todo", thisTodo);

      setToDos((prev) => {
        console.log("prev", prev);
        console.log(
          "prev source",
          prev[boards[Number(source.droppableId)].title]
        );
        console.log(
          "prev target",
          prev[boards[Number(destination.droppableId)].title]
        );
        const sourceBoard = [...prev[boards[Number(source.droppableId)].title]];
        const targetBoard = [
          ...prev[boards[Number(destination.droppableId)].title],
        ];
        const taskObj = {
          ...sourceBoard[source.index],
          orderIndex: currIndex,
          board: boards[Number(destination.droppableId)],
        };
        console.log("taskObj", taskObj);
        sourceBoard.splice(source.index, 1);
        targetBoard.splice(destination.index, 0, taskObj);
        console.log("sourceBoard", sourceBoard);
        console.log("targetBoard", targetBoard);
        const newToDoObj = {
          ...prev,
          [boards[Number(source.droppableId)].title]: sourceBoard,
          [boards[Number(destination.droppableId)].title]: targetBoard,
        };
        console.log("newToDoObj", newToDoObj);
        return newToDoObj;
      });

      await moveToDo(thisTodo, gap, token);
    }

    setShowTrashCan(false);
  };

  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Wrapper className="wrapper">
          <Suspense fallback={<div>Loading...</div>}>
            <BoardForm />
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
                {boards.map((board, index) => (
                  <Board
                    index={index}
                    board={board}
                    key={board.title}
                    toDos={toDos[board.title]}
                  />
                ))}
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
