// profile.js
// Loads user information and handles logout on the profile page. Updated to show phone/username.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const profileData = JSON.parse(localStorage.getItem('lawuTennisProfile')) || {};
  const nameEl = document.getElementById('profileName');
  const subEl = document.getElementById('profileEmail');
  // Display full name or username
  nameEl.textContent = profileData.fullName || currentUser;
  // Show phone number or username as sub info
  if (profileData.phone) {
    subEl.textContent = profileData.phone;
  } else {
    subEl.textContent = currentUser;
  }
  // Set avatar letter from name
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) {
    const displayName = profileData.fullName || currentUser;
    avatarEl.textContent = displayName.charAt(0).toUpperCase();
  }
  // Show admin dashboard link if this user is an admin
  if (profileData.isAdmin) {
    const adminLinkItem = document.getElementById('adminPanelLink');
    if (adminLinkItem) {
      // Show as block in profile menu
      adminLinkItem.style.display = 'flex';
    }
  }
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
      alert('You have been logged out.');
      window.location.href = 'login.html';
    });
  }
});