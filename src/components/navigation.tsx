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
  padding-top: 1rem;
`;

const TabWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.5rem 1.5rem;
  margin: 0.5rem;
  border-radius: 12px;
  background: ${(props) => props.theme.gradients.primary};
  border: ${(props) => props.theme.borders.pixel};
  box-shadow: 4px 4px 0 rgba(45, 0, 102, 0.2);
`;

const Ul = styled.ul`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid ${(props) => props.theme.primaryAccent};
  position: relative;

  li {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 36px;
    padding: 0.5rem;
    color: ${(props) => props.theme.textPrimary};
    font-weight: bold;
    position: relative;
    z-index: 2;
  }
`;

const Selector = styled(motion.div)`
  position: absolute;
  width: 120px;
  height: 36px;
  background: ${(props) =>
    `${props.theme.primaryAccent}80`}; // 80 adds 50% opacity
  border-radius: 6px;
  z-index: 1;
`;

const LogoutBtn = styled.button`
  margin-left: 1.5rem;
  padding: 0.5rem 1rem;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: ${(props) => props.theme.secondaryAccent};
  color: ${(props) => props.theme.textPrimary};
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: ${(props) => props.theme.bigBtn.hover};
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
      if (!isAuthed && location.pathname !== "/maintenance") {
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
      location.pathname === "/maintenance" ||
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
