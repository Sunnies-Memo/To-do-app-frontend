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
  isAuthenticated,
  userState,
  userToken,
} from "./atoms";
import { useNavigate } from "react-router-dom";
import { IBoard } from "./interface/todo-interface";
import _ from "lodash";
import { doLogin, doLogout, doRefresh } from "./api/auth-api";
import { ILoginForm, ILoginResponse } from "./interface/auth-interface";

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

export const useUpdateToDos = () => {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async (newBoards: IBoard[]) => {
        newBoards.forEach(async (newBoard) => {
          const oldBoard = await snapshot.getPromise(
            boardAtomFamily(newBoard.boardId)
          );
          if (!_.isEqual(newBoard, oldBoard)) {
            set(boardAtomFamily(newBoard.boardId), newBoard);
          }
        });
      }
  );

  // return useRecoilCallback(({ snapshot, set }) => async (newData: IBoard[]) => {
  //   console.log("data", newData);

  //   let prevBoards: IBoardUpdate[] = [
  //     ...(await snapshot.getPromise(boardState)),
  //   ];
  //   let prevTodoStates: IToDoState = {
  //     ...(await snapshot.getPromise(toDoState)),
  //   };

  //   prevBoards = prevBoards.filter(
  //     (item) => item.boardId !== "temporaryIdForBoard"
  //   );

  //   Object.keys(prevTodoStates).forEach((boardId) => {
  //     prevTodoStates[boardId] = prevTodoStates[boardId].filter(
  //       (todo) => todo.todoId !== "temporaryIdForTodo"
  //     );
  //   });

  //   const newBoards: IBoardUpdate[] = newData;
  //   const newToDoStates: IToDoState = newData.reduce<IToDoState>((acc, cur) => {
  //     acc[cur.boardId] = cur.toDoList ? cur.toDoList : [];
  //     return acc;
  //   }, {});

  //   newBoards.forEach((thisBoard) => {
  //     const idx = prevBoards.findIndex(
  //       (item) => item.boardId === thisBoard.boardId
  //     );
  //     if (idx !== -1) {
  //       if (!_.isEqual(prevBoards[idx], thisBoard)) {
  //         prevBoards[idx] = thisBoard;
  //       }
  //     } else {
  //       prevBoards.push(thisBoard);
  //     }
  //   });

  //   Object.entries(newToDoStates).forEach(([thisBoardId, thisTodos]) => {
  //     const prevTodos = prevTodoStates[thisBoardId];

  //     if (!prevTodos) {
  //       prevTodoStates[thisBoardId] = [...thisTodos];
  //     } else {
  //       if (!_.isEqual(prevTodos, thisTodos)) {
  //         prevTodoStates[thisBoardId] = [...thisTodos];
  //       }
  //     }
  //   });
  //   set(boardState, prevBoards);
  //   set(toDoState, prevTodoStates);
  // });
};
