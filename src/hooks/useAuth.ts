import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();
  
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);

  const login = async (data: any) => {
    setIsLoggingIn(true);
    try {
      const res = await api.post("/Auth/Login", data);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful!");
      navigate("/invoices");
    } catch (err: any) {
      console.log(err);
      toast.error("Invalid email or password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signup = async (data: any) => {
    setIsSigningUp(true);
    try {
      const res = await api.post("/Auth/Signup", data);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Signup Successful!");
      navigate("/invoices");
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data || "Signup failed");
    } finally {
      setIsSigningUp(false);
    }
  };

  return { login, signup, isLoggingIn, isSigningUp };
};




