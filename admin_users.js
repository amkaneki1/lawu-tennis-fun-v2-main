// admin_users.js
// Handles user listing for the admin panel. Updated to work with usernames instead of emails.

document.addEventListener('DOMContentLoaded', () => {
  // Ensure only admin can access this page
  const adminUser = requireAdmin();
  if (!adminUser) return;
  const tbody = document.getElementById('usersBody');
  const addBtn = document.getElementById('addUserBtn');
  const formContainer = document.getElementById('addUserFormContainer');
  const addForm = document.getElementById('addUserForm');

  // Apply language for labels based on saved preference
  (function applyLanguage() {
    const lang = localStorage.getItem('lawuTennisLang') || 'id';
    const headerTitle = document.querySelector('.user-management-header h1');
    const backLink = document.querySelector('.user-management-header .back-link');
    if (lang === 'id') {
      if (headerTitle) headerTitle.textContent = 'Manajemen Pengguna';
      if (backLink) backLink.textContent = '← Kembali';
      if (addBtn) addBtn.textContent = 'Tambah Pengguna';
      // Update table headers to Indonesian
      const ths = document.querySelectorAll('#usersTable thead th');
      if (ths.length >= 5) {
        ths[0].textContent = 'Nama';
        ths[1].textContent = 'Username';
        ths[2].textContent = 'WhatsApp';
        ths[3].textContent = 'Peran';
        ths[4].textContent = 'Aksi';
      }
    } else {
      // English labels (already set in HTML)
      if (headerTitle) headerTitle.textContent = 'User Management';
      if (backLink) backLink.textContent = '← Back';
      if (addBtn) addBtn.textContent = 'Add User';
      const ths = document.querySelectorAll('#usersTable thead th');
      if (ths.length >= 5) {
        ths[0].textContent = 'Name';
        ths[1].textContent = 'Username';
        ths[2].textContent = 'WhatsApp';
        ths[3].textContent = 'Role';
        ths[4].textContent = 'Actions';
      }
    }
  })();

  /**
   * Renders the list of registered users into the table body. Reads from
   * localStorage each time so that newly added users appear immediately.
   */
  function renderUsers() {
    const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
    tbody.innerHTML = '';
    Object.keys(profiles).forEach(username => {
      const prof = profiles[username];
      const tr = document.createElement('tr');
      // Name, username, phone, role columns
      const nameTd = document.createElement('td');
      nameTd.textContent = prof.fullName || '';
      const userTd = document.createElement('td');
      userTd.textContent = username;
      const phoneTd = document.createElement('td');
      phoneTd.textContent = prof.phone || '';
      const roleTd = document.createElement('td');
      roleTd.textContent = prof.isAdmin ? 'Admin' : 'User';
      const actionsTd = document.createElement('td');
      // Edit icon
      const editSpan = document.createElement('span');
      editSpan.className = 'action-icon edit-icon';
      editSpan.innerHTML = '✏️';
      editSpan.style.cursor = 'pointer';
      editSpan.addEventListener('click', () => {
        editUser(username);
      });
      // Delete icon (hide for admin accounts)
      const deleteSpan = document.createElement('span');
      deleteSpan.className = 'action-icon delete-icon';
      deleteSpan.innerHTML = '🗑️';
      deleteSpan.style.cursor = 'pointer';
      if (prof.isAdmin) {
        deleteSpan.style.display = 'none';
      } else {
        deleteSpan.addEventListener('click', () => {
          deleteUser(username);
        });
      }
      actionsTd.appendChild(editSpan);
      actionsTd.appendChild(deleteSpan);
      tr.appendChild(nameTd);
      tr.appendChild(userTd);
      tr.appendChild(phoneTd);
      tr.appendChild(roleTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  renderUsers();

  // Toggle the visibility of the add user form when the button is clicked
  addBtn?.addEventListener('click', () => {
    if (!formContainer) return;
    const visible = formContainer.style.display !== 'none';
    formContainer.style.display = visible ? 'none' : 'block';
  });

  // Handle submission of the add user form
  addForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fullName = document.getElementById('newUserFullName').value.trim();
    const username = document.getElementById('newUserUsername').value.trim().toLowerCase();
    const phone = document.getElementById('newUserPhone').value.trim();
    const password = document.getElementById('newUserPassword').value;
    if (!fullName || !username || !password) {
      alert('Nama lengkap, username, dan password wajib diisi.');
      return;
    }
    // Attempt to register the new user. Ensure isAdmin false so the user becomes a standard customer.
    // Attempt to register the new user. registerUser returns true on
    // success and false if the username already exists. It will show its own
    // alert on failure, so just exit early in that case.
    const success = registerUser(username, password, {
      fullName: fullName,
      phone: phone,
      isAdmin: false
    });
    if (!success) {
      return;
    }
    // Clear form and hide it
    addForm.reset();
    formContainer.style.display = 'none';
    // Refresh the user list
    renderUsers();
    alert('Pengguna baru berhasil ditambahkan.');
  });

  /**
   * Edit an existing user's details. Opens a prompt for full name and phone, then
   * updates the profile in localStorage.
   * @param {string} username
   */
  function editUser(username) {
    const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
    const prof = profiles[username];
    if (!prof) return;
    const newName = prompt('Edit full name:', prof.fullName || '');
    if (newName === null) return;
    const newPhone = prompt('Edit WhatsApp number:', prof.phone || '');
    if (newPhone === null) return;
    prof.fullName = newName.trim();
    prof.phone = newPhone.trim();
    profiles[username] = prof;
    localStorage.setItem('lawuTennisProfiles', JSON.stringify(profiles));
    renderUsers();
    alert('User updated successfully.');
  }

  /**
   * Delete an existing user after confirmation. Removes credentials, profile and
   * associated bookings, purchases and transactions.
   * @param {string} username
   */
  function deleteUser(username) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    // Remove from users array
    let users = JSON.parse(localStorage.getItem('lawuTennisUsers')) || [];
    users = users.filter(u => u.username !== username);
    localStorage.setItem('lawuTennisUsers', JSON.stringify(users));
    // Remove profile
    const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
    delete profiles[username];
    localStorage.setItem('lawuTennisProfiles', JSON.stringify(profiles));
    // Remove user bookings
    let bookings = JSON.parse(localStorage.getItem('lawuTennisBookings')) || [];
    bookings = bookings.filter(b => b.username !== username);
    localStorage.setItem('lawuTennisBookings', JSON.stringify(bookings));
    // Remove user purchased packages
    let purchased = JSON.parse(localStorage.getItem('lawuTennisPurchasedPackages')) || [];
    purchased = purchased.filter(p => p.username !== username);
    localStorage.setItem('lawuTennisPurchasedPackages', JSON.stringify(purchased));
    // Remove user transactions
    let transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
    transactions = transactions.filter(t => t.username !== username);
    localStorage.setItem('lawuTennisTransactions', JSON.stringify(transactions));
    // Refresh list
    renderUsers();
    alert('User deleted successfully.');
  }
});