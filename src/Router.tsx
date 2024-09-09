import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import TodosPage from "./pages/Todos";
import MyPage from "./pages/MyPage";
import NavigationBar from "./components/navigation";
import { Suspense } from "react";

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense>
        <NavigationBar />
      </Suspense>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
