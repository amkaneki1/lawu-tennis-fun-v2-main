// transactionDetail.js
// Displays details of a single transaction including due date countdown and payment info.
// Updated to use username instead of email when verifying transaction ownership.

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const detailEl = document.getElementById('transactionDetail');
  const id = decodeURIComponent(getQueryParam('id') || '');
  const transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
  const tx = transactions.find(t => t.id === id);
  // Determine if current user is admin
  const profiles = JSON.parse(localStorage.getItem('lawuTennisProfiles')) || {};
  const profile = profiles[currentUser] || {};
  const isAdmin = !!profile.isAdmin;
  // For normal users ensure they can only access their own transaction
  if (!tx || (!isAdmin && tx.username && tx.username !== currentUser)) {
    detailEl.innerHTML = '<p class="message">Transaction not found.</p>';
    return;
  }
  // Build detail HTML
  const dueDate = new Date(tx.due);
  const now = new Date();
  const remainingMs = dueDate - now;
  let countdownStr = '';
  if (remainingMs > 0) {
    const hours = Math.floor(remainingMs / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    countdownStr = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    countdownStr = 'Expired';
  }
  const html = document.createElement('div');
  html.className = 'transaction-detail-card';
  // Retrieve user profile for displaying name
  // Look up the profile of the transaction owner
  const txUserProfile = profiles[tx.username] || {};
  const userName = txUserProfile.fullName || tx.username || 'Guest User';
  // Format price display: convert numeric to currency string
  let priceDetail = tx.price;
  if (typeof tx.price === 'number') {
    priceDetail = 'Rp ' + tx.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  html.innerHTML = `
    <p><strong>Name:</strong> ${userName}</p>
    <p><strong>Invoice ID:</strong> ${tx.id}</p>
    <p><strong>Date:</strong> ${tx.date}</p>
    <p><strong>Item:</strong> ${tx.item}</p>
    <p><strong>Price:</strong> ${priceDetail}</p>
    <p><strong>Status:</strong> ${tx.status}</p>
    <p><strong>Payment Due:</strong> ${new Date(tx.due).toLocaleString()}</p>
    <p><strong>Time Remaining:</strong> ${countdownStr}</p>
    ${tx.payerName ? `<p><strong>Payer Name:</strong> ${tx.payerName}</p>` : ''}
    ${tx.proofFile ? `<p><strong>Proof File:</strong> ${tx.proofFile}</p>` : ''}
    <h3>Payment Method</h3>
    <p>Bank Transfer (Mandiri) a/n Lawu Tennis Fun</p>
    <p>Account Number: 1234567890</p>
  `;
  // Append the detail card to the page (without upload fields)
  detailEl.appendChild(html);
  // Payment proof form
  const paymentSection = document.getElementById('paymentSection');
  // Only show the upload form if the transaction is still pending and user is not admin
  if (tx.status === 'Pending Payment' && !isAdmin) {
    const form = document.createElement('div');
    form.className = 'payment-form';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name:';
    nameLabel.htmlFor = 'payerName';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'payerName';
    nameInput.placeholder = 'Your full name';
    const fileLabel = document.createElement('label');
    fileLabel.textContent = 'Payment Proof:';
    fileLabel.htmlFor = 'paymentFile';
    const fileInputField = document.createElement('input');
    fileInputField.type = 'file';
    fileInputField.id = 'paymentFile';
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn';
    submitBtn.textContent = 'Submit Payment';
    submitBtn.addEventListener('click', () => {
      // Validation: require name and file selected
      if (!nameInput.value) {
        alert('Please enter your name.');
        return;
      }
      if (!fileInputField.files || fileInputField.files.length === 0) {
        alert('Please select a payment proof file.');
        return;
      }
      // Update transaction status to Paid and store payer info
      const updatedTransactions = transactions.map(item => {
        if (item.id === tx.id) {
          return { ...item, status: 'Paid', payerName: nameInput.value, proofFile: fileInputField.files[0].name };
        }
        return item;
      });
      localStorage.setItem('lawuTennisTransactions', JSON.stringify(updatedTransactions));
      alert('Thank you! Your payment proof has been submitted.');
      window.location.href = 'transactions.html';
    });
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(document.createElement('br'));
    form.appendChild(fileLabel);
    form.appendChild(fileInputField);
    form.appendChild(document.createElement('br'));
    form.appendChild(submitBtn);
    paymentSection.appendChild(form);
  }
});