import { useState, useEffect, useCallback } from "react";
import { DroppableProps, Droppable } from "react-beautiful-dnd";
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { isAuthenticated, userState, userToken } from "./atoms";
import { useNavigate } from "react-router-dom";
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
