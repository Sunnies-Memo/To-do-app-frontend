import { useState, useEffect, useCallback } from "react";
import { DroppableProps, Droppable } from "react-beautiful-dnd";
import { useRecoilCallback, useRecoilValue, useResetRecoilState } from "recoil";
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

//로그인이 안되어있는 경우 로그인페이지로 이동
export const useAuth = () => {
  const isAuthed = useRecoilValue(isAuthenticated);
  const token = useRecoilValue(userToken);
  const logout = useResetRecoilState(userState);
  const navigate = useNavigate();

  const isLogin = useCallback(() => {
    if (isAuthed) {
      return token;
    } else {
      // logout();
      // navigate("/login");
      return null;
    }
  }, [isAuthed, navigate]);
  return isLogin;
};

export const useUpdateToDos = () => {
  return useRecoilCallback(({ snapshot, set }) => async (newData: IBoard[]) => {
    let prevBoards: IBoardUpdate[] = [
      ...(await snapshot.getPromise(boardState)),
    ];
    let prevTodoStates: IToDoState = {
      ...(await snapshot.getPromise(toDoState)),
    };

    console.log(
      "fetching======================================================"
    );
    console.log("newData", newData);
    console.log("before filter", prevBoards);
    prevBoards = prevBoards.filter(
      (item) => item.boardId !== "temporaryIdForBoard"
    );
    console.log("prevBoard", prevBoards);

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
    set(boardState, prevBoards);
    set(toDoState, prevTodoStates);
  });
};
