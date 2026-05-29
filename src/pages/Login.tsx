import { useState } from "react";
import type { ChangeEvent } from "react";

import {
  Box,
  Typography,
  Paper,
  Container,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import AppButton from "../components/common/AppButton";
import AppTextField from "../components/common/AppTextField";
import LoadingBackdrop from "../components/common/LoadingBackdrop";

import {
  validateLogin,
  type LoginErrors,
} from "../utils/validators/loginValidator";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const navigate = useNavigate();

  const { login, isLoggingIn } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [errors, setErrors] = useState<LoginErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const validationErrors = validateLogin({
      email: formData.email,
      password: formData.password,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "#f9f9f9",
          py: 3.8,
        }}
      >
        <Container maxWidth="sm">
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              fontWeight="400"
              fontSize="30px"
              mb={1}
            >
              Welcome Back
            </Typography>

            <Typography color="text.secondary">
              Log in to your account.
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
            }}
          >
            <form onSubmit={handleSubmit}>
              <AppTextField
                label="Email Address*"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 3 }}
              />

              <AppTextField
                label="Password*"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="Enter password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    size="small"
                  />
                }
                label="Remember me"
              />

              <Box textAlign="right" mt={3}>
                <AppButton
                  type="submit"
                  disabled={isLoggingIn}
                >
                  Login
                </AppButton>
              </Box>

              <Box textAlign="center" mt={4}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    underline="hover"
                    color="inherit"
                    fontWeight={600}
                    onClick={() =>
                      navigate("/signup")
                    }
                  >
                    Create account
                  </Link>
                </Typography>
              </Box>
            </form>
          </Paper>
        </Container>
      </Box>

      <LoadingBackdrop
        open={isLoggingIn}
        text="Logging in..."
      />
    </>
  );
}