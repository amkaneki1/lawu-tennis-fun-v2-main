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
  // Apply language settings to navigation and heading if functions are available
  try {
    if (typeof applyNavTranslations === 'function') {
      applyNavTranslations();
    }
    const titleEl = document.getElementById('transactionDetailTitle');
    if (titleEl && typeof getTranslation === 'function') {
      titleEl.textContent = getTranslation('headings', 'transactionDetail', titleEl.textContent);
    }
  } catch (e) {}
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
  // Prepare translated labels and dynamic payment information
  const payerLabel = (typeof getTranslation === 'function' ? getTranslation('labels', 'payerName', 'Name:') : 'Name:');
  const paymentMethodTitle = (typeof getTranslation === 'function' ? getTranslation('labels', 'paymentMethod', 'Payment Method') : 'Payment Method');
  const bankInfo = (() => {
    try {
      const info = JSON.parse(localStorage.getItem('lawuTennisBankInfo')) || {};
      const bankName = info.bankName || 'Mandiri';
      const accountHolder = info.accountHolder || 'Lawu Tennis Fun';
      const accountNumber = info.accountNumber || '1234567890';
      const accountNumberLabel = (typeof getTranslation === 'function' ? getTranslation('labels', 'accountNumber', 'Account Number') : 'Account Number');
      return `<p>${bankName} a/n ${accountHolder}</p><p>${accountNumberLabel}: ${accountNumber}</p>`;
    } catch (e) {
      return '<p>Bank Transfer (Mandiri) a/n Lawu Tennis Fun</p><p>Account Number: 1234567890</p>';
    }
  })();
  const payerInfo = tx.payerName ? `<p><strong>${payerLabel}</strong> ${tx.payerName}</p>` : '';
  const proofFileInfo = tx.proofFileName ? `<p><strong>Proof File:</strong> ${tx.proofFileName}</p>` : '';
  html.innerHTML = `
    <p><strong>Name:</strong> ${userName}</p>
    <p><strong>Invoice ID:</strong> ${tx.id}</p>
    <p><strong>Date:</strong> ${tx.date}</p>
    <p><strong>Item:</strong> ${tx.item}</p>
    <p><strong>Price:</strong> ${priceDetail}</p>
    <p><strong>Status:</strong> ${tx.status}</p>
    <p><strong>Payment Due:</strong> ${new Date(tx.due).toLocaleString()}</p>
    <p><strong>Time Remaining:</strong> ${countdownStr}</p>
    ${payerInfo}
    ${proofFileInfo}
    <h3>${paymentMethodTitle}</h3>
    ${bankInfo}
  `;
  // Append the detail card to the page (without upload fields)
  detailEl.appendChild(html);
  // Payment proof form
  const paymentSection = document.getElementById('paymentSection');
  // Only show the upload form if the transaction is still pending or proof submitted and user is not admin
  if ((tx.status === 'Pending Payment' || tx.status === 'Proof Submitted') && !isAdmin) {
    const form = document.createElement('div');
    form.className = 'payment-form';
    const nameLabel = document.createElement('label');
    // Use translation for payer name label if available
    if (typeof getTranslation === 'function') {
      nameLabel.textContent = getTranslation('labels', 'payerName', 'Name:');
    } else {
      nameLabel.textContent = 'Name:';
    }
    nameLabel.htmlFor = 'payerName';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'payerName';
    nameInput.placeholder = 'Your full name';
    const fileLabel = document.createElement('label');
    if (typeof getTranslation === 'function') {
      fileLabel.textContent = getTranslation('labels', 'paymentProof', 'Payment Proof:');
    } else {
      fileLabel.textContent = 'Payment Proof:';
    }
    fileLabel.htmlFor = 'paymentFile';
    const fileInputField = document.createElement('input');
    fileInputField.type = 'file';
    fileInputField.id = 'paymentFile';
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn';
    // Set button text based on language if available
    if (typeof getTranslation === 'function') {
      submitBtn.textContent = getTranslation('buttons', 'submitPayment', 'Submit Payment');
    } else {
      submitBtn.textContent = 'Submit Payment';
    }
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
      // Read file as DataURL and update transaction status and proof information
      const file = fileInputField.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const dataUrl = e.target.result;
        const updatedTransactions = transactions.map(item => {
          if (item.id === tx.id) {
            return {
              ...item,
              status: 'Proof Submitted',
              payerName: nameInput.value,
              proofFileName: file.name,
              proofFileData: dataUrl
            };
          }
          return item;
        });
        localStorage.setItem('lawuTennisTransactions', JSON.stringify(updatedTransactions));
        alert('Thank you! Your payment proof has been submitted.');
        window.location.href = 'transactions.html';
      };
      reader.readAsDataURL(file);
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
