
import { createBrowserRouter } from "react-router-dom";
import { Dashboard } from "./pages/dashboard";
import { New } from "./pages/dashboard/new";
import { Detail } from "./pages/detail";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Profile } from "./pages/profile"

import { Layout } from "./components/layout";

import { Private } from "./routes/private";

const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/dashboard",
        element: <Private><Dashboard/></Private>
      },
      {
        path: "/dashboard/new",
        element: <Private><New/></Private>
      },
      {
        path: "/detail/:id",
        element: <Detail/>
      },
      {
        path: "/Profile",
        element: <Private><Profile/></Private>
      }
    ]
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/register",
    element: <Register/>
  }
])

export { router};
