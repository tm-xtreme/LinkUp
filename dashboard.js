import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { uploadProfilePhoto, verifyEmail } from './authFirebase.js'; // Importing functions from your custom Firebase setup

// ✅ Firebase Initialization
const auth = getAuth();
const db = getDatabase();

// ✅ Function to Fetch User Data from Database
function loadUserData(userId) {
  const userRef = ref(db, `users/${userId}`);

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // ✅ Populate UI with user data
        document.getElementById("user-name").textContent = userData.fullName || "N/A";
        document.getElementById("user-username").textContent = userData.username || "N/A";
        document.getElementById("user-email").textContent = userData.email || "N/A";
        document.getElementById("user-phone").textContent = userData.phone || "N/A";
        document.getElementById("user-photo").src = userData.photoURL || "default-profile.png";

        // Fill the edit form with current data
        document.getElementById('user-name-edit').value = userData.fullName;
        document.getElementById('user-username-edit').value = userData.username;
        document.getElementById('user-email-edit').value = userData.email;
        document.getElementById('user-phone-edit').value = userData.phone;
        document.getElementById('user-bio-edit').value = userData.bio || "";
      } else {
        alert("No user data found.");
      }
    })
    .catch((error) => {
      alert("Error loading user data: " + error.message);
    });
}

// ✅ Check User Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserData(user.uid);
  } else {
    window.location.href = "sign.html"; // Redirect if not logged in
  }
});

// ✅ Edit Profile
document.getElementById('edit-profile-btn').addEventListener('click', () => {
  toggleEditMode(true);
});

// ✅ Profile Update Form Submit
document.getElementById('update-profile-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const userRef = ref(db, `users/${user.uid}`);

  const fullName = document.getElementById('user-name-edit').value;
  const username = document.getElementById('user-username-edit').value;
  const email = document.getElementById('user-email-edit').value;
  const phone = document.getElementById('user-phone-edit').value;
  const bio = document.getElementById('user-bio-edit').value;

  const updatedData = {
    fullName,
    username,
    email,
    phone,
    bio
  };

  update(userRef, updatedData)
    .then(() => {
      showAlert('Profile updated successfully!', 'success');
      if (email !== user.email) {
        verifyEmail().then(() => {
          showAlert('Verification email sent!', 'success');
        });
      }
      toggleEditMode(false);
    })
    .catch((error) => {
      showAlert(error.message);
    });

  const profilePhoto = document.getElementById('profile-photo').files[0];
  if (profilePhoto) {
    uploadProfilePhoto(profilePhoto).then((photoURL) => {
      updateProfile(user, { photoURL })
        .then(() => {
          showAlert('Profile photo updated!', 'success');
        })
        .catch((error) => {
          showAlert(error.message);
        });
    });
  }
});

// ✅ Logout Function
document.getElementById('logout-btn').addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      window.location.href = 'login.html';
    })
    .catch((error) => {
      alert('Logout Error: ' + error.message);
    });
});

// Toggle between view and edit modes
function toggleEditMode(isEditing) {
  document.getElementById('profile-view').style.display = isEditing ? 'none' : 'block';
  document.getElementById('edit-profile').style.display = isEditing ? 'block' : 'none';
}

// Show alerts on the page
function showAlert(message, type = 'error') {
  const alertContainer = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  alert.textContent = message;
  alertContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
                }
