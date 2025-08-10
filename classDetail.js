// classDetail.js
// Handles display of a single class and booking/waitlist actions. Updated to use username.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const classInfoEl = document.getElementById('classInfo');
  const classActionsEl = document.getElementById('classActions');
  const titleEl = document.getElementById('classTitle');
  // Retrieve the selected class from sessionStorage; this is set by schedule.js when the user
  // clicks a "Detail" or "Waiting List" button.
  const selectedClassStr = sessionStorage.getItem('selectedClass');
  if (!selectedClassStr) {
    classInfoEl.innerHTML = '<p class="message">No class information available.</p>';
    return;
  }
  const session = JSON.parse(selectedClassStr);
  // Set header title
  titleEl.textContent = session.title;
  // Build class information markup similar to floupilates detail page
  const infoList = document.createElement('div');
  infoList.className = 'detail-list';
  infoList.innerHTML = `
    <p><strong>Date:</strong> ${session.date}</p>
    <p><strong>Time:</strong> ${session.time}</p>
    <p><strong>Duration:</strong> ${session.duration} minutes</p>
    <p><strong>Location:</strong> ${session.location}</p>
    <p><strong>Instructor:</strong> ${session.coach}</p>
    <p><strong>Price:</strong> ${session.price !== null && session.price !== undefined ? 'Rp ' + numberWithCommas(session.price) : 'Free'}</p>
  `;
  classInfoEl.appendChild(infoList);
  // Determine booking status and full status from localStorage
  const bookings = JSON.parse(localStorage.getItem('lawuTennisBookings')) || [];
  const sessionBookings = bookings.filter(b => b.sessionId === session.id);
  const isBooked = sessionBookings.some(b => b.username === currentUser);
  const maxSlots = session.maxSlots;
  const isFull = maxSlots !== undefined && sessionBookings.length >= maxSlots;
  // Coupon code input and validation
  let discountedPrice = session.price;
  let appliedCoupon = null;
  const promoContainer = document.createElement('div');
  promoContainer.className = 'promo-container';
  const promoLabel = document.createElement('label');
  promoLabel.textContent = 'Promo Code:';
  promoLabel.setAttribute('for', 'promoCode');
  const promoInput = document.createElement('input');
  promoInput.type = 'text';
  promoInput.id = 'promoCode';
  promoInput.placeholder = 'Enter code';
  const promoCheckBtn = document.createElement('button');
  promoCheckBtn.className = 'btn';
  promoCheckBtn.textContent = 'Check';
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
    // Apply discount
    discountedPrice = session.price - (session.price * coupon.discount / 100);
    appliedCoupon = coupon.code;
    alert('Coupon applied! New price: Rp ' + numberWithCommas(discountedPrice));
  });
  promoContainer.appendChild(promoLabel);
  promoContainer.appendChild(promoInput);
  promoContainer.appendChild(promoCheckBtn);
  classActionsEl.appendChild(promoContainer);
  // Button to perform booking
  const actionBtn = document.createElement('button');
  actionBtn.className = 'btn';
  let actionText = '';
  if (isBooked) {
    actionBtn.disabled = true;
    actionText = 'Booked';
  } else if (isFull) {
    actionBtn.disabled = true;
    actionText = 'Full';
  } else {
    actionText = 'Checkout';
  }
  actionBtn.textContent = actionText;
  actionBtn.addEventListener('click', () => {
    // If not booked, perform booking and create transaction, then redirect
    if (!isBooked) {
      // Add booking for current user
      // Ensure bookings is an array (migrated from earlier object format)
      let bookingsArr = JSON.parse(localStorage.getItem('lawuTennisBookings')) || [];
      // Avoid duplicate booking
      if (!bookingsArr.some(b => b.sessionId === session.id && b.username === currentUser)) {
        bookingsArr.push({
          sessionId: session.id,
          date: session.date,
          time: session.time,
          title: session.title,
          username: currentUser
        });
        localStorage.setItem('lawuTennisBookings', JSON.stringify(bookingsArr));
      }
      // Create a transaction for this booking for current user
      const transactions = JSON.parse(localStorage.getItem('lawuTennisTransactions')) || [];
      const transactionId = 'TX' + Date.now();
      const now = new Date();
      const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      // Determine price with applied coupon
      const priceToUse = discountedPrice !== undefined && discountedPrice !== null ? discountedPrice : session.price;
      transactions.push({
        id: transactionId,
        date: now.toISOString().slice(0, 10),
        item: session.title,
        price: priceToUse,
        status: 'Pending Payment',
        due: dueDate.toISOString(),
        type: 'class',
        username: currentUser,
        coupon: appliedCoupon
      });
      // If coupon applied, decrement its quantity
      if (appliedCoupon) {
        const coupons = JSON.parse(localStorage.getItem('lawuTennisCoupons')) || [];
        const idx = coupons.findIndex(c => c.code.toLowerCase() === appliedCoupon.toLowerCase());
        if (idx !== -1 && coupons[idx].quantity > 0) {
          coupons[idx].quantity -= 1;
          localStorage.setItem('lawuTennisCoupons', JSON.stringify(coupons));
        }
      }
      localStorage.setItem('lawuTennisTransactions', JSON.stringify(transactions));
      // Redirect to transaction detail page
      window.location.href = 'transaction_detail.html?id=' + encodeURIComponent(transactionId);
    }
  });
  classActionsEl.appendChild(actionBtn);
  // Helper to format price
  function numberWithCommas(x) {
    if (x === null || x === undefined) return '';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
});