import { DragDropContext, DragStart, DropResult } from "react-beautiful-dnd";
import { useRecoilState, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { boardState, cardDrop, toDoState } from "../atoms";
import { useEffect, useState } from "react";
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
              });
          });
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

  console.log("todo", toDos);

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
    if (!token) return;

    if (!destination) {
      setShowTrashCan(false);
      return;
    }

    if (destination.droppableId === "boards") {
      //board 이동
      setBoards((boards) => {
        const boardsCopy = [...boards];
        const taskBoard = boardsCopy[source.index];
        boardsCopy.splice(source.index, 1);
        boardsCopy.splice(destination.index, 0, taskBoard);

        return boardsCopy;
      });
      //db의 board orderIndex 수정
      const prevIndex = boards[source.index - 1].orderIndex;
      const nextIndex = boards[source.index + 1].orderIndex;

      let currIndex;
      if (prevIndex != null && nextIndex != null) {
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex) {
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        currIndex = prevIndex + 10;
      } else {
        currIndex = -1;
      }
      let gap: number = nextIndex ? nextIndex - currIndex : 2;
      let thisBoard: IBoard = boards[source.index];
      thisBoard.orderIndex = currIndex;
      await moveBoard(thisBoard, gap, token);
    } else if (destination.droppableId === source.droppableId) {
      //같은 board간 이동
      setToDos((prev) => {
        const boardCopy = [...prev[source.droppableId]];
        const taskObj = boardCopy[source.index];
        boardCopy.splice(source.index, 1);
        boardCopy.splice(destination?.index, 0, taskObj);
        const newToDoObj = {
          ...prev,
          [source.droppableId]: boardCopy,
        };
        return newToDoObj;
      });
      //db의 todo card orderIndex 수정
      const prevIndex =
        toDos[destination.droppableId][destination.index - 1].orderIndex;
      const nextIndex =
        toDos[destination.droppableId][destination.index + 1].orderIndex;

      let currIndex;
      if (prevIndex != null && nextIndex != null) {
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex) {
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        currIndex = prevIndex + 10;
      } else {
        currIndex = -1;
      }

      let gap: number = nextIndex ? nextIndex - currIndex : 2;
      let thisTodo = toDos[source.droppableId][source.index];
      thisTodo.orderIndex = currIndex;
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
        await deleteToDo(toDos[source.droppableId][source.index].id, token);
      }
    } else if (destination.droppableId !== source.droppableId) {
      //card Cross board movement
      setToDos((prev) => {
        const sourceBoard = [...prev[source.droppableId]];
        const targetBoard = [...prev[destination.droppableId]];
        const taskObj = sourceBoard[source.index];
        sourceBoard.splice(source.index, 1);
        targetBoard.splice(destination.index, 0, taskObj);
        const newToDoObj = {
          ...prev,
          [source.droppableId]: sourceBoard,
          [destination.droppableId]: targetBoard,
        };
        return newToDoObj;
      });
      //db의 todo card orderIndex 수정
      const prevIndex =
        toDos[destination.droppableId][destination.index - 1].orderIndex;
      const nextIndex =
        toDos[destination.droppableId][destination.index + 1].orderIndex;

      let currIndex;
      if (prevIndex != null && nextIndex != null) {
        currIndex = Math.floor((prevIndex + nextIndex) / 2);
      } else if (prevIndex == null && nextIndex) {
        currIndex = Math.floor(nextIndex / 2);
      } else if (nextIndex == null && prevIndex) {
        currIndex = prevIndex + 10;
      } else {
        currIndex = -1;
      }

      let gap: number = nextIndex ? nextIndex - currIndex : 2;
      let thisTodo = toDos[source.droppableId][source.index];
      thisTodo.orderIndex = currIndex;
      if (thisTodo.board != null) {
        thisTodo.board.boardId = Number(destination.droppableId);
      }
      await moveToDo(thisTodo, gap, token);
    }

    setShowTrashCan(false);
  };

  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Wrapper className="wrapper">
          <BoardForm />
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
                    boardId={board.boardId ? board.boardId : -1}
                    boardTitle={board.title}
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
