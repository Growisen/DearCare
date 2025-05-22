import { useState, useEffect } from 'react';

export const useEmailValidation = (initialEmail: string) => {
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email cannot be empty";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const checkEmailValidity = () => {
    const error = validateEmail(email);
    setEmailError(error);
    return !error;
  };

  return {
    email,
    setEmail,
    emailError,
    setEmailError,
    validateEmail,
    checkEmailValidity
  };
};

export const usePasswordValidation = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";

    const validations = [
      { check: password.length >= 6, message: "Password must be at least 6 characters" },
      { check: /\d/.test(password), message: "Password must contain at least one number" },
      { check: /[A-Z]/.test(password), message: "Password must contain at least one uppercase letter" },
      { check: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: "Password must contain at least one special character" },
      { check: !(/123456|password|qwerty/i.test(password)), message: "Password contains common insecure patterns" }
    ];

    const failedRule = validations.find(rule => !rule.check);
    return failedRule ? failedRule.message : "";
  };

  const validateConfirmPassword = (password: string, confirmPwd: string) => {
    if (!confirmPwd) return "Please confirm your password";
    return password !== confirmPwd ? "Passwords don't match" : "";
  };

  const checkPasswordValidity = () => {
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return false;
    }

    const confirmError = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmError) {
      setPasswordError(confirmError);
      return false;
    }

    return true;
  };

  // Update password match state when passwords change
  useEffect(() => {
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordsMatch(false);
        setPasswordError("Passwords don't match");
      } else if (!validatePassword(newPassword)) {
        setPasswordsMatch(true);
        setPasswordError("");
      }
    } else {
      setPasswordsMatch(null);
    }
  }, [newPassword, confirmPassword]);

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    setPasswordError,
    passwordsMatch,
    validatePassword,
    validateConfirmPassword,
    checkPasswordValidity
  };
};