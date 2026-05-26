import { openAuthModal } from './ui.js';
import { logout } from '../firebase-config.js';

export function renderNavbar(state) {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const isDark = state.theme === 'dark';
  const cartCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = state.wishlist.length;

  container.innerHTML = `
    <nav class="w-full glass-nav px-4 py-4 md:px-8 transition-colors duration-300">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-2xl font-black font-display tracking-tight text-white dark:text-white group">
          <span class="text-brand-blue-500 transform group-hover:scale-110 transition-transform duration-200">⚡</span>
          <span class="text-slate-100 dark:text-slate-100 transition-colors">Tyro<span class="text-brand-blue-500">Hub</span></span>
        </a>

        <!-- Desktop Links -->
        <ul class="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-400">
          <li><a href="/" class="nav-link-item hover:text-white transition-colors py-1 ${state.currentPath === '/' ? 'text-brand-blue-500 border-b-2 border-brand-blue-500' : ''}">Home</a></li>
          <li><a href="/shop" class="nav-link-item hover:text-white transition-colors py-1 ${state.currentPath === '/shop' ? 'text-brand-blue-500 border-b-2 border-brand-blue-500' : ''}">Shop Laptops</a></li>
          <li><a href="/about" class="nav-link-item hover:text-white transition-colors py-1 ${state.currentPath === '/about' ? 'text-brand-blue-500 border-b-2 border-brand-blue-500' : ''}">Our Story</a></li>
          <li><a href="/faq" class="nav-link-item hover:text-white transition-colors py-1 ${state.currentPath === '/faq' ? 'text-brand-blue-500 border-b-2 border-brand-blue-500' : ''}">FAQs</a></li>
          <li><a href="/contact" class="nav-link-item hover:text-white transition-colors py-1 ${state.currentPath === '/contact' ? 'text-brand-blue-500 border-b-2 border-brand-blue-500' : ''}">Contact</a></li>
        </ul>

        <!-- Actions -->
        <div class="flex items-center gap-2 sm:gap-4">
          
          <!-- Search Bar -->
          <form id="nav-search-form" class="relative hidden md:block">
            <input type="text" id="nav-search-input" placeholder="Search tech..." value="${state.searchQuery || ''}"
              class="w-48 xl:w-64 px-4 py-2 pl-10 rounded-xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-xs font-medium text-slate-200 focus:outline-none focus:w-72 focus:border-brand-blue-500 transition-all duration-300" />
            <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          </form>

          <!-- Theme Toggle -->
          <button id="nav-theme-toggle" class="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-colors" aria-label="Toggle Theme">
            <i class="${isDark ? 'ri-sun-line' : 'ri-moon-line'} text-lg"></i>
          </button>

          <!-- Wishlist -->
          <a href="/shop?wishlist=true" id="nav-wishlist" class="relative p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-colors" aria-label="Wishlist">
            <i class="ri-heart-line text-lg"></i>
            <span id="wishlist-badge" class="${wishlistCount > 0 ? 'flex' : 'hidden'} absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-black items-center justify-center text-white ring-2 ring-brand-navy-950">
              ${wishlistCount}
            </span>
          </a>

          <!-- Cart Icon -->
          <a href="/cart" id="nav-cart" class="relative p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-colors" aria-label="Cart">
            <i class="ri-shopping-bag-line text-lg"></i>
            <span id="cart-badge" class="${cartCount > 0 ? 'flex' : 'hidden'} absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-blue-500 text-[10px] font-black items-center justify-center text-white ring-2 ring-brand-navy-950">
              ${cartCount}
            </span>
          </a>

          <!-- Profile / Authenticate -->
          <div class="relative" id="profile-dropdown-container">
            ${state.user ? `
              <!-- User Profile Trigger -->
              <button id="profile-trigger" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <img src="${state.user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" 
                  alt="${state.user.displayName}" class="w-7 h-7 rounded-lg object-cover" />
                <i class="ri-arrow-down-s-line text-slate-400 text-sm hidden sm:inline"></i>
              </button>
              
              <!-- User Dropdown Menu -->
              <div id="profile-dropdown" class="absolute right-0 mt-3 w-56 rounded-xl border border-white/10 bg-brand-navy-900/90 shadow-2xl glass-card py-2 hidden pointer-events-none opacity-0 scale-95 origin-top-right transition-all duration-200 z-50 text-slate-200">
                <div class="px-4 py-2 border-b border-white/5 mb-1.5">
                  <p class="text-xs text-slate-500 font-semibold tracking-wide uppercase">Signed In As</p>
                  <p class="text-sm font-semibold truncate text-white">${state.user.displayName}</p>
                </div>
                <a href="/dashboard" class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 hover:text-white transition-colors">
                  <i class="ri-dashboard-line text-slate-400"></i>
                  <span>User Dashboard</span>
                </a>
                ${state.user.isAdmin ? `
                  <a href="/admin" class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-blue-500/20 text-brand-blue-400 hover:text-brand-blue-300 font-semibold transition-colors">
                    <i class="ri-admin-line"></i>
                    <span>Admin Dashboard</span>
                  </a>
                ` : ''}
                <div class="h-px bg-white/5 my-1.5"></div>
                <button id="btn-signout" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-medium transition-colors text-left">
                  <i class="ri-logout-box-line"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            ` : `
              <!-- Sign In Button -->
              <button id="btn-login-modal" class="px-4 py-2 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold text-xs transition-all duration-200 hover:shadow-glow-blue flex items-center gap-1.5">
                <i class="ri-user-line text-sm"></i>
                <span class="hidden sm:inline">Sign In</span>
              </button>
            `}
          </div>

          <!-- Hamburger Mobile Toggle -->
          <button id="btn-mobile-hamburger" class="lg:hidden p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-colors" aria-label="Toggle Menu">
            <i class="ri-menu-line text-lg"></i>
          </button>
        </div>
      </div>
    </nav>
  `;

  // Render Mobile Menu Drawer Structure
  const mobMenuContainer = document.getElementById('mobile-menu-container');
  if (mobMenuContainer) {
    mobMenuContainer.innerHTML = `
      <!-- Backdrop overlay -->
      <div id="mob-menu-overlay" class="absolute inset-0 bg-brand-navy-950/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none"></div>
      
      <!-- Drawer Menu panel -->
      <div id="mob-menu-drawer" class="absolute top-0 right-0 h-full w-80 bg-brand-navy-900 border-l border-white/10 p-6 flex flex-col gap-6 shadow-2xl transition-transform duration-300 transform translate-x-full z-10 text-slate-200">
        <div class="flex items-center justify-between border-b border-white/5 pb-4">
          <span class="font-bold text-lg font-display">⚡ Navigation</span>
          <button id="mob-menu-close" class="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors">
            <i class="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <!-- Search bar inside mobile menu -->
        <form id="mob-search-form" class="relative">
          <input type="text" id="mob-search-input" placeholder="Search products..." value="${state.searchQuery || ''}"
            class="w-full px-4 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-brand-blue-500 transition-colors" />
          <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
        </form>

        <ul class="flex flex-col gap-4 text-base font-semibold">
          <li><a href="/" class="mob-nav-link flex items-center justify-between p-2 rounded-lg hover:bg-white/5 ${state.currentPath === '/' ? 'text-brand-blue-500 bg-white/5' : 'text-slate-300'}"><span>Home</span> <i class="ri-arrow-right-s-line text-slate-500"></i></a></li>
          <li><a href="/shop" class="mob-nav-link flex items-center justify-between p-2 rounded-lg hover:bg-white/5 ${state.currentPath === '/shop' ? 'text-brand-blue-500 bg-white/5' : 'text-slate-300'}"><span>Shop Laptops</span> <i class="ri-arrow-right-s-line text-slate-500"></i></a></li>
          <li><a href="/about" class="mob-nav-link flex items-center justify-between p-2 rounded-lg hover:bg-white/5 ${state.currentPath === '/about' ? 'text-brand-blue-500 bg-white/5' : 'text-slate-300'}"><span>Our Story</span> <i class="ri-arrow-right-s-line text-slate-500"></i></a></li>
          <li><a href="/faq" class="mob-nav-link flex items-center justify-between p-2 rounded-lg hover:bg-white/5 ${state.currentPath === '/faq' ? 'text-brand-blue-500 bg-white/5' : 'text-slate-300'}"><span>FAQs</span> <i class="ri-arrow-right-s-line text-slate-500"></i></a></li>
          <li><a href="/contact" class="mob-nav-link flex items-center justify-between p-2 rounded-lg hover:bg-white/5 ${state.currentPath === '/contact' ? 'text-brand-blue-500 bg-white/5' : 'text-slate-300'}"><span>Contact</span> <i class="ri-arrow-right-s-line text-slate-500"></i></a></li>
        </ul>

        <div class="mt-auto border-t border-white/5 pt-6 flex flex-col gap-4">
          <!-- WhatsApp Contact Button -->
          <a href="https://wa.me/923001234567?text=Hi%20TyroHub!" target="_blank" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-center flex items-center justify-center gap-2 transition-colors shadow-lg">
            <i class="ri-whatsapp-line text-lg"></i>
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    `;
  }
}

