import { googleAuth, loginWithEmailOrUsername, signUpWithEmail, resetPassword } from './authFirebase.js';

// ✅ Password Show/Hide Toggle
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-password").forEach((icon) => {
        icon.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");
            const inputField = document.getElementById(targetId);

            if (inputField.type === "password") {
                inputField.type = "text";
                this.classList.replace("fa-eye", "fa-eye-slash");
            } else {
                inputField.type = "password";
                this.classList.replace("fa-eye-slash", "fa-eye");
            }
        });
    });

    // ✅ Form Toggles
    const loginContainer = document.getElementById("login-container");
    const signupContainer = document.getElementById("signup-container");
    const forgotPasswordContainer = document.getElementById("forgot-password-container");

    document.getElementById("signup-link")?.addEventListener("click", () => {
        loginContainer.style.display = "none";
        signupContainer.style.display = "block";
        forgotPasswordContainer.style.display = "none";
    });

    document.getElementById("login-link")?.addEventListener("click", () => {
        loginContainer.style.display = "block";
        signupContainer.style.display = "none";
        forgotPasswordContainer.style.display = "none";
    });

    document.getElementById("forgot-password-link")?.addEventListener("click", () => {
        loginContainer.style.display = "none";
        signupContainer.style.display = "none";
        forgotPasswordContainer.style.display = "block";
    });

    document.getElementById("login-link-forgot")?.addEventListener("click", () => {
        loginContainer.style.display = "block";
        signupContainer.style.display = "none";
        forgotPasswordContainer.style.display = "none";
    });
});

// ✅ Function to show dynamic alert
function showAlert(message, type = "error") {
    const alertContainer = document.getElementById("alert-container");
    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;

    alertContainer.appendChild(alertBox);

    // Remove alert after 3 seconds
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}

// ✅ Function to show/hide error messages
function showError(inputId, message) {
    const inputField = document.getElementById(inputId);
    const errorMessage = document.getElementById(`${inputId}-error`);

    if (inputField) inputField.style.borderColor = "red";
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }
}

// ✅ Function to clear errors
function clearError(inputId) {
    const inputField = document.getElementById(inputId);
    const errorMessage = document.getElementById(`${inputId}-error`);

    if (inputField) inputField.style.borderColor = "#DADAF2";
    if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }
}

// ✅ Google Authentication
document.getElementById("google-signin-btn")?.addEventListener("click", () => {
    googleAuth()
        .then(() => showAlert("Google login successful!", "success"))
        .catch((error) => showAlert(error.message));
});

document.getElementById("google-signup-btn")?.addEventListener("click", () => {
    googleAuth()
        .then(() => showAlert("Google signup successful!", "success"))
        .catch((error) => showAlert(error.message));
});

// ✅ Login Form Handling
document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailOrUsername = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    clearError("login-password");

    if (!emailOrUsername || !password) {
        showAlert("Please enter both email/username and password.");
        return;
    }

    loginWithEmailOrUsername(emailOrUsername, password)
        .then(() => {
            showAlert("Login successful!", "success");
        })
        .catch((error) => {
            if (error.message.includes("wrong-password")) {
                showError("login-password", "Wrong password.");
            } else {
                showAlert(error.message);
            }
        });
});

// ✅ Signup Form Handling
document.getElementById("signup-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fullName = document.getElementById("full-name").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    clearError("password");
    clearError("confirm-password");

    if (!fullName || !username || !email || !phone || !password || !confirmPassword) {
        showAlert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        showError("confirm-password", "Passwords do not match.");
        return;
    }

    signUpWithEmail(fullName, username, email, phone, password)
        .then(() => {
            showAlert("Signup successful! Please verify your email.", "success");
        })
        .catch((error) => {
            showAlert(error.message);
        });
});

// ✅ Reset Password Handling
document.getElementById("reset-password-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("reset-email").value.trim();

    if (!email) {
        showAlert("Please enter your email.");
        return;
    }

    resetPassword(email)
        .then(() => {
            showAlert("Password reset link sent. Check your email.", "success");
        })
        .catch((error) => {
            showAlert(error.message);
        });
});