import { useState, useEffect } from 'react';

export const useEmailValidation = (initialEmail: string = '') => {
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

export const useNameValidation = (initialName: string = '', isRequired: boolean = true) => {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState("");

  const validateName = (value: string) => {
    const trimmedName = value.trim();

    if (!trimmedName) {
      if (isRequired) return "Name is required";
      return ""; 
    }

    const nameRegex = /^[a-zA-Z\s.]+$/;
    if (!nameRegex.test(trimmedName)) {
      return "Name should contain only letters, spaces, and periods";
    }

    return "";
  };

  const checkNameValidity = () => {
    const error = validateName(name);
    setNameError(error);
    return !error;
  };

  return {
    name,
    setName,
    nameError,
    setNameError,
    validateName,
    checkNameValidity
  };
};

export const usePhoneValidation = (initialPhone: string = '', isRequired: boolean = true, digitLength: number = 10) => {
  const [phone, setPhone] = useState(initialPhone);
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (value: string) => {
    const trimmedPhone = value.trim();

    if (!trimmedPhone) {
      if (isRequired) return "Phone number is required";
      return "";
    }

    const phoneRegex = new RegExp(`^\\d{${digitLength}}$`);
    if (!phoneRegex.test(trimmedPhone)) {
      return `Phone must be exactly ${digitLength} digits`;
    }
    
    return "";
  };

  const checkPhoneValidity = () => {
    const error = validatePhone(phone);
    setPhoneError(error);
    return !error;
  };

  return {
    phone,
    setPhone,
    phoneError,
    setPhoneError,
    validatePhone,
    checkPhoneValidity
  };
};

export const usePincodeValidation = (initialPincode: string = '', isRequired: boolean = true, digitLength: number = 6) => {
  const [pincode, setPincode] = useState(initialPincode);
  const [pincodeError, setPincodeError] = useState("");

  const validatePincode = (value: string) => {
    const trimmedPincode = value.trim();

    if (!trimmedPincode) {
      if (isRequired) return "PIN code is required";
      return "";
    }

    const pincodeRegex = new RegExp(`^\\d{${digitLength}}$`);
    if (!pincodeRegex.test(trimmedPincode)) {
      return `PIN code must be exactly ${digitLength} digits`;
    }

    return "";
  };

  const checkPincodeValidity = () => {
    const error = validatePincode(pincode);
    setPincodeError(error);
    return !error;
  };

  return {
    pincode,
    setPincode,
    pincodeError,
    setPincodeError,
    validatePincode,
    checkPincodeValidity
  };
};


export const useTextFieldValidation = (
  initialValue: string = '',
  fieldName: string = 'Field',
  allowOnlyLetters: boolean = false
) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  const validateTextField = (text: string) => {
    if (!text.trim()) return `${fieldName} is required`;
    if (allowOnlyLetters) {
      const letterRegex = /^[a-zA-Z\s]+$/;
      if (!letterRegex.test(text)) return `${fieldName} should contain only letters and spaces`;
    }
    return "";
  };

  const checkValidity = () => {
    const errorMsg = validateTextField(value);
    setError(errorMsg);
    return !errorMsg;
  };

  return {
    value,
    setValue,
    error,
    setError,
    validateTextField,
    checkValidity
  };
};

export const useAddressValidation = (initialAddress?: {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}) => {
  const line1Validation = useTextFieldValidation(initialAddress?.line1 || '', 'Address line 1');
  const cityValidation = useTextFieldValidation(initialAddress?.city || '', 'City', true);
  const districtValidation = useTextFieldValidation(initialAddress?.district || '', 'District', true);
  const stateValidation = useTextFieldValidation(initialAddress?.state || '', 'State', true);
  const pincodeValidation = usePincodeValidation(initialAddress?.pincode || '');
  
  const [line2, setLine2] = useState(initialAddress?.line2 || '');

  const getAddressObject = () => ({
    line1: line1Validation.value,
    line2: line2,
    city: cityValidation.value,
    district: districtValidation.value,
    state: stateValidation.value,
    pincode: pincodeValidation.pincode
  });

  const validateAddress = () => {
    const isLine1Valid = line1Validation.checkValidity();
    const isCityValid = cityValidation.checkValidity();
    const isDistrictValid = districtValidation.checkValidity();
    const isStateValid = stateValidation.checkValidity();
    const isPincodeValid = pincodeValidation.checkPincodeValidity();
    
    return isLine1Valid && isCityValid && isDistrictValid && isStateValid && isPincodeValid;
  };
  
  return {
    // Line 1
    line1: line1Validation.value,
    setLine1: line1Validation.setValue,
    line1Error: line1Validation.error,
    
    // Line 2 (optional)
    line2,
    setLine2,
    
    // City
    city: cityValidation.value,
    setCity: cityValidation.setValue,
    cityError: cityValidation.error,
    
    // District
    district: districtValidation.value,
    setDistrict: districtValidation.setValue,
    districtError: districtValidation.error,
    
    // State
    state: stateValidation.value,
    setState: stateValidation.setValue,
    stateError: stateValidation.error,
    
    // Pincode
    pincode: pincodeValidation.pincode,
    setPincode: pincodeValidation.setPincode,
    pincodeError: pincodeValidation.pincodeError,
    
    // Full address and validation
    getAddressObject,
    validateAddress
  };
};