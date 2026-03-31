// src/utils/validation.ts

export const validateName = (name: string): string | null => {
    const nameRegex = /^[A-Za-z.]+(?: [A-Za-z.]+)*$/;
    if (!name.trim()) {
        return "Name is required";
    } else if (!nameRegex.test(name.trim())) {
        return "Name can only contain alphabets, periods, and single spaces";
    }
    return null;
};

export const validatePhone = (phone: string): string | null => {
    // const phoneRegex = /^[0-9]\d{9}$/; 
    // const phoneRegex = /^(?:\+971|971)?5[0-9]{8}$/;
    const phoneRegex = /^5[0-9]{8}$/;
    if (!phone.trim()) {
        return "Phone number is required";
    } else if (!phoneRegex.test(phone.trim())) {
        return "Please enter a valid mobile number";
    }
    return null;
};

export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
        return "Email is required";
    } else if (!emailRegex.test(email.trim())) {
        return "Please enter a valid email address.";
    }
    return null;
};

export const validatePassword = (password: string): string | null => {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!password.trim()) {
        return "Password is required";
    } else if (!passwordRegex.test(password.trim())) {
        return "Create a password that is at least 8 characters long, includes uppercase, lowercase, a number, and a special character.";
    }
    return null;
};

export const validateOldPassword = (password: string): string | null => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!password.trim()) {
        return "Old Password is required";
    } else if (!passwordRegex.test(password.trim())) {
        return "Create a password that is at least 8 characters long, includes uppercase, lowercase, a number, and a special character.";
    }
    return null;
};

export const validatePasswordNConfirmPassword = (
    password: string,
    confirmPassword: string
): string | null => {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

    if (!password.trim()) {
        return "Password is required";
    } else if (!passwordRegex.test(password.trim())) {
        return "Create a password that is at least 8 characters long, includes uppercase, lowercase, a number, and a special character.";
    } else if (!confirmPassword.trim()) {
        return "Confirm Password is required";
    } else if (password.trim() !== confirmPassword.trim()) {
        return "Passwords do not match.";
    }

    return null;
};

export const validatePasswordNConfirmPasswordProfile = (
    password: string,
    confirmPassword: string
): string | null => {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

    if (!password.trim()) {
        return "New Password is required";
    } else if (!passwordRegex.test(password.trim())) {
        return "Create a password that is at least 8 characters long, includes uppercase, lowercase, a number, and a special character.";
    } else if (!confirmPassword.trim()) {
        return "Confirm Password is required";
    } else if (password.trim() !== confirmPassword.trim()) {
        return "Passwords do not match.";
    }

    return null;
};


export const validateEmailOrPhone = (value: string): string | null => {
    const emailOrPhoneRegex =
        /^(\+?[0-9]{7,15}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

    if (!value.trim()) {
        return "Email or phone number is required";
    } else if (!emailOrPhoneRegex.test(value.trim())) {
        return "Please enter a valid email address or phone number";
    }

    return null;
};

