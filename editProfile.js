// editProfile.js
// Loads existing profile data into the form and saves updates to localStorage.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const form = document.getElementById('profileForm');
  if (!form) return;
  // Load existing profile from lawuTennisProfiles for current user
  const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
  const profileData = profiles[currentUser] || JSON.parse(localStorage.getItem('lawuTennisProfile')) || {};
  // Populate fields
  document.getElementById('fullName').value = profileData.fullName || '';
  document.getElementById('email').value = currentUser;
  document.getElementById('phone').value = profileData.phone || '';
  document.getElementById('instagram').value = profileData.instagram || '';
  if (profileData.birthDate) {
    document.getElementById('birthDate').value = profileData.birthDate;
  }
  // Gender field removed: no need to populate
  document.getElementById('notes').value = profileData.notes || '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    const updated = {
      fullName: document.getElementById('fullName').value,
      email: currentUser,
      phone: document.getElementById('phone').value,
      instagram: document.getElementById('instagram').value,
      birthDate: document.getElementById('birthDate').value,
      // Gender removed
      notes: document.getElementById('notes').value
    };
    // Save to global profiles
    const allProfiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
    allProfiles[currentUser] = updated;
    localStorage.setItem('lawuTennisProfiles', JSON.stringify(allProfiles));
    // Also save as current profile
    localStorage.setItem('lawuTennisProfile', JSON.stringify(updated));
    alert('Profile updated successfully!');
    window.location.href = 'profile.html';
  });
});