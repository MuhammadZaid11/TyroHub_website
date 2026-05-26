// Global Toast Utility
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 p-4 rounded-xl shadow-lg border text-sm pointer-events-auto transition-all duration-300 transform translate-y-4 opacity-0 glass-card max-w-sm w-full`;
  
  // Icon and border theme based on type
  let icon = '<i class="ri-checkbox-circle-fill text-emerald-500 text-lg"></i>';
  let borderClass = 'border-emerald-500/20';
  if (type === 'error') {
    icon = '<i class="ri-error-warning-fill text-rose-500 text-lg"></i>';
    borderClass = 'border-rose-500/20';
  } else if (type === 'info') {
    icon = '<i class="ri-information-fill text-brand-blue-500 text-lg"></i>';
    borderClass = 'border-brand-blue-500/20';
  } else if (type === 'warning') {
    icon = '<i class="ri-alert-fill text-amber-500 text-lg"></i>';
    borderClass = 'border-amber-500/20';
  }

  toast.classList.add(borderClass);
  toast.innerHTML = `
    <div class="flex-shrink-0">${icon}</div>
    <div class="flex-grow font-medium text-slate-200 dark:text-slate-100">${message}</div>
    <button class="flex-shrink-0 text-slate-400 hover:text-white transition-colors" aria-label="Close">
      <i class="ri-close-line"></i>
    </button>
  `;

  // Attach close event
  toast.querySelector('button').addEventListener('click', () => {
    dismissToast(toast);
  });

  container.appendChild(toast);

  // Trigger animation next tick
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  // Auto-dismiss after 4 seconds
  const autoDismissTimer = setTimeout(() => {
    dismissToast(toast);
  }, 4000);

  // Save timer reference
  toast.dataset.timerId = autoDismissTimer;
}

function dismissToast(toast) {
  if (toast.dataset.timerId) {
    clearTimeout(Number(toast.dataset.timerId));
  }
  toast.classList.add('translate-y-2', 'opacity-0');
  toast.addEventListener('transitionend', () => {
    toast.remove();
  });
}

// Skeleton Screens Generators
export function getProductCardSkeleton() {
  return `
    <div class="rounded-2xl border border-white/5 bg-brand-navy-900/40 p-4 animate-shimmer">
      <div class="aspect-video w-full rounded-xl bg-white/5 mb-4"></div>
      <div class="h-4 w-1/3 bg-white/5 rounded mb-2"></div>
      <div class="h-6 w-3/4 bg-white/5 rounded mb-3"></div>
      <div class="h-4 w-full bg-white/5 rounded mb-1"></div>
      <div class="h-4 w-2/3 bg-white/5 rounded mb-4"></div>
      <div class="flex items-center justify-between mt-auto pt-2">
        <div class="h-6 w-1/3 bg-white/5 rounded"></div>
        <div class="h-9 w-24 bg-white/5 rounded-lg"></div>
      </div>
    </div>
  `;
}

export function getProductDetailSkeleton() {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto p-4 animate-shimmer">
      <div class="aspect-square w-full rounded-2xl bg-white/5"></div>
      <div class="flex flex-col space-y-4">
        <div class="h-4 w-24 bg-white/5 rounded"></div>
        <div class="h-10 w-3/4 bg-white/5 rounded"></div>
        <div class="h-6 w-1/3 bg-white/5 rounded"></div>
        <div class="h-20 w-full bg-white/5 rounded"></div>
        <div class="h-12 w-48 bg-white/5 rounded-xl"></div>
        <div class="h-px w-full bg-white/5 my-4"></div>
        <div class="h-6 w-1/3 bg-white/5 rounded"></div>
        <div class="space-y-2">
          <div class="h-4 w-full bg-white/5 rounded"></div>
          <div class="h-4 w-full bg-white/5 rounded"></div>
          <div class="h-4 w-3/4 bg-white/5 rounded"></div>
        </div>
      </div>
    </div>
  `;
}

// Global Auth Modal Manager
import { loginEmail, registerEmail, loginGoogle, db, setDoc, doc, serverTimestamp, getDoc } from '../firebase-config.js';

