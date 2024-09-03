import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import TodosPage from "./pages/Todos";
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/todos" element={<TodosPage />} />
      </Routes>
    </BrowserRouter>
  );
}
