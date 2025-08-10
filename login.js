// login.js
// Handles user login on the login page using usernames.

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to home
  const currentUser = localStorage.getItem('lawuTennisCurrentUser');
  if (currentUser) {
    window.location.href = 'index.html';
    return;
  }
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }
    // Attempt to log in the user. loginUser returns true on success and
    // false on failure. It will show its own alert when credentials are
    // invalid, so we only need to check the return value here.
    const success = loginUser(username, password);
    if (!success) {
      // loginUser already displayed an error message for invalid credentials
      return;
    }
    // Successful login
    alert('Login successful!');
    // Redirect to home page
    window.location.href = 'index.html';
  });
});