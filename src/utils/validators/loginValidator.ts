export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export const validateLogin = (
  values: LoginFormData
): LoginErrors => {
  const errors: LoginErrors = {};

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email)) {
    errors.email = "Enter valid email";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
};