export function initNavbar(state, navigateCallback) {
  // Bind click handlers to nav-link-item and mob-nav-link links for client routing
  document.querySelectorAll('.nav-link-item, .mob-nav-link, a[href="/cart"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      closeMobileMenu();
      navigateCallback(href);
    });
  });

  // Bind login button click
  const loginBtn = document.getElementById('btn-login-modal');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      openAuthModal('login');
    });
  }

  // Bind logout button click
  const logoutBtn = document.getElementById('btn-signout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout();
      navigateCallback('/'); // redirect to home on logout
    });
  }

  // Theme Toggle Button Logic
  const themeToggle = document.getElementById('nav-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('tyrohub-theme', nextTheme);
      // Re-render navbar to update icon
      renderNavbar(state);
      initNavbar(state, navigateCallback);
    });
  }

  // Profile Dropdown Toggle Logic
  const profileTrigger = document.getElementById('profile-trigger');
  const profileDropdown = document.getElementById('profile-dropdown');
  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = profileDropdown.classList.contains('hidden');
      if (isHidden) {
        profileDropdown.classList.remove('hidden');
        setTimeout(() => {
          profileDropdown.classList.remove('pointer-events-none', 'scale-95', 'opacity-0');
        }, 10);
      } else {
        closeProfileDropdown();
      }
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target) && e.target !== profileTrigger) {
        closeProfileDropdown();
      }
    });

    function closeProfileDropdown() {
      profileDropdown.classList.add('scale-95', 'opacity-0');
      profileDropdown.classList.add('pointer-events-none');
      profileDropdown.addEventListener('transitionend', () => {
        profileDropdown.classList.add('hidden');
      }, { once: true });
    }
  }

  // Search Logic (Desktop Navbar)
  const searchForm = document.getElementById('nav-search-form');
  const searchInput = document.getElementById('nav-search-input');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        navigateCallback(`/shop?search=${encodeURIComponent(q)}`);
      }
    });
  }

  // Search Logic (Mobile Drawer)
  const mobSearchForm = document.getElementById('mob-search-form');
  const mobSearchInput = document.getElementById('mob-search-input');
  if (mobSearchForm && mobSearchInput) {
    mobSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = mobSearchInput.value.trim();
      if (q) {
        closeMobileMenu();
        navigateCallback(`/shop?search=${encodeURIComponent(q)}`);
      }
    });
  }

  // Mobile Hamburger Toggle Logic
  const hamburger = document.getElementById('btn-mobile-hamburger');
  const drawerContainer = document.getElementById('mobile-menu-container');
  const drawerOverlay = document.getElementById('mob-menu-overlay');
  const drawerPanel = document.getElementById('mob-menu-drawer');
  const drawerClose = document.getElementById('mob-menu-close');

  if (hamburger && drawerContainer && drawerPanel && drawerOverlay) {
    hamburger.addEventListener('click', () => {
      drawerContainer.classList.remove('pointer-events-none');
      drawerOverlay.classList.remove('pointer-events-none');
      drawerOverlay.classList.remove('opacity-0');
      drawerOverlay.classList.add('opacity-100');
      drawerPanel.classList.remove('translate-x-full');
    });

    const closeHandler = () => closeMobileMenu();
    drawerClose.addEventListener('click', closeHandler);
    drawerOverlay.addEventListener('click', closeHandler);

    function closeMobileMenu() {
      drawerPanel.classList.add('translate-x-full');
      drawerOverlay.classList.remove('opacity-100');
      drawerOverlay.classList.add('opacity-0');
      drawerOverlay.classList.add('pointer-events-none');
      drawerContainer.classList.add('pointer-events-none');
    }
  }
}
