// admin_schedule.js
// Handles session management for the admin panel

let sessions = [];
let editingSessionId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure only admin can access this page
  if (!requireAdmin()) return;
  // Load sessions from localStorage
  sessions = JSON.parse(localStorage.getItem('lawuTennisSessions')) || [];
  // Seed default sessions if none exist
  if (sessions.length === 0) {
    seedDefaultSessions();
  }
  renderSessionsTable();
  const form = document.getElementById('addSessionForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Gather form values
    const date = document.getElementById('sessionDate').value;
    const time = document.getElementById('sessionTime').value;
    const duration = parseInt(document.getElementById('sessionDuration').value, 10);
    const title = document.getElementById('sessionTitle').value.trim();
    const coach = document.getElementById('sessionCoach').value.trim();
    const location = document.getElementById('sessionLocation').value.trim();
    // Gender field removed; default to 'All Gender'
    const gender = 'All Gender';
    const maxSlots = parseInt(document.getElementById('sessionMaxSlots').value, 10);
    const priceInput = document.getElementById('sessionPrice');
    const price = priceInput.value ? parseInt(priceInput.value, 10) : null;
    if (!date || !time || !duration || !title || !coach || !location || !gender || !maxSlots) {
      alert('Please fill in all fields');
      return;
    }
    if (editingSessionId) {
      // Update existing session
      const idx = sessions.findIndex(s => s.id === editingSessionId);
      if (idx !== -1) {
        sessions[idx] = {
          ...sessions[idx],
          date,
          time,
          duration,
          title,
          coach,
          location,
          gender,
          maxSlots,
          price
        };
      }
      editingSessionId = null;
      form.querySelector('button[type="submit"]').textContent = 'Add Session';
    } else {
      // Add new session
      const id = 'session-' + Date.now();
      sessions.push({
        id,
        date,
        time,
        duration,
        title,
        coach,
        location,
        gender,
        maxSlots,
        price
      });
    }
    // Save sessions and refresh
    localStorage.setItem('lawuTennisSessions', JSON.stringify(sessions));
    renderSessionsTable();
    form.reset();
  });
});

function seedDefaultSessions() {
  // Provide a few default sessions similar to original schedule
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  sessions = [
    {
      id: 'session-' + Date.now(),
      date: dateStr,
      time: '07:00',
      duration: 60,
      title: 'Morning Tennis Drills',
      coach: 'Coach Andi',
      location: 'Outdoor Court',
      // Gender removed – retain legacy value but unused
      gender: 'All Gender',
      maxSlots: 8,
      price: 150000
    },
    {
      id: 'session-' + (Date.now() + 1),
      date: dateStr,
      time: '09:00',
      duration: 60,
      title: 'Serve & Return Workshop',
      coach: 'Coach Siti',
      location: 'Indoor Court',
      gender: 'All Gender',
      maxSlots: 8,
      price: 150000
    }
  ];
  localStorage.setItem('lawuTennisSessions', JSON.stringify(sessions));
}

function renderSessionsTable() {
  const tbody = document.getElementById('sessionsBody');
  tbody.innerHTML = '';
  // Load bookings to compute booked count; support both array and legacy object formats
  const rawBookings = JSON.parse(localStorage.getItem('lawuTennisBookings')) || [];
  let bookingsArr;
  if (Array.isArray(rawBookings)) {
    bookingsArr = rawBookings;
  } else {
    bookingsArr = [];
    Object.keys(rawBookings).forEach(date => {
      (rawBookings[date] || []).forEach(item => {
        if (typeof item === 'string') return;
        bookingsArr.push({ sessionId: item.sessionId, date, time: item.time, userEmail: item.userEmail });
      });
    });
  }
  sessions.forEach(session => {
    const bookedCount = bookingsArr.filter(b => b.sessionId === session.id).length;
    const tr = document.createElement('tr');
    const priceText = session.price !== null && session.price !== undefined ? 'Rp ' + numberWithCommas(session.price) : '-';
    tr.innerHTML = `
      <td style="border:1px solid #ddd;padding:6px;">${session.date}</td>
      <td style="border:1px solid #ddd;padding:6px;">${session.time}</td>
      <td style="border:1px solid #ddd;padding:6px;">${session.duration}</td>
      <td style="border:1px solid #ddd;padding:6px;">${session.title}</td>
      <td style="border:1px solid #ddd;padding:6px;">${session.coach}</td>
      <td style="border:1px solid #ddd;padding:6px;">${session.location}</td>
      <!-- Gender column removed -->
      <td style="border:1px solid #ddd;padding:6px;">${session.maxSlots}</td>
      <td style="border:1px solid #ddd;padding:6px;">${bookedCount}</td>
      <td style="border:1px solid #ddd;padding:6px;">${priceText}</td>
      <td style="border:1px solid #ddd;padding:6px;">
        <button class="btn" style="font-size:0.8rem;padding:4px 8px;" onclick="editSession('${session.id}')">Edit</button>
        <button class="btn" style="font-size:0.8rem;padding:4px 8px;background-color:#e57373;color:white;" onclick="deleteSession('${session.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteSession(id) {
  if (!confirm('Delete this session?')) return;
  sessions = sessions.filter(s => s.id !== id);
  localStorage.setItem('lawuTennisSessions', JSON.stringify(sessions));
  renderSessionsTable();
}

function editSession(id) {
  const session = sessions.find(s => s.id === id);
  if (!session) return;
  editingSessionId = id;
  // Populate form fields
  document.getElementById('sessionDate').value = session.date;
  document.getElementById('sessionTime').value = session.time;
  document.getElementById('sessionDuration').value = session.duration;
  document.getElementById('sessionTitle').value = session.title;
  document.getElementById('sessionCoach').value = session.coach;
  document.getElementById('sessionLocation').value = session.location;
  // Gender field removed; no need to populate
  document.getElementById('sessionMaxSlots').value = session.maxSlots;
  // Change button text
  const form = document.getElementById('addSessionForm');
  form.querySelector('button[type="submit"]').textContent = 'Save Changes';
}

// Utility to format numbers with thousand separators (e.g., 150000 -> 150.000)
function numberWithCommas(x) {
  if (x === null || x === undefined) return '';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}