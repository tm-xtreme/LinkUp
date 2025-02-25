import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { uploadProfilePhoto, verifyEmail } from "./authFirebase.js"; 

// ✅ Firebase Initialization
const auth = getAuth();
const db = getDatabase();

// ✅ Load User Data
function loadUserData(userId) {
  const userRef = ref(db, `users/${userId}`);

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // ✅ Populate UI
        document.getElementById("user-name").textContent = userData.fullName || "N/A";
        document.getElementById("user-username").textContent = userData.username || "N/A";
        document.getElementById("user-email").textContent = userData.email || "N/A";
        document.getElementById("user-phone").textContent = userData.phone || "N/A";
        document.getElementById("user-bio").textContent = userData.bio || "N/A";
        document.getElementById("user-photo").src = userData.photoURL || "default-profile.png";

        // Fill the edit form
        document.getElementById("user-name-edit").value = userData.fullName;
        document.getElementById("user-username-edit").value = userData.username;
        document.getElementById("user-email-edit").value = userData.email;
        document.getElementById("user-phone-edit").value = userData.phone;
        document.getElementById("user-bio-edit").value = userData.bio || "";
      } else {
        showAlert("No user data found.");
      }
    })
    .catch((error) => {
      showAlert("Error loading user data: " + error.message);
    });
}

// ✅ Check Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserData(user.uid);
  } else {
    window.location.href = "login"; // Redirect if not logged in
  }
});

// ✅ Enable Edit Mode
document.getElementById("edit-profile-btn").addEventListener("click", () => {
  toggleEditMode(true);
});

// ✅ Update Profile
document.getElementById("update-profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const userRef = ref(db, `users/${user.uid}`);

  const fullName = document.getElementById("user-name-edit").value;
  const username = document.getElementById("user-username-edit").value;
  const email = document.getElementById("user-email-edit").value;
  const phone = document.getElementById("user-phone-edit").value;
  const bio = document.getElementById("user-bio-edit").value;

  const updatedData = { fullName, username, email, phone, bio };

  try {
    // ✅ Update User Data in Firebase Realtime Database
    await update(userRef, updatedData);
    showAlert("Profile updated successfully!", "success");

    // ✅ Check if email is changed and verify
    if (email !== user.email) {
      await verifyEmail();
      showAlert("Verification email sent!", "success");
    }

    // ✅ Update Profile Picture
    const profilePhoto = document.getElementById("profile-photo").files[0];
    if (profilePhoto) {
      const photoURL = await uploadProfilePhoto(profilePhoto);
      await updateProfile(user, { photoURL });
      await update(userRef, { photoURL });
      document.getElementById("user-photo").src = photoURL;
      showAlert("Profile photo updated!", "success");
    }

    toggleEditMode(false);
  } catch (error) {
    showAlert(error.message);
  }
});

// ✅ Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login";
    })
    .catch((error) => {
      showAlert("Logout Error: " + error.message);
    });
});

// ✅ Toggle Edit Mode
function toggleEditMode(isEditing) {
  document.getElementById("profile-view").style.display = isEditing ? "none" : "block";
  document.getElementById("edit-profile").style.display = isEditing ? "block" : "none";
}

// ✅ Show Alert Messages
function showAlert(message, type = "error") {
  const alertContainer = document.getElementById("alert-container");
  if (!alertContainer) return;

  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.textContent = message;
  alertContainer.appendChild(alert);

  setTimeout(() => alert.remove(), 3000);
}
