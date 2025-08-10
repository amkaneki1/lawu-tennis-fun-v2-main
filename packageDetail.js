// packageDetail.js
// Displays the details of a selected package and handles checkout/purchase.
// Updated to use username instead of email when storing purchase and transaction data.

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const nameParam = decodeURIComponent(getQueryParam('name') || '');
  const titleEl = document.getElementById('packageTitle');
  const contentEl = document.getElementById('packageContent');
  const checkoutSection = document.getElementById('checkoutSection');
  const messageSection = document.getElementById('messageSection');
  const messageEl = document.getElementById('purchaseMessage');
  const checkoutBtn = document.getElementById('checkoutBtn');
  // Load package list from localStorage. If none, seed with default packages
  let packages = JSON.parse(localStorage.getItem('lawuTennisPackages')) || [];
  if (packages.length === 0) {
    packages = [
      { id: 'pkg-' + Date.now(), name: 'Single Session', price: 100000, expiry: 'Valid for 1 session', description: 'One practice session whenever you need a quick workout.', type: 'Public' },
      { id: 'pkg-' + (Date.now() + 1), name: 'Weekly Plan', price: 250000, expiry: 'Valid for 1 week (up to 3 sessions)', description: 'Up to 3 practice sessions per week to keep you fit and sharp.', type: 'Public' },
      { id: 'pkg-' + (Date.now() + 2), name: 'Monthly Membership', price: 900000, expiry: 'Valid for 1 month (unlimited sessions)', description: 'Unlimited sessions for a month—perfect for serious players.', type: 'Public' }
    ];
    localStorage.setItem('lawuTennisPackages', JSON.stringify(packages));
  }
  // Find the package by name
  const pkg = packages.find(p => p.name === nameParam);
  if (!pkg) {
    titleEl.textContent = 'Package Not Found';
    contentEl.innerHTML = '<p>The requested package could not be found.</p>';
    checkoutSection.style.display = 'none';
    return;
  }
  // Display package details
  titleEl.textContent = pkg.name;
  const priceText = 'Rp ' + pkg.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  contentEl.innerHTML = `
    <h2>${pkg.name}</h2>
    <p><strong>Price:</strong> ${priceText}</p>
    <p><strong>Expiry:</strong> ${pkg.expiry}</p>
    <p>${pkg.description}</p>
  `;
  // Check if already purchased by current user
  const purchased = JSON.parse(localStorage.getItem('lawuTennisPurchasedPackages')) || [];
  const alreadyPurchased = purchased.some(p => p.name === pkg.name && (!p.username || p.username === currentUser));
  if (alreadyPurchased) {
    messageEl.textContent = 'You have already purchased this package.';
    messageSection.style.display = 'block';
    checkoutSection.style.display = 'none';
  } else {
    checkoutSection.style.display = 'block';
    messageSection.style.display = 'none';
    // Coupon handling: allow entering a promo code and apply discount
    let discountedPrice = pkg.price;
    let appliedCoupon = null;
    const promoContainer = document.createElement('div');
    promoContainer.className = 'promo-container';
    const promoLabel = document.createElement('label');
    promoLabel.textContent = 'Promo Code:';
    promoLabel.setAttribute('for', 'pkgPromoCode');
    const promoInput = document.createElement('input');
    promoInput.type = 'text';
    promoInput.id = 'pkgPromoCode';
    promoInput.placeholder = 'Enter code';
    const promoCheckBtn = document.createElement('button');
    promoCheckBtn.className = 'btn';
    promoCheckBtn.textContent = 'Check';
    promoCheckBtn.style.marginLeft = '8px';
    promoCheckBtn.addEventListener('click', () => {
      const code = promoInput.value.trim();
      if (!code) {
        alert('Please enter a promo code.');
        return;
      }
      const coupons = JSON.parse(localStorage.getItem('lawuTennisCoupons')) || [];
      const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.quantity > 0);
      if (!coupon) {
        alert('Invalid or exhausted coupon.');
        return;
      }
      // Apply discount to package price
      discountedPrice = pkg.price - (pkg.price * coupon.discount / 100);
      appliedCoupon = coupon.code;
      alert('Coupon applied! New price: Rp ' + numberWithCommas(discountedPrice));
    });
    promoContainer.appendChild(promoLabel);
    promoContainer.appendChild(promoInput);
    promoContainer.appendChild(promoCheckBtn);
    checkoutSection.insertBefore(promoContainer, checkoutBtn);
    checkoutBtn.addEventListener('click', () => {
      // Add package to purchased list for user
      const current = JSON.parse(localStorage.getItem('lawuTennisPurchasedPackages')) || [];
      current.push({ name: pkg.name, expiry: pkg.expiry, username: currentUser });
      localStorage.setItem('lawuTennisPurchasedPackages', JSON.stringify(current));
      // Create transaction object for payment with due date in 24 hours
      const transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
      const transactionId = 'TX' + Date.now();
      const now = new Date();
      const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const priceToUse = discountedPrice !== undefined && discountedPrice !== null ? discountedPrice : pkg.price;
      transactions.push({
        id: transactionId,
        date: now.toISOString().slice(0, 10),
        item: pkg.name,
        price: priceToUse,
        status: 'Pending Payment',
        due: dueDate.toISOString(),
        type: 'package',
        username: currentUser,
        coupon: appliedCoupon
      });
      // If coupon applied, decrement quantity
      if (appliedCoupon) {
        const coupons = JSON.parse(localStorage.getItem('lawuTennisCoupons')) || [];
        const idx = coupons.findIndex(c => c.code.toLowerCase() === appliedCoupon.toLowerCase());
        if (idx !== -1 && coupons[idx].quantity > 0) {
          coupons[idx].quantity -= 1;
          localStorage.setItem('lawuTennisCoupons', JSON.stringify(coupons));
        }
      }
      localStorage.setItem('lawuTennisTransactions', JSON.stringify(transactions));
      // Redirect to transaction detail page for payment proof upload
      window.location.href = 'transaction_detail.html?id=' + encodeURIComponent(transactionId);
    });
  }
});

// Helper to format numbers with thousand separators
function numberWithCommas(x) {
  if (x === null || x === undefined) return '';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}