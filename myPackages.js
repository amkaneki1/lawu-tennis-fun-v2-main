// myPackages.js
// Populate list of purchased packages on the My Packages page.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const listEl = document.getElementById('packagesList');
  if (!listEl) return;
  const packagesData = JSON.parse(localStorage.getItem('lawuTennisPurchasedPackages')) || [];
  // Filter packages for current user
 const userPackages = packagesData.filter(pkg => pkg.userEmail === currentUser);
  if (userPackages.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'message';
    msg.textContent = 'You have not purchased any packages yet.';
    listEl.appendChild(msg);
    return;
  }
  userPackages.forEach(pkg => {
    const li = document.createElement('li');
    li.className = 'booking-item';
    const expiryText = pkg.expiry ? ` (valid for ${pkg.expiry})` : '';
    li.textContent = `${pkg.name}${expiryText}`;
    listEl.appendChild(li);
  });
});
