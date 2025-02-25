import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase Auth
const auth = getAuth();

// Get user details if logged in
const user = auth.currentUser;

if (user) {
  // Display user details
  document.getElementById("user-name").textContent = `Name: ${user.displayName || 'N/A'}`;
  document.getElementById("user-email").textContent = `Email: ${user.email}`;
  document.getElementById("user-photo").src = user.photoURL || 'default-avatar.jpg'; // Default avatar if no photo

  // Logout button functionality
  document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        alert("Logged out successfully!");
        window.location.href = "index.html"; // Redirect to login page
      })
      .catch((error) => {
        alert("Error logging out: " + error.message);
      });
});
} else {
  // No user is logged in, redirect to login
  window.location.href = "index.html"; // Redirect to login page
}