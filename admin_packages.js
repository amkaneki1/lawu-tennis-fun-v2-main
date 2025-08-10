// admin_packages.js
// Provides CRUD management for membership packages in the admin panel.

let packages = [];
let editingPackageId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Only allow admin
  if (!requireAdmin()) return;
  // Load packages from localStorage or seed defaults
  packages = JSON.parse(localStorage.getItem('lawuTennisPackages')) || [];
  if (packages.length === 0) {
    seedDefaultPackages();
  }
  renderPackagesTable();
  const form = document.getElementById('packageForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pkgName').value.trim();
    const priceVal = document.getElementById('pkgPrice').value;
    const price = priceVal ? parseInt(priceVal, 10) : 0;
    const expiry = document.getElementById('pkgExpiry').value.trim();
    const type = document.getElementById('pkgType').value;
    const description = document.getElementById('pkgDescription').value.trim();
    if (!name || !expiry || !description) {
      alert('Please fill in all fields');
      return;
    }
    if (editingPackageId) {
      // Update existing
      const idx = packages.findIndex(p => p.id === editingPackageId);
      if (idx !== -1) {
        packages[idx] = { ...packages[idx], name, price, expiry, type, description };
      }
      editingPackageId = null;
      form.querySelector('button[type="submit"]').textContent = 'Save Package';
    } else {
      // Add new
      const id = 'pkg-' + Date.now();
      packages.push({ id, name, price, expiry, type, description });
    }
    localStorage.setItem('lawuTennisPackages', JSON.stringify(packages));
    renderPackagesTable();
    form.reset();
  });
});

function seedDefaultPackages() {
  packages = [
    {
      id: 'pkg-' + Date.now(),
      name: 'Single Session',
      price: 100000,
      expiry: 'Valid for 1 session',
      description: 'One practice session whenever you need a quick workout.',
      type: 'Public'
    },
    {
      id: 'pkg-' + (Date.now() + 1),
      name: 'Weekly Plan',
      price: 250000,
      expiry: 'Valid for 1 week (up to 3 sessions)',
      description: 'Up to 3 practice sessions per week to keep you fit and sharp.',
      type: 'Public'
    },
    {
      id: 'pkg-' + (Date.now() + 2),
      name: 'Monthly Membership',
      price: 900000,
      expiry: 'Valid for 1 month (unlimited sessions)',
      description: 'Unlimited sessions for a month—perfect for serious players.',
      type: 'Public'
    }
  ];
  localStorage.setItem('lawuTennisPackages', JSON.stringify(packages));
}

function renderPackagesTable() {
  const tbody = document.getElementById('packagesBody');
  tbody.innerHTML = '';
  packages.forEach(pkg => {
    const tr = document.createElement('tr');
    const priceText = 'Rp ' + pkg.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    tr.innerHTML = `
      <td style="border:1px solid #ddd;padding:6px;">${pkg.name}</td>
      <td style="border:1px solid #ddd;padding:6px;">${priceText}</td>
      <td style="border:1px solid #ddd;padding:6px;">${pkg.expiry}</td>
      <td style="border:1px solid #ddd;padding:6px;">${pkg.type || ''}</td>
      <td style="border:1px solid #ddd;padding:6px;">${pkg.description}</td>
      <td style="border:1px solid #ddd;padding:6px;">
        <button class="btn" style="font-size:0.8rem;padding:4px 8px;" onclick="editPackage('${pkg.id}')">Edit</button>
        <button class="btn" style="font-size:0.8rem;padding:4px 8px;background-color:#e57373;color:white;" onclick="deletePackage('${pkg.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editPackage(id) {
  const pkg = packages.find(p => p.id === id);
  if (!pkg) return;
  editingPackageId = id;
  document.getElementById('pkgName').value = pkg.name;
  document.getElementById('pkgPrice').value = pkg.price;
  document.getElementById('pkgExpiry').value = pkg.expiry;
  document.getElementById('pkgType').value = pkg.type || 'Public';
  document.getElementById('pkgDescription').value = pkg.description;
  const form = document.getElementById('packageForm');
  form.querySelector('button[type="submit"]').textContent = 'Update Package';
}

function deletePackage(id) {
  if (!confirm('Delete this package?')) return;
  packages = packages.filter(p => p.id !== id);
  localStorage.setItem('lawuTennisPackages', JSON.stringify(packages));
  renderPackagesTable();
}