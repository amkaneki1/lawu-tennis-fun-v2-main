const translations = {
  id: {
    nav: {
      home: 'Beranda',
      schedule: 'Jadwal',
      packages: 'Paket',
      classes: 'Kelas',
      transactions: 'Transaksi',
      profile: 'Profil'
    },
    headings: {
      transactions: 'Transaksi',
      transactionDetail: 'Detail Transaksi',
      packageDetail: 'Detail Paket',
      classDetail: 'Detail Kelas',
      settings: 'Pengaturan'
    },
    buttons: {
      approve: 'Setujui',
      reject: 'Tolak',
      uploadProof: 'Unggah'
    },
    labels: {
      payerName: 'Nama Pengirim',
      paymentMethod: 'Metode Pembayaran',
      bank: 'Bank',
      accountNumber: 'Nomor Rekening',
      accountHolder: 'Nama Pemilik'
    }
  },
  en: {
    nav: {
      home: 'Home',
      schedule: 'Schedule',
      packages: 'Packages',
      classes: 'Classes',
      transactions: 'Transactions',
      profile: 'Profile'
    },
    headings: {
      transactions: 'Transactions',
      transactionDetail: 'Transaction Detail',
      packageDetail: 'Package Detail',
      classDetail: 'Class Detail',
      settings: 'Settings'
    },
    buttons: {
      approve: 'Approve',
      reject: 'Reject',
      uploadProof: 'Upload'
    },
    labels: {
      payerName: 'Payer Name',
      paymentMethod: 'Payment Method',
      bank: 'Bank',
      accountNumber: 'Account Number',
      accountHolder: 'Account Holder'
    }
  }
};

function getTranslation(category, key, defaultText) {
  const lang = localStorage.getItem('lawuTennisLang') || 'id';
  const group = translations[lang] && translations[lang][category];
  return (group && group[key]) || defaultText || '';
}

function applyNavTranslations() {
  const lang = localStorage.getItem('lawuTennisLang') || 'id';
  const navKeys = ['home','schedule','packages','classes','transactions','profile'];
  const labels = document.querySelectorAll('.nav-label');
  labels.forEach((el, index) => {
    const key = navKeys[index];
    const text = translations[lang].nav[key];
    if (text) el.textContent = text;
  });
}
