// promos.js
// This script populates the list of promotions on the promos page. Promotions are stored in
// localStorage under the key `lawuTennisPromos`. If no promotions exist, fallback to some
// default demo promotions for first-time visitors.

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = requireLogin();
  if (!currentUser) return;
  // Default promo data used if none exists in localStorage
  const defaultPromos = [
    {
      title: 'New Member Discount',
      description: 'Enjoy 20% off your first package purchase. Join today and start training!',
      code: 'NEW20'
    },
    {
      title: 'Refer a Friend',
      description: 'Bring a friend and both of you get 10% off your next session.',
      code: 'FRIEND10'
    }
  ];

  const promosData = JSON.parse(localStorage.getItem('lawuTennisPromos')) || defaultPromos;
  // Persist default promos in localStorage on first load
  if (!localStorage.getItem('lawuTennisPromos')) {
    localStorage.setItem('lawuTennisPromos', JSON.stringify(defaultPromos));
  }

  const promoListEl = document.getElementById('promoList');
  if (promosData.length === 0) {
    const p = document.createElement('p');
    p.className = 'message';
    p.textContent = 'There are currently no promotions.';
    promoListEl.appendChild(p);
    return;
  }

  promosData.forEach(promo => {
    const card = document.createElement('div');
    card.className = 'promo-card';
    const title = document.createElement('h3');
    title.textContent = promo.title;
    const desc = document.createElement('p');
    desc.textContent = promo.description;
    const codeLabel = document.createElement('p');
    codeLabel.className = 'promo-code';
    codeLabel.textContent = `Use code: ${promo.code}`;
    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = 'Get Now';
    button.addEventListener('click', () => {
      alert('Thank you for your interest! Please enter the promo code during checkout.');
    });
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(codeLabel);
    card.appendChild(button);
    promoListEl.appendChild(card);
  });
});