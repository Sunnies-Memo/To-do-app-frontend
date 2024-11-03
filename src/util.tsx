import { useState, useEffect, useCallback } from "react";
import { DroppableProps, Droppable } from "react-beautiful-dnd";
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import {
  boardAtomFamily,
  cardListSelector,
  IBoardOrder,
  isAuthenticated,
  orderedBoardList,
  userState,
  userToken,
} from "./atoms";
import { useNavigate } from "react-router-dom";
import { IBoard, ITodo } from "./interface/todo-interface";
import _ from "lodash";
import { doLogin, doLogout, doRefresh } from "./api/auth-api";
import { ILoginForm, ILoginResponse } from "./interface/auth-interface";
import { deleteBoard, deleteToDo, moveBoard, moveToDo } from "./api/todo-api";
import { useQueryClient } from "@tanstack/react-query";

export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

export const useAuth = () => {
  const isAuthed = useRecoilValue(isAuthenticated);
  const [token, setToken] = useRecoilState(userToken);
  const setUserState = useSetRecoilState(userState);
  const resetUserState = useResetRecoilState(userState);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    const response = await doLogout(token);
    if (response) {
      resetUserState();
      setToken("");
      navigate("/login");
    }
  }, [navigate, resetUserState, setToken, token]);

  const isLogin = useCallback(() => {
    return isAuthed ? token : null;
  }, [isAuthed, token]);

  const login = async (loginForm: ILoginForm) => {
    const loginResponse: ILoginResponse = await doLogin(loginForm);
    if (loginResponse !== null) {
      setUserState({
        username: loginResponse.member.username,
        profileImg: loginResponse.member.profileImg,
        bgImg: loginResponse.member.bgImg,
      });
      setToken((prev) =>
        prev === loginResponse.accessToken ? prev : loginResponse.accessToken
      );
    } else {
      throw new Error("Fail to Login");
    }
  };

  const refresh = async () => {
    try {
      const newAccessToken: string | null = await doRefresh();
      if (newAccessToken) {
        setToken((prevToken) =>
          prevToken === newAccessToken ? prevToken : newAccessToken
        ); // 조건부 업데이트
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return { isLogin, login, logout, refresh };
};

export const useToDos = () => {
  const queryClient = useQueryClient();

  const updateCards = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newBoards: IBoard[]) => {
        await Promise.all(
          newBoards.map(async (newBoard) => {
            const oldBoard = await snapshot.getPromise(
              boardAtomFamily(newBoard.boardId)
            );
            if (!_.isEqual(newBoard, oldBoard)) {
              set(boardAtomFamily(newBoard.boardId), newBoard);
            }
          })
        );
      }
  );
  const transportBoard = useRecoilCallback(
    ({ snapshot, set }) =>
      async (sourceIdx: number, destinationIdx: number, token: string) => {
        let prevIndex: number | null;
        let nextIndex: number | null;
        const orderedBoards = await snapshot.getPromise(orderedBoardList);

        //아무것도 없는 위치
        if (
          orderedBoards[destinationIdx - 1] == null &&
          orderedBoards[destinationIdx + 1] == null
        ) {
          prevIndex = 0;
          nextIndex = 0;
        }

        //맨 앞 이동
        else if (orderedBoards[destinationIdx - 1] == null) {
          prevIndex = null;
          nextIndex = orderedBoards[destinationIdx].orderIndex;
        }

        //맨 뒤로 이동
        else if (orderedBoards[destinationIdx + 1] == null) {
          prevIndex = orderedBoards[destinationIdx].orderIndex;
          nextIndex = null;
        }

        //맨 앞에서 뒤로 이동
        else if (orderedBoards[sourceIdx - 1] == null) {
          prevIndex = orderedBoards[destinationIdx].orderIndex;
          nextIndex = orderedBoards[destinationIdx + 1].orderIndex;
        }

        //그 외
        else {
          prevIndex = orderedBoards[destinationIdx - 1].orderIndex;
          nextIndex = orderedBoards[destinationIdx].orderIndex;
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
        let thisBoard: IBoardOrder = {
          ...orderedBoards[sourceIdx],
          orderIndex: currIndex,
        };

        set(orderedBoardList, (prev) => {
          const boardsCopy = [...prev];
          boardsCopy.splice(sourceIdx, 1);
          boardsCopy.splice(destinationIdx, 0, thisBoard);
          return boardsCopy;
        });

        await moveBoard(thisBoard, gap, token);
        if (gap <= 3) {
          queryClient.invalidateQueries({ queryKey: ["boards data", token] });
        }
      }
  );

  const transportCard = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        sourceId: string,
        sourceIdx: number,
        destinationId: string,
        destinationIdx: number,
        token: string
      ) => {
        //수정 전
        const sourceCards = await snapshot.getPromise(
          cardListSelector(sourceId)
        );
        const destinationCards = await snapshot.getPromise(
          cardListSelector(destinationId)
        );

        //카드 이동 로직
        if (sourceCards === undefined || destinationCards === undefined) return;
        let prevIndex: number | undefined;
        let nextIndex: number | undefined;

        //source와 destionation이 같은 경우
        if (sourceId === destinationId) {
          //아무것도 없는 board로 이동
          if (
            destinationCards[destinationIdx - 1] === undefined &&
            destinationCards[destinationIdx + 1] === undefined
          ) {
            prevIndex = undefined;
            nextIndex = undefined;
          }

          //맨 앞으로 이동
          else if (destinationCards[destinationIdx - 1] === undefined) {
            prevIndex = undefined;
            nextIndex = destinationCards[destinationIdx].orderIndex;
          }

          //맨 뒤로 이동
          else if (destinationCards[destinationIdx + 1] === undefined) {
            prevIndex = destinationCards[destinationIdx].orderIndex;
            nextIndex = undefined;
          }

          //그 외
          else if (destinationCards[sourceIdx - 1] === undefined) {
            prevIndex = destinationCards[destinationIdx].orderIndex;
            nextIndex = destinationCards[destinationIdx].orderIndex;
          } else {
            prevIndex = destinationCards[destinationIdx - 1].orderIndex;
            nextIndex = destinationCards[destinationIdx].orderIndex;
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
          let thisCard = {
            ...sourceCards[sourceIdx],
            orderIndex: currIndex,
          };
          set(boardAtomFamily(destinationId), (prev) => {
            const cardListCopy = prev.toDoList ? [...prev.toDoList] : [];
            const taskObj: ITodo = {
              ...cardListCopy[sourceIdx],
              orderIndex: currIndex,
            };
            cardListCopy.splice(sourceIdx, 1);
            cardListCopy.splice(destinationIdx, 0, taskObj);
            const newCardObj: IBoard = { ...prev, toDoList: cardListCopy };
            return newCardObj;
          });
          await moveToDo(thisCard, gap, token);
          if (gap <= 3) {
            queryClient.invalidateQueries({ queryKey: ["board data", token] });
          }
        }

        //source와 destionation이 다른 경우
        if (sourceId !== destinationId) {
          //아무것도 없는 board로 이동
          if (
            destinationCards[destinationIdx - 1] === undefined &&
            destinationCards[destinationIdx] === undefined
          ) {
            prevIndex = undefined;
            nextIndex = undefined;
          }

          //맨 앞으로 이동
          else if (destinationCards[destinationIdx - 1] === undefined) {
            prevIndex = undefined;
            nextIndex = destinationCards[destinationIdx].orderIndex;
          }

          //맨 뒤로 이동
          else if (destinationCards[destinationIdx] === undefined) {
            prevIndex = destinationCards[destinationIdx - 1].orderIndex;
            nextIndex = undefined;
          }

          //그 외
          else {
            prevIndex = destinationCards[destinationIdx - 1].orderIndex;
            nextIndex = destinationCards[destinationIdx].orderIndex;
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
          let thisCard = {
            ...sourceCards[sourceIdx],
            orderIndex: currIndex,
          };
          set(boardAtomFamily(sourceId), (prev) => {
            const cardListCopy = prev.toDoList ? [...prev.toDoList] : [];
            cardListCopy.splice(sourceIdx, 1);
            return { ...prev, toDoList: cardListCopy };
          });
          set(boardAtomFamily(destinationId), (prev) => {
            const cardListCopy = prev.toDoList ? [...prev.toDoList] : [];
            cardListCopy.splice(destinationIdx, 0, thisCard);
            return { ...prev, toDoList: cardListCopy };
          });

          await moveToDo(thisCard, gap, token);
          if (gap <= 3) {
            queryClient.invalidateQueries({ queryKey: ["boards data", token] });
          }
        }
      }
  );

  const removeBoard = useRecoilCallback(
    ({ snapshot, set }) =>
      async (boardId: string, token: string) => {
        const thisBoard = await snapshot.getPromise(boardAtomFamily(boardId));
        set(orderedBoardList, (prev) =>
          prev.filter((orderedBoard) => orderedBoard.boardId !== boardId)
        );
        await deleteBoard(thisBoard, token);
      }
  );
  const removeCard = useRecoilCallback(
    ({ snapshot, set }) =>
      async (boardId: string, cardIdx: number, token: string) => {
        const thisCards = await snapshot.getPromise(cardListSelector(boardId));
        if (thisCards === undefined) return;
        set(boardAtomFamily(boardId), (prev) => ({
          ...prev,
          toDoList: prev.toDoList ? [...prev.toDoList.splice(cardIdx, 1)] : [],
        }));
        await deleteToDo(thisCards[cardIdx], token);
      }
  );

  return {
    updateCards,
    transportBoard,
    transportCard,
    removeBoard,
    removeCard,
  };
};
