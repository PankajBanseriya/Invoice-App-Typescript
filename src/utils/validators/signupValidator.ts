export interface SignupFormData {
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

export type SignupErrors = Partial<
  Record<keyof SignupFormData, string>
>;

export const validateSignup = (
  values: SignupFormData,
): SignupErrors => {
  const errors: SignupErrors = {};

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;

  if (!values.FirstName.trim()) {
    errors.FirstName =
      "Please enter your first name.";
  }

  if (!values.LastName.trim()) {
    errors.LastName =
      "Please enter your last name.";
  }

  if (!values.Email.trim()) {
    errors.Email = "Email is required.";
  } else if (!emailRegex.test(values.Email)) {
    errors.Email =
      "Enter a valid email address.";
  }

  if (!values.Password) {
    errors.Password =
      "Password is required.";
  } else if (
    !passwordRegex.test(values.Password)
  ) {
    errors.Password =
      "Password must contain uppercase letter, number and special character.";
  }

  if (!values.CompanyName.trim()) {
    errors.CompanyName =
      "Please enter company name.";
  }

  if (!values.Address.trim()) {
    errors.Address =
      "Please enter company address.";
  }

  if (!values.City.trim()) {
    errors.City = "Please enter city.";
  }

  if (!/^\d{6}$/.test(values.ZipCode)) {
    errors.ZipCode =
      "Zip code must be exactly 6 digits.";
  }

  if (!values.CurrencySymbol.trim()) {
    errors.CurrencySymbol =
      "Currency symbol is required.";
  } else if (
    values.CurrencySymbol.length > 5
  ) {
    errors.CurrencySymbol =
      "Max 5 characters allowed.";
  }

  return errors;
};