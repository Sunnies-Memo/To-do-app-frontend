import { useState, useEffect, useCallback } from "react";
import { DroppableProps, Droppable } from "react-beautiful-dnd";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { isAuthenticated, userState, userToken } from "./atoms";
import { useNavigate } from "react-router-dom";

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
export function useAuth() {
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
}
