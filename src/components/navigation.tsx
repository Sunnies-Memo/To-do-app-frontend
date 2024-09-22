import { Link, useLocation, useNavigate } from "react-router-dom";
import { useResetRecoilState } from "recoil";
import { userState } from "../atoms";
import styled from "styled-components";
import { useAuth } from "../util";
import { useEffect } from "react";

const NavWrapper = styled.div`
  position: fixed;
  display: flex;
  justify-content: flex-end;
  margin: 0 15px 0 15px;
  border: 1px solid black;
  /* height: 40px; */
  width: 100%;
  z-index: 10;
`;
const Ul = styled.ul`
  display: flex;
  a {
    margin: 0 5% 0 5%;
  }
`;

export interface ILocation {}
export default function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isLogin } = useAuth();
  useEffect(() => {
    if (isLogin() == null) {
      navigate("/login");
    }
  }, [isLogin, navigate]);

  return (
    <>
      {location.pathname === "/login" ||
      location.pathname === "/join" ? null : (
        <NavWrapper>
          <Ul>
            <Link to="/todos">
              <li>To Dos</li>
            </Link>
            <Link to="/mypage">
              <li>My Page</li>
            </Link>
          </Ul>
          <button onClick={() => logout()}>Log Out</button>
        </NavWrapper>
      )}
    </>
  );
}
