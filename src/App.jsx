import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/auth/login";
import MainPage from "./page/main/index";
import SidebarLayout from "./components/Sidebar/SidebarLayout";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Wrap protected routes with SidebarLayout */}
        <Route element={<SidebarLayout />}>
          <Route path="/main" element={<MainPage />} />
          {/* Add more pages here that should have the sidebar */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
