// Authentication and authorization for Lawu Tennis Fun with username-based login
// This file manages user registration, login, logout and admin checks using localStorage.

function requireLogin() {
  // Ensure a user is logged in; redirect to login page if not
  const currentUser = localStorage.getItem('lawuTennisCurrentUser');
  if (!currentUser) {
    window.location.href = 'login.html';
    return null;
  }
  return currentUser;
}

function registerUser(username, password, profileData) {
  // Register a new user with username and password. Profile data contains fullName, phone and other info.
  const users = JSON.parse(localStorage.getItem('lawuTennisUsers')) || [];
  const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};

  // Check if username already exists
  if (users.some(u => u.username === username)) {
    alert('Username already exists');
    return false;
  }

  // Add new user credentials
  users.push({ username, password });
  localStorage.setItem('lawuTennisUsers', JSON.stringify(users));

  // Create profile entry
  profiles[username] = {
    username,
    fullName: profileData.fullName || '',
    phone: profileData.phone || '',
    instagram: profileData.instagram || '',
    birthDate: profileData.birthDate || '',
    gender: profileData.gender || '',
    notes: profileData.notes || '',
    isAdmin: !!profileData.isAdmin
  };
  localStorage.setItem('lawuTennisProfiles', JSON.stringify(profiles));

  return true;
}

function loginUser(username, password) {
  // Log in a user by verifying username and password
  const users = JSON.parse(localStorage.getItem('lawuTennisUsers')) || [];
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    alert('Invalid username or password');
    return false;
  }
  // Set current user session
  localStorage.setItem('lawuTennisCurrentUser', username);

  // Also save profile into session for quick access
  const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
  const profile = profiles[username] || {};
  localStorage.setItem('lawuTennisProfile', JSON.stringify(profile));

  return true;
}

function logoutUser() {
  // Clear current user session
  localStorage.removeItem('lawuTennisCurrentUser');
  localStorage.removeItem('lawuTennisProfile');
}

function requireAdmin() {
  // Ensure current user is an admin; redirect to home if not
  const currentUser = requireLogin();
  if (!currentUser) return false;
  const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
  const profile = profiles[currentUser];
  if (!profile || !profile.isAdmin) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function resetPassword(username, newPassword) {
  // Reset password for a given username
  const users = JSON.parse(localStorage.getItem('lawuTennisUsers')) || [];
  const idx = users.findIndex(u => u.username === username);
  if (idx !== -1) {
    users[idx].password = newPassword;
    localStorage.setItem('lawuTennisUsers', JSON.stringify(users));
    return true;
  }
  return false;
}

// Seed a default admin account if it does not exist
(function seedAdminAccount() {
  const adminUsername = 'dhuha';
  const adminPassword = 'dhuha';
  let users = JSON.parse(localStorage.getItem('lawuTennisUsers')) || [];
  let profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};

  // Add admin credentials if missing
  if (!users.some(u => u.username === adminUsername)) {
    users.push({ username: adminUsername, password: adminPassword });
    localStorage.setItem('lawuTennisUsers', JSON.stringify(users));
  }
  // Add admin profile if missing
  if (!profiles[adminUsername]) {
    profiles[adminUsername] = {
      username: adminUsername,
      fullName: 'Admin',
      phone: '',
      instagram: '',
      birthDate: '',
      gender: '',
      notes: '',
      isAdmin: true
    };
    localStorage.setItem('lawuTennisProfiles', JSON.stringify(profiles));
  }
})();
