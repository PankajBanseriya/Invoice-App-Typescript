import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Container,
  Divider,
  Avatar,
  Button,
  LinearProgress,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { CloudUpload, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import AppButton from "../components/common/AppButton";
import AppTextField from "../components/common/AppTextField";
import LoadingBackdrop from "../components/common/LoadingBackdrop";

import { validateSignup, type SignupErrors } from "../utils/validators/signupValidator";

interface SignupFormData {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  CompanyName: string;
  Address: string;
  City: string;
  ZipCode: string;
  Industry: string;
  CurrencySymbol: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<SignupFormData>({
    FirstName: "",
    LastName: "",
    Email: "",
    Password: "",
    CompanyName: "",
    Address: "",
    City: "",
    ZipCode: "",
    Industry: "",
    CurrencySymbol: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG/PNG allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const getStrength = () => {
    const password = formData.Password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateSignup(formData);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (logoFile) {
      data.append("logo", logoFile);
    }

    signup(data);
  };

  return (
    <>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="400" fontSize="30px" mb={1}>
            Create Your Account
          </Typography>

          <Typography color="text.secondary">
            Set up your company and start invoicing in minutes.
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
            <Grid container spacing={4}>
              {/* Left Section */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" fontWeight={500}>
                  User Information
                </Typography>

                <Divider sx={{ my: 2 }} />

                <AppTextField
                  label="First Name*"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  error={!!errors.FirstName}
                  helperText={errors.FirstName}
                  inputProps={{ maxLength: 50 }}
                  placeholder="Enter first name"
                  sx={{ mb: 2 }}
                />

                <AppTextField
                  label="Last Name*"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  error={!!errors.LastName}
                  helperText={errors.LastName}
                  inputProps={{ maxLength: 50 }}
                  placeholder="Enter last name"
                  sx={{ mb: 2 }}
                />

                <AppTextField
                  label="Email*"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  error={!!errors.Email}
                  helperText={errors.Email}
                  placeholder="Enter your email"
                  sx={{ mb: 2 }}
                />

                <AppTextField
                  label="Password*"
                  name="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.Password}
                  onChange={handleChange}
                  error={!!errors.Password}
                  helperText={errors.Password}
                  inputProps={{ maxLength: 20 }}
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

                <Box mt={2}>
                  <LinearProgress
                    variant="determinate"
                    value={getStrength()}
                    sx={{
                      height: 6,
                      borderRadius: 5,
                    }}
                    color="inherit"
                  />

                  <Typography variant="caption">
                    Password Strength:{" "}
                    {getStrength() <= 25
                      ? "Very Weak"
                      : getStrength() <= 50
                        ? "Weak"
                        : getStrength() <= 75
                          ? "Good"
                          : "Strong"}
                  </Typography>
                </Box>
              </Grid>

              {/* Right Section */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" fontWeight={500}>
                  Company Information
                </Typography>

                <Divider sx={{ my: 2 }} />

                <AppTextField
                  label="Company Name*"
                  name="CompanyName"
                  value={formData.CompanyName}
                  onChange={handleChange}
                  error={!!errors.CompanyName}
                  helperText={errors.CompanyName}
                  inputProps={{ maxLength: 100 }}
                  placeholder="Enter company name"
                  sx={{ mb: 2 }}
                />

                <Typography fontSize="0.9rem" mb={1}>
                  Company Logo
                </Typography>

                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    src={logoPreview || ""}
                    variant="rounded"
                    sx={{
                      width: 60,
                      height: 60,
                    }}
                  >
                    <CloudUpload />
                  </Avatar>

                  <Button
                    component="label"
                    variant="outlined"
                    color="inherit"
                    fullWidth
                  >
                    {logoPreview ? "Change Logo" : "No file chosen"}

                    <input
                      hidden
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleFile}
                    />
                  </Button>
                </Box>

                <AppTextField
                  label="Address*"
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  error={!!errors.Address}
                  helperText={errors.Address}
                  inputProps={{ maxLength: 500 }}
                  placeholder="Enter company address"
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AppTextField
                      label="City*"
                      name="City"
                      value={formData.City}
                      onChange={handleChange}
                      error={!!errors.City}
                      helperText={errors.City}
                      inputProps={{ maxLength: 50 }}
                      placeholder="Enter city"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <AppTextField
                      label="Zip Code*"
                      name="ZipCode"
                      placeholder="6 digit zip code"
                      type="number"
                      inputProps={{ maxLength: 6 }}
                      value={formData.ZipCode}
                      onChange={handleChange}
                      error={!!errors.ZipCode}
                      helperText={errors.ZipCode}
                    />
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <AppTextField
                    label="Industry"
                    name="Industry"
                    value={formData.Industry}
                    inputProps={{ maxLength: 50 }}
                    placeholder="Industry type"
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />

                  <AppTextField
                    label="Currency Symbol*"
                    name="CurrencySymbol"
                    value={formData.CurrencySymbol}
                    onChange={handleChange}
                    error={!!errors.CurrencySymbol}
                    helperText={errors.CurrencySymbol}
                    inputProps={{ maxLength: 5 }}
                    placeholder="$, ₹, €, AED"
                  />
                </Box>
              </Grid>
            </Grid>

            <Box textAlign="right" mt={4}>
              <AppButton type="submit">Sign Up</AppButton>
            </Box>

            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component="button"
                  underline="hover"
                  color="inherit"
                  fontWeight={600}
                  onClick={() => navigate("/")}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>

      <LoadingBackdrop open={isSigningUp} text="Creating your account..." />
    </>
  );
}
