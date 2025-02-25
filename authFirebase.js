import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, sendEmailVerification, updateProfile
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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
const storage = getStorage(app);

// ✅ Show Alerts
function showAlert(message, type = "error") {
  const alertContainer = document.getElementById("alert-container");
  if (!alertContainer) return;

  const cleanMessage = message.replace(/^Firebase:\s*/, ""); // Remove "Firebase:" prefix
  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.innerHTML = `<span>${cleanMessage}</span> <button class="close-alert">&times;</button>`;

  alertContainer.appendChild(alertBox);
  alertBox.querySelector(".close-alert").addEventListener("click", () => alertBox.remove());
  setTimeout(() => alertBox.remove(), 4000);
}

// ✅ Google Authentication (Store in Database)
export function googleAuth() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        await set(userRef, {
          fullName: user.displayName || "Google User",
          email: user.email,
          username: user.email.split("@")[0], // Use email prefix as username
          phone: user.phoneNumber || "Not provided",
          photoURL: user.photoURL || ""
        });
      }

      localStorage.setItem("user", JSON.stringify({
        displayName: user.displayName, email: user.email, photoURL: user.photoURL
      }));
      showAlert(`Welcome ${user.displayName}!`, "success");
      window.location.href = "dashboard.html";
    })
    .catch((error) => showAlert(error.message));
}

// ✅ Sign Up with Email
export function signUpWithEmail(fullName, username, email, phone, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const userRef = ref(db, `users/${user.uid}`);

      await set(userRef, { fullName, username, email, phone });
      localStorage.setItem("user", JSON.stringify({ fullName, username, email, phone }));
      showAlert("Account created successfully!", "success");
      window.location.href = "dashboard.html";
    })
    .catch((error) => showAlert(error.message));
}

// ✅ Login with Email or Username
export function loginWithEmailOrUsername(emailOrUsername, password) {
  const dbRef = ref(db, "users");

  get(dbRef)
    .then((snapshot) => {
      if (!snapshot.exists()) return showAlert("No user records found.");

      let userFound = null;
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.email === emailOrUsername || user.username === emailOrUsername) {
          userFound = user;
        }
      });

      if (userFound) {
        signInWithEmailAndPassword(auth, userFound.email, password)
          .then(() => {
            localStorage.setItem("user", JSON.stringify({ email: userFound.email, username: userFound.username }));
            showAlert("Login successful!", "success");
            window.location.href = "dashboard.html";
          })
          .catch((error) => showAlert(error.message));
      } else {
        showAlert("User not found.");
      }
    })
    .catch((error) => showAlert(error.message));
}

// ✅ Reset Password
export function resetPassword(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => showAlert("Password reset link sent to your email.", "success"))
    .catch((error) => showAlert(error.message));
}

// ✅ Upload & Update Profile Photo
export async function uploadProfilePhoto(file) {
  const user = auth.currentUser;
  if (!user) return;

  const fileRef = storageRef(storage, `profile_photos/${user.uid}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);

  await updateUserProfile(user.uid, { photoURL: downloadURL });
  await updateProfile(user, { photoURL: downloadURL });

  return downloadURL;
}

// ✅ Update User Profile Data
export async function updateUserProfile(userId, userData) {
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, userData);
}

// ✅ Verify Email
export async function verifyEmail() {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
    showAlert("Verification email sent! Check your inbox.", "success");
  } else {
    showAlert("Email already verified.", "success");
  }
}

export { auth, db, showAlert };
