import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/auth/login";
import MainPage from "./page/main/index";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        {/* Add more routes here as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
