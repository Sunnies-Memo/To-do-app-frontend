import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import TodosPage from "./pages/Todos";
import MyPage from "./pages/MyPage";
import NavigationBar from "./components/navigation";
import { Suspense } from "react";
import JoinPage from "./pages/Join";

import { useRecoilValue } from "recoil";
import { userState } from "./atoms";
import { IUserState } from "./interface/auth-interface";
import Maintenance from "./pages/Maintenance";
import { GlobalStyle } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";

export default function Router() {
  const { bgImg } = useRecoilValue<IUserState>(userState);
  const isMaintenance = process.env.REACT_APP_ISMAINTENANCE === "true";
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Suspense>
          <NavigationBar />
        </Suspense>
        <Routes>
          {isMaintenance ? (
            <Route path="*" element={<Navigate to={"/maintenance"} />} />
          ) : (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/todos" element={<TodosPage />} />
              <Route path="/mypage" element={<MyPage />} />
            </>
          )}
          <Route path="/maintenance" element={<Maintenance />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
