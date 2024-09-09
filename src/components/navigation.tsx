import { Link } from "react-router-dom";
import { useResetRecoilState } from "recoil";
import { userState } from "../atoms";
import styled from "styled-components";

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

export default function NavigationBar() {
  const logout = useResetRecoilState(userState);
  return (
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
  );
}
