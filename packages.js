// packages.js
// Handles purchasing of membership packages. Packages are stored in localStorage under
// 'lawuTennisPurchasedPackages'. Updated to use username instead of email for identifying users.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const container = document.getElementById('packagesContainer');
  if (!container) return;
  // Load package definitions
  let packageList = JSON.parse(localStorage.getItem('lawuTennisPackages')) || [];
  if (packageList.length === 0) {
    // Seed packages if none exist (shared with admin seed)
    packageList = [
      { id: 'pkg-' + Date.now(), name: 'Single Session', price: 100000, expiry: 'Valid for 1 session', description: 'One practice session whenever you need a quick workout.', type: 'Public' },
      { id: 'pkg-' + (Date.now() + 1), name: 'Weekly Plan', price: 250000, expiry: 'Valid for 1 week (up to 3 sessions)', description: 'Up to 3 practice sessions per week to keep you fit and sharp.', type: 'Public' },
      { id: 'pkg-' + (Date.now() + 2), name: 'Monthly Membership', price: 900000, expiry: 'Valid for 1 month (unlimited sessions)', description: 'Unlimited sessions for a month—perfect for serious players.', type: 'Public' }
    ];
    localStorage.setItem('lawuTennisPackages', JSON.stringify(packageList));
  }
  // Get purchased packages for current user
  const purchased = JSON.parse(localStorage.getItem('lawuTennisPurchasedPackages')) || [];
  const purchasedNames = purchased
    .filter(p => !p.username || p.username === currentUser)
    .map(p => p.name);
  // Generate cards
  container.innerHTML = '';
  packageList.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'card-item';
    const priceText = 'Rp ' + pkg.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    card.innerHTML = `
      <h3>${pkg.name}</h3>
      <p>${pkg.description}</p>
      <p><strong>Price:</strong> ${priceText}</p>
      <p><strong>Expiry:</strong> ${pkg.expiry}</p>
    `;
    const btn = document.createElement('a');
    btn.className = 'btn package-link';
    btn.href = 'package_detail.html?name=' + encodeURIComponent(pkg.name);
    btn.dataset.name = pkg.name;
    if (purchasedNames.includes(pkg.name)) {
      btn.textContent = 'Purchased';
      btn.classList.add('disabled');
      btn.style.pointerEvents = 'none';
    } else {
      btn.textContent = 'Buy';
    }
    card.appendChild(btn);
    container.appendChild(card);
  });
});