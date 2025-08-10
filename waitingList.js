// waitingList.js
// Populates the waiting list page with sessions stored in localStorage under lawuTennisWaitingList.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const listEl = document.getElementById('waitingList');
  if (!listEl) return;
  const waitingData = JSON.parse(localStorage.getItem('lawuTennisWaitingList')) || [];
  // Filter by userEmail property if exists
  const userWaiting = waitingData.filter(item => {
    return !item.userEmail || item.userEmail === currentUser;
  });
  if (userWaiting.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'message';
    msg.textContent = 'You are not on any waiting list.';
    listEl.appendChild(msg);
    return;
  }
  // Sort by date/time to show earliest first
  userWaiting.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
  userWaiting.forEach(item => {
    const li = document.createElement('li');
    li.className = 'booking-item';
    const titlePart = item.title ? ` – ${item.title}` : '';
    li.textContent = `${item.date} at ${item.time}${titlePart}`;
    listEl.appendChild(li);
  });
});