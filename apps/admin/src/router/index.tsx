import Login from "../pages/Login";
import Register from "../pages/Register";
import Layout from "../pages/Layout";
import UserManage from "../pages/UserManage";
import MenuManage from "../pages/MenuManage";
import { Navigate } from "react-router-dom";

const routes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Navigate to="user" /> },
      { path: "user", element: <UserManage /> },
      { path: "menu", element: <MenuManage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" /> },
];

export default routes;
