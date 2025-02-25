import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4MY7_u6KIJGom906blUtgyRY6w9dfpRA",
  authDomain: "linkup-7fb1b.firebaseapp.com",
  projectId: "linkup-7fb1b",
  storageBucket: "linkup-7fb1b.appspot.com",
  messagingSenderId: "238638872014",
  appId: "1:238638872014:web:fd0f2777bb917b40de679f"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Function to Show Stylish Alerts (Removes "Firebase:" Prefix)
function showAlert(message, type = "error") {
  const alertContainer = document.getElementById("alert-container");
  if (!alertContainer) return;

  // Remove "Firebase: " prefix from error messages
  const cleanMessage = message.replace(/^Firebase:\s*/, "");

  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.innerHTML = `
    <span>${cleanMessage}</span>
    <button class="close-alert">&times;</button>
  `;

  alertContainer.appendChild(alertBox);

  // Close alert on button click
  alertBox.querySelector(".close-alert").addEventListener("click", () => {
    alertBox.remove();
  });

  // Auto-remove after 4 seconds
  setTimeout(() => {
    alertBox.remove();
  }, 4000);
}

// ✅ Google Authentication (Save User Data If New)
export function googleAuth() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      const userId = user.uid;

      // ✅ Check if user exists in DB
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // ✅ Save new user data
        set(userRef, {
          fullName: user.displayName || "Google User",
          email: user.email,
          username: user.email.split("@")[0], // Use email prefix as username
          phone: user.phoneNumber || "Not provided",
          photoURL: user.photoURL || ""
        });
      }

      localStorage.setItem("user", JSON.stringify({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }));
      showAlert(`Welcome ${user.displayName}`, "success");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      showAlert(error.message);
    });
}

// ✅ Sign Up with Email & Save User Data
export function signUpWithEmail(fullName, username, email, phone, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const userId = user.uid;

      // ✅ Save user data in Firebase
      const userRef = ref(db, `users/${userId}`);
      await set(userRef, {
        fullName: fullName,
        username: username,
        email: email,
        phone: phone
      });

      showAlert("Account created successfully!", "success");
      localStorage.setItem("user", JSON.stringify({ fullName, username, email, phone }));
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      showAlert(error.message);
    });
}

// ✅ Login with Email or Username
export function loginWithEmailOrUsername(emailOrUsername, password) {
  const dbRef = ref(db, "users");

  get(dbRef)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        showAlert("No user records found.");
        return;
      }

      let userFound = null;

      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.email === emailOrUsername || user.username === emailOrUsername) {
          userFound = user;
        }
      });

      if (userFound) {
        // ✅ Authenticate using found email
        signInWithEmailAndPassword(auth, userFound.email, password)
          .then((userCredential) => {
            localStorage.setItem("user", JSON.stringify({ email: userFound.email, username: userFound.username }));
            showAlert("Login successful!", "success");
            window.location.href = "dashboard.html";
          })
          .catch((error) => {
            showAlert(error.message);
          });
      } else {
        showAlert("User not found with that email or username.");
      }
    })
    .catch((error) => {
      showAlert(error.message);
    });
}

// ✅ Reset Password
export function resetPassword(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      showAlert("Password reset link sent to your email.", "success");
    })
    .catch((error) => {
      showAlert(error.message);
    });
}