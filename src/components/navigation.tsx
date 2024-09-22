import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../util";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

const Selector = styled(motion.div)`
  width: 100%;
  height: 100%;
`;

const Ul = styled.ul`
  display: flex;
  align-items: center;
  li {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    padding: 5px 0px 5px 0px;
    margin: 1px 2px 1px 2px;
    border-radius: 5px;
    background-color: #8eaccd;
    color: beige;
  }
`;
const LogoutBtn = styled.button`
  margin: 0 4px 0 24px;
  padding: 0 10px 0 10px;
  height: 28px;
  border: none;
  border-radius: 5px;
  background-color: #f19ed2;
  color: beige;
  &:hover {
    background-color: #e8c5e5;
    cursor: pointer;
  }
`;

export interface ILocation {}
export default function NavigationBar() {
  const [selector, setSelector] = useState("/todo");

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isLogin } = useAuth();
  useEffect(() => {
    if (isLogin() == null) {
      navigate("/login");
    }
  }, [isLogin, navigate]);
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
                <Link to="/mypage">
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
