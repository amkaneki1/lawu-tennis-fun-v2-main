// transactions.js
// Handles display of user transactions and tab switching between Pending and Completed.
// Updated to use username instead of email to identify users and to ensure admin can view all transactions.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const pendingTab = document.getElementById('pendingTab');
  const completedTab = document.getElementById('completedTab');
  const listEl = document.getElementById('transactionList');
  let currentTab = 'Pending';

  function renderTransactions() {
    listEl.innerHTML = '';
    const transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
    // Filter by status and by user
    // Determine if current user is admin
    const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
    const profile = profiles[currentUser] || {};
    const isAdmin = !!profile.isAdmin;
    const filtered = transactions.filter(tx => {
      // For non-admin users only show their own transactions. Skip any transactions
      // that do not belong to them or do not specify a username.
      if (!isAdmin) {
        return tx.username === currentUser && (
          (currentTab === 'Pending' && tx.status === 'Pending Payment') ||
          (currentTab === 'Completed' && tx.status !== 'Pending Payment')
        );
      }
      // For admins show all transactions based on status
      if (currentTab === 'Pending') return tx.status === 'Pending Payment';
      return tx.status !== 'Pending Payment';
    });
    if (filtered.length === 0) {
      const msg = document.createElement('p');
      msg.className = 'message';
      msg.textContent = 'Tidak ada transaksi pada kategori ini.';
      listEl.appendChild(msg);
      return;
    }
    filtered.forEach(tx => {
      const card = document.createElement('div');
      card.className = 'transaction-card';
      // Format price: if numeric, convert to currency string
      let priceDisplay = tx.price;
      if (typeof tx.price === 'number') {
        priceDisplay = 'Rp ' + tx.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      card.innerHTML = `
        <p><strong>ID:</strong> ${tx.id}</p>
        <p><strong>Date:</strong> ${tx.date}</p>
        <p><strong>User:</strong> ${tx.username || '-'}</p>
        <p><strong>Item:</strong> ${tx.item}</p>
        <p><strong>Status:</strong> ${tx.status}</p>
        <p><strong>Price:</strong> ${priceDisplay}</p>
      `;
      if (isAdmin) {
        // Admin actions: approve/reject on pending or delete on completed
        if (tx.status === 'Pending Payment') {
          const acceptBtn = document.createElement('button');
          acceptBtn.className = 'btn';
          acceptBtn.style.marginRight = '8px';
          acceptBtn.textContent = 'Tandai Lunas';
          acceptBtn.addEventListener('click', () => {
            markTransactionPaid(tx.id);
          });
          const rejectBtn = document.createElement('button');
          rejectBtn.className = 'btn';
          rejectBtn.style.backgroundColor = 'var(--danger-color)';
          rejectBtn.style.color = '#ffffff';
          rejectBtn.textContent = 'Tolak';
          rejectBtn.style.marginRight = '8px';
          rejectBtn.addEventListener('click', () => {
            deleteTransaction(tx.id);
          });
          card.appendChild(acceptBtn);
          card.appendChild(rejectBtn);
        } else {
          // Completed or other transactions: show detail and delete buttons
          const detailLink = document.createElement('a');
          detailLink.href = 'transaction_detail.html?id=' + encodeURIComponent(tx.id);
          detailLink.className = 'btn';
          detailLink.style.marginRight = '8px';
          detailLink.textContent = 'Detail';
          card.appendChild(detailLink);
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn';
          deleteBtn.style.backgroundColor = 'var(--danger-color)';
          deleteBtn.style.color = '#ffffff';
          deleteBtn.textContent = 'Hapus';
          deleteBtn.addEventListener('click', () => {
            deleteTransaction(tx.id);
          });
          card.appendChild(deleteBtn);
        }
      } else {
        // Non-admin: always show detail link
        const detailLink = document.createElement('a');
        detailLink.href = 'transaction_detail.html?id=' + encodeURIComponent(tx.id);
        detailLink.className = 'btn';
        detailLink.textContent = 'Detail';
        card.appendChild(detailLink);
      }
      listEl.appendChild(card);
    });
  }

  pendingTab.addEventListener('click', () => {
    currentTab = 'Pending';
    pendingTab.classList.add('active');
    completedTab.classList.remove('active');
    renderTransactions();
  });
  completedTab.addEventListener('click', () => {
    currentTab = 'Completed';
    completedTab.classList.add('active');
    pendingTab.classList.remove('active');
    renderTransactions();
  });
  // Initial render
  renderTransactions();
});

// Helper function to mark a transaction as paid/completed
function markTransactionPaid(id) {
  let transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
  const idx = transactions.findIndex(tx => tx.id === id);
  if (idx !== -1) {
    transactions[idx].status = 'Paid';
    localStorage.setItem('lawuTennisTransactions', JSON.stringify(transactions));
    // Refresh view by triggering pending tab click
    document.getElementById('pendingTab').click();
  }
}

// Helper function to delete a transaction (admin)
function deleteTransaction(id) {
  if (!confirm('Hapus transaksi ini? Ini akan menghapus booking atau paket terkait.')) return;
  let transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
  const txIndex = transactions.findIndex(tx => tx.id === id);
  if (txIndex === -1) return;
  const tx = transactions[txIndex];
  // Remove associated booking/package
  if (tx.type === 'class') {
    let bookings = JSON.parse(localStorage.getItem('lawuTennisBookings')) || [];
    bookings = bookings.filter(b => !(b.title === tx.item && b.username === tx.username));
    localStorage.setItem('lawuTennisBookings', JSON.stringify(bookings));
  } else if (tx.type === 'package') {
    let purchased = JSON.parse(localStorage.getItem('lawuTennisPurchasedPackages')) || [];
    purchased = purchased.filter(p => !(p.name === tx.item && p.username === tx.username));
    localStorage.setItem('lawuTennisPurchasedPackages', JSON.stringify(purchased));
  }
  transactions.splice(txIndex, 1);
  localStorage.setItem('lawuTennisTransactions', JSON.stringify(transactions));
  // Refresh view
  document.getElementById('pendingTab').click();
}