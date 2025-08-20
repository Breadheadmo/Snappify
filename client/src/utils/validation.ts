// Form validation utilities
export type ValidationError = string | null;

// Email validation with regex
export const validateEmail = (email: string): ValidationError => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

// Password validation
export const validatePassword = (password: string): ValidationError => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  
  // Check for complexity - at least one number and one letter
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  
  if (!hasNumber || !hasLetter) {
    return "Password must contain at least one letter and one number";
  }
  
  return null;
};

// Username validation
export const validateUsername = (username: string): ValidationError => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 20) return "Username must be less than 20 characters";
  
  // Check if username contains only letters, numbers, and underscores
  const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!validUsernameRegex.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  
  return null;
};

// Name validation
export const validateName = (name: string): ValidationError => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  return null;
};

// Phone number validation
export const validatePhone = (phone: string): ValidationError => {
  if (!phone) return "Phone number is required";
  
  // Remove any non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return "Phone number must have at least 10 digits";
  }
  
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationError => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

// Postal code validation
export const validatePostalCode = (postalCode: string): ValidationError => {
  if (!postalCode) return "Postal code is required";
  
  // Different countries have different postal code formats, this is a simple check
  if (postalCode.length < 4) {
    return "Please enter a valid postal code";
  }
  
  return null;
};

// Address validation
export const validateAddress = (address: string): ValidationError => {
  if (!address) return "Address is required";
  if (address.length < 5) return "Please enter a complete address";
  return null;
};

// Credit card number validation
export const validateCreditCard = (cardNumber: string): ValidationError => {
  if (!cardNumber) return "Credit card number is required";
  
  // Remove spaces and dashes
  const digitsOnly = cardNumber.replace(/[\s-]/g, '');
  
  // Most credit cards have between 13-19 digits
  if (digitsOnly.length < 13 || digitsOnly.length > 19) {
    return "Please enter a valid credit card number";
  }
  
  // Simple Luhn algorithm check (used for credit card validation)
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits in reverse
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  if (sum % 10 !== 0) {
    return "Please enter a valid credit card number";
  }
  
  return null;
};

// Expiration date validation
export const validateExpiryDate = (month: string, year: string): ValidationError => {
  if (!month || !year) return "Expiration date is required";
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  
  const expiryYear = parseInt(year);
  const expiryMonth = parseInt(month);
  
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return "Card has expired";
  }
  
  return null;
};

// CVV validation
export const validateCVV = (cvv: string): ValidationError => {
  if (!cvv) return "CVV is required";
  
  // CVV is typically 3-4 digits
  const cvvRegex = /^\d{3,4}$/;
  if (!cvvRegex.test(cvv)) {
    return "Please enter a valid CVV";
  }
  
  return null;
};

// Form field state tracker
export interface FieldState {
  value: string;
  error: ValidationError;
  touched: boolean;
}

// Create a validated field state
export const createFieldState = (initialValue: string = ''): FieldState => ({
  value: initialValue,
  error: null,
  touched: false
});

// Update a field state based on validator
export const updateFieldState = (
  state: FieldState,
  newValue: string,
  validator?: (value: string) => ValidationError
): FieldState => {
  return {
    value: newValue,
    error: validator ? validator(newValue) : null,
    touched: true
  };
};

// Check if a form is valid (all fields have no errors)
export const isFormValid = (fields: Record<string, FieldState>): boolean => {
  return Object.values(fields).every(field => !field.error && field.touched);
};
