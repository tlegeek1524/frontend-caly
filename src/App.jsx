import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/auth/login";
import LineLogin from "./page/auth/linelogin";
import LineCallback from "./page/auth/linecallback";
import MainPage from "./page/main/index";
import Regispage from "./page/user/regis/regispage";
import MainDashboard from "./page/user/dashboard/maindashboard";
import FoodMenu from "./page/user/dashboard/foodmenu";
import Profile from "./page/user/profile/profile";
import Settings from "./page/user/settings/settings";
import SidebarLayout from "./components/Sidebar/SidebarLayout";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LineLogin />} />
        <Route path="/linelogin" element={<LineLogin />} />
        <Route path="/auth/line/callback" element={<LineCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/regis" element={<Regispage />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/foodmenu" element={<FoodMenu />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

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
