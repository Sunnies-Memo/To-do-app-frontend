import { useState, useEffect, useCallback } from "react";
import { DroppableProps, Droppable } from "react-beautiful-dnd";
import { useRecoilState, useRecoilValue } from "recoil";
import { isAuthenticated } from "./atoms";
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

//로그 아웃
export function useLogout() {
  const [isAuthed, setIsAuthed] = useRecoilState(isAuthenticated);
  const logout = () => {
    //토큰삭제로직

    if (isAuthed) setIsAuthed(false);
  };
  return logout;
}

//로그인이 안되어있는 경우 로그인페이지로 이동
export function useAuth() {
  const isAuthed = useRecoilValue(isAuthenticated);
  const navigate = useNavigate();
  const isLogin = useCallback(() => {
    if (isAuthed) {
      //토큰 가져오는 로직
      const token = "token";
      return token;
    } else {
      navigate("/login");
      return null;
    }
  }, [isAuthed, navigate]);
  return isLogin;
}
