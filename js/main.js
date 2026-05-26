/* =============================================
   TYROHUB - Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────
     1. THEME (DARK / LIGHT MODE)
  ────────────────────────────────────────── */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  const savedTheme  = localStorage.getItem('tyrohub-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  syncThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tyrohub-theme', next);
    syncThemeIcon(next);
  });

  function syncThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
  }

  /* ──────────────────────────────────────────
     2. STICKY NAVBAR
  ────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ──────────────────────────────────────────
     3. MOBILE HAMBURGER MENU
  ────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  // Close on nav link click
  document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });

  /* ──────────────────────────────────────────
     4. SEARCH BAR EXPAND
  ────────────────────────────────────────── */
  const searchWrap = document.getElementById('searchWrap');
  const searchBtn  = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  searchBtn.addEventListener('click', () => {
    searchWrap.classList.toggle('expanded');
    if (searchWrap.classList.contains('expanded')) {
      searchInput.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchWrap.contains(e.target)) {
      searchWrap.classList.remove('expanded');
    }
  });

  /* ──────────────────────────────────────────
     5. WISHLIST
  ────────────────────────────────────────── */
  let wishlist = JSON.parse(localStorage.getItem('tyrohub-wishlist') || '[]');
  updateWishlistBadge();

  function updateWishlistBadge() {
    const badge = document.getElementById('wishlistCount');
    badge.textContent = wishlist.length;
    badge.classList.toggle('visible', wishlist.length > 0);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.product-action-btn[data-wishlist]');
    if (!btn) return;
    const id   = btn.dataset.wishlist;
    const icon = btn.querySelector('i');
    const idx  = wishlist.indexOf(id);

    if (idx === -1) {
      wishlist.push(id);
      btn.classList.add('wishlisted');
      if (icon) { icon.className = 'ri-heart-fill'; }
      showToast('Added to wishlist ❤️');
    } else {
      wishlist.splice(idx, 1);
      btn.classList.remove('wishlisted');
      if (icon) { icon.className = 'ri-heart-line'; }
      showToast('Removed from wishlist');
    }
    localStorage.setItem('tyrohub-wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
  });

  // Re-apply wishlist state on load
  document.querySelectorAll('.product-action-btn[data-wishlist]').forEach(btn => {
    const id = btn.dataset.wishlist;
    if (wishlist.includes(id)) {
      btn.classList.add('wishlisted');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'ri-heart-fill';
    }
  });

  /* ──────────────────────────────────────────
     6. TOAST NOTIFICATION
  ────────────────────────────────────────── */
  function showToast(msg) {
    let toast = document.getElementById('toastNotif');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotif';
      toast.style.cssText = `
        position:fixed; bottom:100px; right:32px; z-index:9999;
        background:var(--bg-card); border:1px solid var(--border-color);
        color:var(--text-primary); padding:12px 20px; border-radius:10px;
        font-size:14px; font-weight:500; box-shadow:var(--shadow-md);
        transition:all 0.3s ease; opacity:0; transform:translateY(8px);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
    }, 2500);
  }

  /* ──────────────────────────────────────────
     7. PRODUCT FILTERING
  ────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      productCards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  /* ──────────────────────────────────────────
     8. QUICK VIEW MODAL
  ────────────────────────────────────────── */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose   = document.getElementById('modalClose');

  const productData = {
    'p1': {
      name: 'Lenovo Legion 5i Pro',
      brand: 'LENOVO GAMING',
      img: 'images/gaming_laptop.png',
      specs: ['Intel i7-12700H', 'RTX 3070 8GB', '16GB DDR5 RAM', '1TB NVMe SSD', '16" QHD 165Hz'],
      price: 'PKR 195,000',
      old: 'PKR 230,000',
      desc: 'The ultimate gaming powerhouse for serious gamers. Features NVIDIA RTX 3070 graphics, 165Hz refresh rate display, and advanced thermal management for sustained peak performance.',
      badge: 'HOT DEAL',
    },
    'p2': {
      name: 'ThinkPad X1 Carbon Gen 10',
      brand: 'LENOVO BUSINESS',
      img: 'images/business_laptop.png',
      specs: ['Intel i7-1265U', 'Intel Iris Xe', '16GB LPDDR5', '512GB SSD', '14" 2.8K OLED'],
      price: 'PKR 145,000',
      old: 'PKR 175,000',
      desc: 'The iconic ThinkPad reborn. Ultra-light at just 1.12kg, with military-grade durability, stunning OLED display, and all-day battery life. Perfect for professionals on the go.',
      badge: 'REFURBISHED',
    },
    'p3': {
      name: 'Dell XPS 15 Developer Edition',
      brand: 'DELL DEVELOPER',
      img: 'images/coding_laptop.png',
      specs: ['Intel i9-12900HK', 'NVIDIA GTX 1650', '32GB DDR5', '1TB SSD', '15.6" 4K OLED'],
      price: 'PKR 210,000',
      old: 'PKR 260,000',
      desc: 'Built for developers and creators. Featuring a stunning 4K OLED display, blazing fast i9 processor, and 32GB RAM — handle any codebase, virtual machine, or creative project.',
      badge: 'BEST FOR DEV',
    },
    'p4': {
      name: 'HP Pavilion Slim 14',
      brand: 'HP STUDENT',
      img: 'images/student_laptop.png',
      specs: ['AMD Ryzen 5 7530U', 'Radeon Graphics', '8GB DDR4', '512GB SSD', '14" FHD IPS'],
      price: 'PKR 75,000',
      old: 'PKR 95,000',
      desc: 'The perfect student companion. Lightweight, reliable, and affordable. Fast Ryzen processor handles all your university work, presentations, and media streaming with ease.',
      badge: 'STUDENT PICK',
    },
    'p5': {
      name: 'MacBook Pro M2 (Refurb)',
      brand: 'APPLE',
      img: 'images/coding_laptop.png',
      specs: ['Apple M2 Pro', '16-core GPU', '16GB Unified', '512GB SSD', '14" Liquid Retina XDR'],
      price: 'PKR 280,000',
      old: 'PKR 350,000',
      desc: 'The most powerful MacBook ever refurbished to pristine condition. With the M2 Pro chip, this machine handles everything from iOS development to video editing without breaking a sweat.',
      badge: 'PREMIUM',
    },
    'p6': {
      name: 'Acer Aspire 5 Business',
      brand: 'ACER BUSINESS',
      img: 'images/business_laptop.png',
      specs: ['Intel i5-1235U', 'Intel UHD', '8GB DDR4', '256GB SSD', '15.6" FHD'],
      price: 'PKR 65,000',
      old: 'PKR 80,000',
      desc: 'Reliable, affordable business computing. Great for office work, remote meetings, and day-to-day productivity. Backed by TyroHub warranty and support.',
      badge: 'VALUE PICK',
    },
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quickview]');
    if (!btn) return;
    const id   = btn.dataset.quickview;
    const data = productData[id];
    if (!data) return;
    openModal(data);
  });

  function openModal(data) {
    document.getElementById('modalImg').src          = data.img;
    document.getElementById('modalBrand').textContent = data.brand;
    document.getElementById('modalName').textContent  = data.name;
    document.getElementById('modalDesc').textContent  = data.desc;
    document.getElementById('modalPrice').textContent = data.price;
    document.getElementById('modalOld').textContent   = data.old;

    const specsList = document.getElementById('modalSpecs');
    specsList.innerHTML = data.specs.map(s =>
      `<span class="spec-pill">${s}</span>`
    ).join('');

    const badge = document.getElementById('modalBadge');
    badge.textContent = data.badge;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ──────────────────────────────────────────
     9. REVIEWS CAROUSEL
  ────────────────────────────────────────── */
  const track  = document.getElementById('reviewsTrack');
  const dots   = document.querySelectorAll('.reviews-dot');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');

  if (track) {
    let current   = 0;
    const cards   = track.querySelectorAll('.review-card');
    let perView   = window.innerWidth < 700 ? 1 : window.innerWidth < 1000 ? 2 : 3;
    const total   = Math.ceil(cards.length / perView);
    let autoTimer;

    function goTo(idx) {
      current = (idx + total) % total;
      const cardW = cards[0].offsetWidth + 24;
      track.style.transform = `translateX(-${current * perView * cardW}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 4500);
    }
    function stopAuto() { clearInterval(autoTimer); }

    prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { stopAuto(); goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
    });

    window.addEventListener('resize', () => {
      perView = window.innerWidth < 700 ? 1 : window.innerWidth < 1000 ? 2 : 3;
      goTo(0);
    });

    goTo(0);
    startAuto();
  }

  /* ──────────────────────────────────────────
     10. SCROLL REVEAL (IntersectionObserver)
  ────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

  /* ──────────────────────────────────────────
     11. SMOOTH ACTIVE NAV LINK
  ────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ──────────────────────────────────────────
     12. NEWSLETTER FORM
  ────────────────────────────────────────── */
  const nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = nlForm.querySelector('input[type="email"]');
      if (input.value) {
        showToast('🎉 You\'re subscribed! Welcome to TyroHub.');
        input.value = '';
      }
    });
  }

  /* ──────────────────────────────────────────
     13. BUY NOW BUTTON
  ────────────────────────────────────────── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-buy[data-wa]');
    if (!btn) return;
    const msg = encodeURIComponent(btn.dataset.wa);
    window.open(`https://wa.me/923001234567?text=${msg}`, '_blank');
  });

  /* ──────────────────────────────────────────
     14. HERO COUNTER ANIMATION
  ────────────────────────────────────────── */
  function animateCount(el, target, suffix = '') {
    let count = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = count.toLocaleString() + suffix;
      if (count >= target) clearInterval(timer);
    }, 20);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('[data-count]').forEach(el => {
          animateCount(el, parseInt(el.dataset.count), el.dataset.suffix || '');
        });
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) counterObserver.observe(heroStats);

  /* ──────────────────────────────────────────
     15. CATEGORY CARD RIPPLE
  ────────────────────────────────────────── */
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        width:80px; height:80px;
        background:rgba(59,130,246,0.25);
        left:${e.clientX - rect.left - 40}px;
        top:${e.clientY - rect.top - 40}px;
        transform:scale(0); animation: ripple 0.6s ease-out;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Add ripple keyframe
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `@keyframes ripple { to { transform: scale(4); opacity: 0; } }`;
  document.head.appendChild(rippleStyle);

  /* ──────────────────────────────────────────
     16. TYPING ANIMATION (Code Section)
  ────────────────────────────────────────── */
  const typingLines = document.querySelectorAll('.typing-line');
  if (typingLines.length) {
    typingLines.forEach((line, i) => {
      const text = line.textContent;
      line.textContent = '';
      line.style.visibility = 'visible';
      setTimeout(() => {
        let idx = 0;
        const interval = setInterval(() => {
          line.textContent += text[idx];
          idx++;
          if (idx >= text.length) clearInterval(interval);
        }, 30);
      }, i * 400);
    });
  }

});
