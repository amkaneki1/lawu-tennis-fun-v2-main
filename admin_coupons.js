// admin_coupons.js
// Handles creation and deletion of coupon codes for packages and classes.

document.addEventListener('DOMContentLoaded', () => {
  // Ensure admin user
  if (!requireAdmin()) return;
  const tableBody = document.getElementById('couponsBody');
  const addBtn = document.getElementById('addCouponBtn');
  const formContainer = document.getElementById('addCouponFormContainer');
  const addForm = document.getElementById('addCouponForm');

  // Apply language translation for coupon page
  (function applyLanguage() {
    const lang = localStorage.getItem('lawuTennisLang') || 'id';
    const titleEl = document.getElementById('couponTitle');
    const backLink = document.getElementById('couponBack');
    if (lang === 'id') {
      if (titleEl) titleEl.textContent = 'Manajemen Kupon';
      if (backLink) backLink.textContent = '← Kembali';
      addBtn.textContent = 'Tambah Kupon';
      // Update table headers
      const ths = document.querySelectorAll('#couponsTable thead th');
      if (ths.length >= 4) {
        ths[0].textContent = 'Kode';
        ths[1].textContent = 'Diskon';
        ths[2].textContent = 'Sisa';
        ths[3].textContent = 'Aksi';
      }
    } else {
      if (titleEl) titleEl.textContent = 'Coupon Management';
      if (backLink) backLink.textContent = '← Back';
      addBtn.textContent = 'Add Coupon';
      const ths = document.querySelectorAll('#couponsTable thead th');
      if (ths.length >= 4) {
        ths[0].textContent = 'Code';
        ths[1].textContent = 'Discount';
        ths[2].textContent = 'Remaining';
        ths[3].textContent = 'Actions';
      }
    }
  })();

  /**
   * Render the current list of coupons from localStorage into the table.
   */
  function renderCoupons() {
    const coupons = JSON.parse(localStorage.getItem('lawuTennisCoupons')) || [];
    tableBody.innerHTML = '';
    coupons.forEach((c, idx) => {
      const tr = document.createElement('tr');
      const codeTd = document.createElement('td');
      codeTd.textContent = c.code;
      const discountTd = document.createElement('td');
      discountTd.textContent = c.discount + '%';
      const qtyTd = document.createElement('td');
      qtyTd.textContent = c.quantity;
      const actionsTd = document.createElement('td');
      const delSpan = document.createElement('span');
      delSpan.className = 'action-icon delete-icon';
      delSpan.innerHTML = '🗑️';
      delSpan.style.cursor = 'pointer';
      delSpan.addEventListener('click', () => {
        if (!confirm('Delete this coupon?')) return;
        const updated = coupons.filter((_, i) => i !== idx);
        localStorage.setItem('lawuTennisCoupons', JSON.stringify(updated));
        renderCoupons();
        alert('Coupon deleted successfully.');
      });
      actionsTd.appendChild(delSpan);
      tr.appendChild(codeTd);
      tr.appendChild(discountTd);
      tr.appendChild(qtyTd);
      tr.appendChild(actionsTd);
      tableBody.appendChild(tr);
    });
  }

  renderCoupons();

  // Toggle add coupon form
  addBtn.addEventListener('click', () => {
    const visible = formContainer.style.display !== 'none';
    formContainer.style.display = visible ? 'none' : 'block';
  });

  // Handle add coupon form submission
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('couponCode').value.trim();
    const discount = parseInt(document.getElementById('couponDiscount').value, 10);
    const qty = parseInt(document.getElementById('couponQty').value, 10);
    if (!code || isNaN(discount) || isNaN(qty) || qty <= 0) {
      alert('Please fill out all coupon fields correctly.');
      return;
    }
    const coupons = JSON.parse(localStorage.getItem('lawuTennisCoupons')) || [];
    // Check duplicate code
    if (coupons.some(c => c.code.toLowerCase() === code.toLowerCase())) {
      alert('Coupon code already exists.');
      return;
    }
    coupons.push({ code: code, discount: discount, quantity: qty });
    localStorage.setItem('lawuTennisCoupons', JSON.stringify(coupons));
    addForm.reset();
    formContainer.style.display = 'none';
    renderCoupons();
    alert('Coupon added successfully.');
  });
});