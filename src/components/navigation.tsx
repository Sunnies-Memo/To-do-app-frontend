import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../util";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRecoilValue } from "recoil";
import { isAuthenticated, userToken } from "../atoms";
import { useQueryClient } from "@tanstack/react-query";

const NavWrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  width: 100%;
  z-index: 10;
`;

const TabWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 4px 20px 4px 20px;
  margin: 3px 5px 3px 5px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.boardColor};
`;

const Ul = styled.ul`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.dropArea.default};
  border-radius: 5px;
  margin: 2px 0 2px 0;
  li {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 30px;
    padding: 5px 0px 5px 0px;

    color: beige;
  }
`;
const Selector = styled(motion.div)`
  position: absolute;
  width: 100px;
  height: 30px;
  background-color: rgba(189, 225, 255, 0.4);
  border-radius: 5px;
`;

const LogoutBtn = styled.button`
  margin: 0 4px 0 24px;
  padding: 0 10px 0 10px;
  height: 28px;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => props.theme.logoutBtn.default};
  color: beige;
  &:hover {
    background-color: ${(props) => props.theme.logoutBtn.hover};
    cursor: pointer;
  }
`;

export default function NavigationBar() {
  const [selector, setSelector] = useState("/todo");
  const location = useLocation();
  const { logout, refresh } = useAuth();
  const isAuthed = useRecoilValue(isAuthenticated);
  const navigate = useNavigate();
  const token = useRecoilValue(userToken);
  const queryClient = useQueryClient();
  const handleClick = () => {
    queryClient.invalidateQueries({ queryKey: ["boards data", token] });
  };
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthed) {
        const isRefreshed = await refresh();
        if (!isRefreshed && location.pathname !== "/join") {
          navigate("/login");
        }
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  useEffect(() => {
    setSelector(location.pathname);
  }, [location.pathname]);

  return (
    <>
      {location.pathname === "/login" ||
      location.pathname === "/join" ? null : (
        <NavWrapper>
          <AnimatePresence>
            <TabWrapper>
              <Ul>
                <Link to="/todos">
                  <li>
                    To Dos
                    {selector === "/todos" && (
                      <Selector layout layoutId="selector" />
                    )}
                  </li>
                </Link>
                <Link to="/mypage" onClick={handleClick}>
                  <li>
                    My Page
                    {selector === "/mypage" && (
                      <Selector layout layoutId="selector" />
                    )}
                  </li>
                </Link>
              </Ul>
              <LogoutBtn onClick={() => logout()}>Log Out</LogoutBtn>
            </TabWrapper>
          </AnimatePresence>
        </NavWrapper>
      )}
    </>
  );
}