export function openAuthModal(defaultTab = 'login') {
  const container = document.getElementById('auth-modal-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Overlay -->
    <div class="absolute inset-0 bg-brand-navy-950/80 backdrop-blur-sm pointer-events-auto"></div>
    
    <!-- Modal Card -->
    <div class="relative w-full max-w-md p-8 rounded-2xl border border-white/10 bg-brand-navy-900/90 shadow-2xl glass-modal pointer-events-auto transition-all duration-300 transform scale-95 opacity-0 text-slate-100">
      <button id="auth-modal-close" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors" aria-label="Close Modal">
        <i class="ri-close-line text-2xl"></i>
      </button>

      <div class="flex justify-center mb-6">
        <div class="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span class="text-brand-blue-500">⚡</span> Tyro<span class="text-brand-blue-500">Hub</span>
        </div>
      </div>

      <!-- Tab Buttons -->
      <div class="flex border-b border-white/5 mb-6">
        <button id="tab-login" class="flex-1 pb-3 text-center font-medium border-b-2 transition-all ${defaultTab === 'login' ? 'border-brand-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}">Sign In</button>
        <button id="tab-signup" class="flex-1 pb-3 text-center font-medium border-b-2 transition-all ${defaultTab === 'signup' ? 'border-brand-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}">Sign Up</button>
      </div>

      <!-- Login Form -->
      <form id="form-login" class="${defaultTab === 'login' ? 'block' : 'hidden'} space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
          <input type="email" required placeholder="name@example.com" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
          <input type="password" required placeholder="••••••••" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors" />
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold transition-all duration-200 shadow-glow-blue hover:shadow-brand-blue-500/50 flex items-center justify-center gap-2">
          <span>Sign In</span>
          <i class="ri-arrow-right-line"></i>
        </button>
      </form>

      <!-- Signup Form -->
      <form id="form-signup" class="${defaultTab === 'signup' ? 'block' : 'hidden'} space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
          <input type="text" id="signup-name" required placeholder="John Doe" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
          <input type="email" id="signup-email" required placeholder="name@example.com" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
          <input type="password" id="signup-password" required placeholder="Minimum 6 characters" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors" />
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold transition-all duration-200 shadow-glow-blue hover:shadow-brand-blue-500/50 flex items-center justify-center gap-2">
          <span>Create Account</span>
          <i class="ri-user-add-line"></i>
        </button>
      </form>

      <div class="relative my-6 text-center">
        <div class="absolute inset-y-1/2 left-0 right-0 border-t border-white/5 z-0"></div>
        <span class="relative px-3 bg-brand-navy-900 text-xs font-semibold uppercase tracking-wider text-slate-500 z-10">Or continue with</span>
      </div>

      <!-- Third Party Providers -->
      <button id="auth-google" class="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-semibold transition-all duration-200 flex items-center justify-center gap-3">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        <span>Google Account</span>
      </button>
    </div>
  `;

  // Animate modal entry
  container.classList.remove('pointer-events-none');
  container.style.opacity = '1';
  const card = container.querySelector('.relative.w-full');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
  }, 10);

  // Tab switching setup
  const tabLogin = container.querySelector('#tab-login');
  const tabSignup = container.querySelector('#tab-signup');
  const formLogin = container.querySelector('#form-login');
  const formSignup = container.querySelector('#form-signup');

  tabLogin.addEventListener('click', () => {
    tabLogin.className = 'flex-1 pb-3 text-center font-medium border-b-2 border-brand-blue-500 text-white transition-all';
    tabSignup.className = 'flex-1 pb-3 text-center font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all';
    formLogin.classList.remove('hidden');
    formSignup.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.className = 'flex-1 pb-3 text-center font-medium border-b-2 border-brand-blue-500 text-white transition-all';
    tabLogin.className = 'flex-1 pb-3 text-center font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all';
    formSignup.classList.remove('hidden');
    formLogin.classList.add('hidden');
  });

  // Modal close trigger
  const closeBtn = container.querySelector('#auth-modal-close');
  closeBtn.addEventListener('click', closeAuthModal);
  container.querySelector('.absolute.inset-0').addEventListener('click', closeAuthModal);

  // Submit Login logic
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = formLogin.querySelector('input[type="email"]').value;
    const password = formLogin.querySelector('input[type="password"]').value;
    try {
      await loginEmail(email, password);
      showToast('Logged in successfully!');
      closeAuthModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Submit Signup logic
  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = formSignup.querySelector('#signup-name').value;
    const email = formSignup.querySelector('#signup-email').value;
    const password = formSignup.querySelector('#signup-password').value;
    try {
      const cred = await registerEmail(email, password);
      // Create user document in firestore
      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        uid: cred.user.uid,
        email,
        displayName: name,
        photoURL: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        isAdmin: false,
        createdAt: serverTimestamp()
      });
      showToast('Account registered successfully!');
      closeAuthModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Google Login logic
  container.querySelector('#auth-google').addEventListener('click', async () => {
    try {
      const cred = await loginGoogle();
      const userRef = doc(db, 'users', cred.user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || 'TyroHub User',
          photoURL: cred.user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          isAdmin: false,
          createdAt: serverTimestamp()
        });
      }
      showToast('Signed in with Google!');
      closeAuthModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

export function closeAuthModal() {
  const container = document.getElementById('auth-modal-container');
  if (!container) return;

  const card = container.querySelector('.relative.w-full');
  if (card) {
    card.classList.add('scale-95', 'opacity-0');
    card.addEventListener('transitionend', () => {
      container.innerHTML = '';
      container.classList.add('pointer-events-none');
      container.style.opacity = '0';
    }, { once: true });
  }
}
