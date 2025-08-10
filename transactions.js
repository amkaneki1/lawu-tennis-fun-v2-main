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

  // Apply navigation and page heading translations
  try {
    if (typeof applyNavTranslations === 'function') {
      applyNavTranslations();
    }
    const headingEl = document.getElementById('transactionsTitle');
    if (headingEl && typeof getTranslation === 'function') {
      headingEl.textContent = getTranslation('headings','transactions', headingEl.textContent);
    }
  } catch (e) {}

  function renderTransactions() {
    listEl.innerHTML = '';
    const transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
    // Filter by status and by user
    // Determine if current user is admin
    const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
    const profile = profiles[currentUser] || {};
    const isAdmin = !!profile.isAdmin;
    // Define which statuses are considered pending or completed
    const pendingStatuses = ['Pending Payment', 'Proof Submitted'];
    const completedStatuses = ['Paid', 'Rejected'];
    const filtered = transactions.filter(tx => {
      if (!isAdmin) {
        // Non-admin: only show transactions belonging to the current user
        if (tx.username !== currentUser) return false;
        if (currentTab === 'Pending') return pendingStatuses.includes(tx.status);
        return completedStatuses.includes(tx.status);
      }
      // Admin: show all by status
      if (currentTab === 'Pending') return pendingStatuses.includes(tx.status);
      return completedStatuses.includes(tx.status);
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
        // Admin actions based on transaction status
        if (pendingStatuses.includes(tx.status)) {
          // Show approve and reject buttons
          const acceptBtn = document.createElement('button');
          acceptBtn.className = 'btn';
          acceptBtn.style.marginRight = '8px';
          acceptBtn.textContent = (typeof getTranslation === 'function' ? getTranslation('buttons','approve','Approve') : 'Approve');
          acceptBtn.addEventListener('click', () => {
            markTransactionPaid(tx.id);
          });
          const rejectBtn = document.createElement('button');
          rejectBtn.className = 'btn';
          rejectBtn.style.backgroundColor = 'var(--danger-color)';
          rejectBtn.style.color = '#ffffff';
          rejectBtn.style.marginRight = '8px';
          rejectBtn.textContent = (typeof getTranslation === 'function' ? getTranslation('buttons','reject','Reject') : 'Reject');
          rejectBtn.addEventListener('click', () => {
            markTransactionRejected(tx.id);
          });
          card.appendChild(acceptBtn);
          card.appendChild(rejectBtn);
          // If there is a proof file, allow admin to view it
          if (tx.proofFileData) {
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn';
            viewBtn.style.marginRight = '8px';
            viewBtn.textContent = (typeof getTranslation === 'function' ? getTranslation('buttons','viewProof','View Proof') : 'View Proof');
            viewBtn.addEventListener('click', () => {
              viewProof(tx);
            });
            card.appendChild(viewBtn);
          }
        } else {
          // Completed or rejected transactions
          const detailLink = document.createElement('a');
          detailLink.href = 'transaction_detail.html?id=' + encodeURIComponent(tx.id);
          detailLink.className = 'btn';
          detailLink.style.marginRight = '8px';
          detailLink.textContent = (typeof getTranslation === 'function' ? getTranslation('buttons','detail','Detail') : 'Detail');
          card.appendChild(detailLink);
          if (tx.proofFileData) {
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn';
            viewBtn.style.marginRight = '8px';
            viewBtn.textContent = (typeof getTranslation === 'function' ? getTranslation('buttons','viewProof','View Proof') : 'View Proof');
            viewBtn.addEventListener('click', () => {
              viewProof(tx);
            });
            card.appendChild(viewBtn);
          }
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
        detailLink.textContent = (typeof getTranslation === 'function' ? getTranslation('buttons','detail','Detail') : 'Detail');
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

// Helper function to mark a transaction as rejected
function markTransactionRejected(id) {
  let transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
  const idx = transactions.findIndex(tx => tx.id === id);
  if (idx !== -1) {
    transactions[idx].status = 'Rejected';
    localStorage.setItem('lawuTennisTransactions', JSON.stringify(transactions));
    document.getElementById('pendingTab').click();
  }
}

// Helper to view proof data in a new window
function viewProof(tx) {
  if (!tx.proofFileData) return;
  const newWin = window.open('', '_blank');
  newWin.document.write('<title>Payment Proof</title>');
  if (tx.proofFileData.startsWith('data:image')) {
    newWin.document.write('<img src="' + tx.proofFileData + '" style="max-width:100%; height:auto;">');
  } else {
    newWin.document.write('<object data="' + tx.proofFileData + '" type="application/pdf" width="100%" height="600px"></object>');
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
