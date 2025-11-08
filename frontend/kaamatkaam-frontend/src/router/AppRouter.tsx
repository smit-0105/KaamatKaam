import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/Home/HomePage";
import TripList from "../pages/Trips/TripList";
import AddTrip from "../pages/Trips/AddTrip";
import CreateRequest from "../pages/Requests/CreateRequest";
import ChatPage from "../pages/Chat/ChatPage";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "trips", element: <TripList /> },
      { path: "add-trip", element: <AddTrip /> },
      { path: "create-request", element: <CreateRequest /> },
      { path: "chat", element: <ChatPage /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
