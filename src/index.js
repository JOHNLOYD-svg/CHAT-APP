import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./app/index";
import Chat from "./app/chat";
import Login from "./app/login";
import Profile from "./app/profile";
import Signup from "./app/signup";
import Collab from "./app/collab";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/community" element={<Collab />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
