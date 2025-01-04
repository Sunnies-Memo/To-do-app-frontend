import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { orderedBoardList, userNameSelector } from "../atoms";
import { Suspense, useEffect, useState } from "react";
import BoardForm from "../components/board-form";
import TrashCan from "../components/TrashBin";
import { useAuth } from "../util";
import { IBoard, IBoardOrder } from "../interface/todo-interface";
import { getBoards } from "../api/todo-api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import { useDragAndDrop } from "../hooks/use-dnd";

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  min-height: 100vh;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  background: ${(props) => props.theme.background};
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.5) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
  overflow-x: hidden;

  &::before,
  &::after {
    content: "✦";
    position: fixed;
    font-size: 24px;
    color: ${(props) => props.theme.primaryAccent};
    animation: float 3s ease-in-out infinite;
  }

  &::before {
    top: 20px;
    left: 40px;
  }

  &::after {
    bottom: 40px;
    right: 20px;
    animation-delay: 1.5s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Boards = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
  padding: 20px;
  overflow-x: auto;
  margin-top: 60px;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.primaryAccent};
    border-radius: 4px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  font-size: 1.5rem;
  color: ${(props) => props.theme.textPrimary};
  background: ${(props) => props.theme.background};
`;

export default function TodosPage() {
  const navigate = useNavigate();
  const { isLogin, refresh } = useAuth();
  const token = isLogin();
  const boards = useRecoilValue<IBoardOrder[]>(orderedBoardList);
  const username = useRecoilValue(userNameSelector);

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
        console.log("fetched data", fetchedData);
      } catch (error) {
        alert("데이터를 가져오지 못했습니다.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedData, isLogin]);

  const { sensors, handleDragStart, handleDragOver, handleDragEnd } =
    useDragAndDrop();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Wrapper className="wrapper">
        <Suspense fallback={<LoadingWrapper>Loading...</LoadingWrapper>}>
          <BoardForm token={token} />
        </Suspense>
        <SortableContext
          items={boards.map((board) => board.boardId)}
          strategy={horizontalListSortingStrategy}
        >
          <Boards className="boards">
            {boards.map((board, index) => (
              <Board
                boardId={board.boardId}
                title={board.title}
                index={index}
                key={board.boardId}
                token={token}
              />
            ))}
          </Boards>
        </SortableContext>
        <TrashCan show={showTrashCan} />
      </Wrapper>
    </DndContext>
  );
}
