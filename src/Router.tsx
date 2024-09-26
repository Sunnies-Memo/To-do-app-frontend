import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import TodosPage from "./pages/Todos";
import MyPage from "./pages/MyPage";
import NavigationBar from "./components/navigation";
import { Suspense } from "react";
import JoinPage from "./pages/Join";
import { Reset } from "./GlobalStyle";
import { useRecoilValue } from "recoil";
import { userState } from "./atoms";
import { IUserState } from "./interface/auth-interface";

export default function Router() {
  const { bgImg } = useRecoilValue<IUserState>(userState);

  return (
    <>
      <Reset backgroundImage={bgImg} />
      <BrowserRouter>
        <Suspense>
          <NavigationBar />
        </Suspense>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
