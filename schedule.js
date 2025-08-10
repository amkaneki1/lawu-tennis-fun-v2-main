// schedule.js
// Implements a flexible class schedule similar to the Flou Pilates site. Updated to track bookings by username.

// Utility to format dates as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Load sessions from localStorage and filter them by date. If no session data
// exists, returns an empty array. Sessions are objects with an id, date,
// time, duration (minutes), title, coach, location, and maxSlots.
function getSessionsForDate(dateStr) {
  let allSessions = JSON.parse(localStorage.getItem('lawuTennisSessions')) || [];
  // If there are no sessions defined, seed with two default sessions for today
  if (allSessions.length === 0) {
    const defaultSessions = [];
    // Create two sample sessions for the requested date
    defaultSessions.push({
      id: 'session-' + Date.now(),
      date: dateStr,
      time: '07:00',
      duration: 60,
      title: 'Morning Tennis Drills',
      coach: 'Coach Andi',
      location: 'Court 1',
      maxSlots: 8,
      price: 150000
    });
    defaultSessions.push({
      id: 'session-' + (Date.now() + 1),
      date: dateStr,
      time: '09:00',
      duration: 60,
      title: 'Serve & Return Workshop',
      coach: 'Coach Siti',
      location: 'Court 2',
      maxSlots: 8,
      price: 150000
    });
    allSessions = defaultSessions;
    localStorage.setItem('lawuTennisSessions', JSON.stringify(allSessions));
  }
  return allSessions.filter(sess => sess.date === dateStr);
}

function renderSchedule(dateStr) {
  const container = document.getElementById('scheduleContainer');
  const sessions = getSessionsForDate(dateStr);
  let html = `<h2>Classes on ${dateStr}</h2>`;
  html += '<div class="session-list">';
  // Load all bookings to determine if the user has already booked a session and to calculate spots left
  const bookings = JSON.parse(localStorage.getItem('lawuTennisBookings')) || [];
  const currentUser = localStorage.getItem('lawuTennisCurrentUser');
  sessions.forEach((sess) => {
    // Determine booked count and whether current user already booked this session
    const sessionBookings = bookings.filter(b => b.sessionId === sess.id);
    const bookedCount = sessionBookings.length;
    const isFull = sess.maxSlots !== undefined && bookedCount >= sess.maxSlots;
    const userHasBooked = sessionBookings.some(b => b.username === currentUser);
    let spotsLabel = '';
    if (isFull) {
      spotsLabel = 'Full';
    } else {
      spotsLabel = 'Available';
    }
    let buttonHTML = '';
    if (userHasBooked) {
      buttonHTML = `<button class="btn detail-btn" data-id="${sess.id}" disabled>Booked</button>`;
    } else if (isFull) {
      buttonHTML = `<button class="btn detail-btn" data-id="${sess.id}" disabled>Full</button>`;
    } else {
      buttonHTML = `<button class="btn detail-btn" data-id="${sess.id}">Book</button>`;
    }
    html += `<div class="session-item" data-id="${sess.id}">
        <div class="session-time">${sess.time}</div>
        <div class="session-details">
          <h3>${sess.title}</h3>
          <p>${sess.coach} — ${sess.location}</p>
        </div>
        <div class="session-actions">
          <span class="spots">${spotsLabel}</span>
          ${buttonHTML}
        </div>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
  // Attach listeners for detail buttons
  container.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sessionId = btn.getAttribute('data-id');
      const sess = sessions.find(s => s.id === sessionId);
      if (!sess) return;
      // Build session object for class detail page and store in sessionStorage
      const detailObj = {
        id: sess.id,
        date: sess.date,
        time: sess.time,
        duration: sess.duration,
        title: sess.title,
        coach: sess.coach,
        location: sess.location,
        maxSlots: sess.maxSlots,
        price: sess.price || null
      };
      sessionStorage.setItem('selectedClass', JSON.stringify(detailObj));
      window.location.href = 'class_detail.html';
    });
  });
}

function initSchedule() {
  const datePicker = document.getElementById('datePicker');
  const prevDayBtn = document.getElementById('prevDay');
  const nextDayBtn = document.getElementById('nextDay');
  const today = new Date();
  const todayStr = formatDate(today);
  datePicker.value = todayStr;
  renderSchedule(todayStr);
  datePicker.addEventListener('change', () => {
    const selectedDate = datePicker.value;
    if (selectedDate) renderSchedule(selectedDate);
  });
  prevDayBtn.addEventListener('click', () => {
    let currentDate = new Date(datePicker.value);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDateStr = formatDate(currentDate);
    datePicker.value = newDateStr;
    renderSchedule(newDateStr);
  });
  nextDayBtn.addEventListener('click', () => {
    let currentDate = new Date(datePicker.value);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDateStr = formatDate(currentDate);
    datePicker.value = newDateStr;
    renderSchedule(newDateStr);
  });
}

// Ensure user is logged in before initializing schedule
document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return;
  initSchedule();
});