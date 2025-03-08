import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./Pages/Index";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Auth from "./Components/Auth/Auth";
import UserDreams from "./Pages/UserDreams";
import Admin from "./Pages/Admin";
import NotFound from "./Pages/NotFound";
import ChatWrapper from "./Pages/ChatWrapper";

const App: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
        
        <Route element={<Auth />}>
          <Route path="/home" element={<Home />} />
          <Route path="/user-dreams" element={<UserDreams />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
      {['/home', '/user-dreams', '/admin'].includes(location.pathname) && 
        <ChatWrapper />
      }

    </AnimatePresence>
  );
};

export default App;
