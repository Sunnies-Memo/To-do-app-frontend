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
  boardState,
  isAuthenticated,
  toDoState,
  userState,
  userToken,
} from "./atoms";
import { useNavigate } from "react-router-dom";
import { IBoard, IBoardUpdate, IToDoState } from "./interface/todo-interface";
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
    console.log("login response", loginResponse);
    if (loginResponse !== null) {
      console.log("accessToken", loginResponse.accessToken);
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
      logout(); // 실패 시 로그아웃
      return false;
    } catch (error) {
      logout(); // 실패 시 로그아웃
      return false;
    }
  };

  return { isLogin, login, logout, refresh };
};

export const useUpdateToDos = () => {
  return useRecoilCallback(({ snapshot, set }) => async (newData: IBoard[]) => {
    let prevBoards: IBoardUpdate[] = [
      ...(await snapshot.getPromise(boardState)),
    ];
    let prevTodoStates: IToDoState = {
      ...(await snapshot.getPromise(toDoState)),
    };

    prevBoards = prevBoards.filter(
      (item) => item.boardId !== "temporaryIdForBoard"
    );

    const newBoards: IBoardUpdate[] = newData;
    const newToDoStates: IToDoState = newData.reduce<IToDoState>((acc, cur) => {
      acc[cur.boardId] = cur.toDoList ? cur.toDoList : [];
      return acc;
    }, {});

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
    console.log("prevBoards", prevBoards);
    console.log("prevTodoStates", prevTodoStates);
    set(boardState, prevBoards);
    set(toDoState, prevTodoStates);
  });
};
