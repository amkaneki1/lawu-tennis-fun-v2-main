// Script to display a list of booked sessions stored in localStorage.
// Updated to use username instead of email to identify bookings.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  const bookingsList = document.getElementById('bookingsList');
  if (!bookingsList) return;
  // Retrieve stored bookings from localStorage. We support two formats:
  // (1) New format: an array of booking objects { sessionId, date, time, title, username }
  // (2) Legacy format: an object keyed by date -> array of session info
  const rawBookings = JSON.parse(localStorage.getItem('lawuTennisBookings')) || [];
  let bookingsArr = [];
  if (Array.isArray(rawBookings)) {
    bookingsArr = rawBookings;
  } else {
    // Convert legacy format to array
    Object.keys(rawBookings).forEach(date => {
      (rawBookings[date] || []).forEach(session => {
        if (typeof session === 'string') {
          // Strings represent time only; assume belongs to current user and unknown title
          bookingsArr.push({ date, time: session, title: '', username: currentUser });
        } else {
          bookingsArr.push({ date, time: session.time, title: session.title || '', username: session.username || currentUser });
        }
      });
    });
    // Save back in new format for future ease
    localStorage.setItem('lawuTennisBookings', JSON.stringify(bookingsArr));
  }
  const items = [];
  bookingsArr.forEach(b => {
    if b(.username === currentUsertUser) {
      items.push({ date: b.date, time: b.time, title: b.title || '' });
    }
  });
  // If no bookings exist, show a friendly message.
  if (items.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'message';
    msg.textContent = 'You have no bookings yet.';
    bookingsList.appendChild(msg);
    return;
  }
  // Sort bookings by date/time for better readability.
  items.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time.split(' - ')[0]}`);
    const dateB = new Date(`${b.date} ${b.time.split(' - ')[0]}`);
    return dateA - dateB;
  });
  // Create a list item for each booking.
  items.forEach(({ date, time, title }) => {
    const li = document.createElement('li');
    li.className = 'booking-item';
    const titlePart = title ? ` – ${title}` : '';
    li.textContent = `${date} at ${time}${titlePart}`;
    bookingsList.appendChild(li);
  });
});
