import { DragDropContext, DragStart, DropResult } from "react-beautiful-dnd";
import { useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import {
  cardDrop,
  lastBoardIndex,
  orderedBoardList,
  userNameSelector,
} from "../atoms";
import { Suspense, useEffect, useState } from "react";
import BoardForm from "../components/board-form";

import TrashCan from "../components/TrashBin";
import { StrictModeDroppable, useAuth, useToDos } from "../util";
import { IBoard, IBoardOrder } from "../interface/todo-interface";
import { getBoards } from "../api/todo-api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";

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
  const navigate = useNavigate();
  const { isLogin, refresh } = useAuth();
  const token = isLogin();
  const {
    updateCards,
    transportBoard,
    transportCard,
    removeBoard,
    removeCard,
  } = useToDos();
  const boards = useRecoilValue<IBoardOrder[]>(orderedBoardList);
  const username = useRecoilValue(userNameSelector);
  const setLastBIndex = useSetRecoilState(lastBoardIndex);

  const setCardDrop = useSetRecoilState(cardDrop);
  const [boardDrop, setBoardDrop] = useState(false);
  const [showTrashCan, setShowTrashCan] = useState(false);

  const { data: fetchedData, isError } = useQuery<IBoard[]>({
    queryKey: ["boards data", token],
    queryFn: async () => getBoards(token),
    staleTime: 1000 * 60 * 15,
    refetchOnMount: false,
    enabled: token !== null,
  });

  useEffect(() => {
    if (isError) {
      navigate("/login");
    }
  }, [isError, navigate]);

  useEffect(() => {
    if (!isLogin()) {
      navigate("/login");
    }
    if (username.length === 0) {
      refresh();
    }
    if (fetchedData != null) {
      try {
        updateCards(fetchedData);
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

    //삭제
    else if (destination.droppableId === "trashBin") {
      if (source.droppableId === "boards") {
        //board 삭제
        removeBoard(boards[Number(source.index)].boardId, token);
      } else {
        //todo card 삭제
        console.log(boards[Number(source.droppableId)]);
        removeCard(
          boards[Number(source.droppableId)].boardId,
          source.index,
          token
        );
      }
    }

    //board 이동
    else if (destination.droppableId === "boards") {
      transportBoard(source.index, destination.index, username, token);
    }

    //card 이동
    else {
      transportCard(
        boards[Number(source.droppableId)]?.boardId,
        source.index,
        boards[Number(destination.droppableId)]?.boardId,
        destination.index,
        token
      );
    }

    setShowTrashCan(false);
  };

  return (
    <>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Wrapper className="wrapper">
          <Suspense fallback={<div>Loading...</div>}>
            <BoardForm token={token} />
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
                      boardId={board.boardId}
                      title={board.title}
                      index={index}
                      key={board.boardId}
                      token={token}
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
