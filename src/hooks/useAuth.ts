import useSWRMutation from "swr/mutation";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

async function sendRequest(url: string, { arg }: { arg: any }) {
  return api.post(url, arg).then((res) => res.data);
}

export const useAuth = () => {
  const navigate = useNavigate();

  // Login Mutation
  const { trigger: loginTrigger, isMutating: isLoggingIn } = useSWRMutation(
    "/Auth/Login",
    sendRequest
  );

  // Signup Mutation
  const { trigger: signupTrigger, isMutating: isSigningUp } = useSWRMutation(
    "/Auth/Signup",
    sendRequest
  );

  const login = async (data: any) => {
    try {
      const result = await loginTrigger(data);
      if (result) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast.success("Login Successful!");
        navigate("/invoices");
      }
    } catch (err: any) {
      toast.error("Invalid email or password");
    }
  };

  const signup = async (data: any) => {
    try {
      const result = await signupTrigger(data);
      if (result) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast.success("Signup Successful!");
        navigate("/invoices");
      }
    } catch (err: any) {
      toast.error("Signup failed");
    }
  };

  return { login, signup, isLoggingIn, isSigningUp };
};