import { onAuthChange, db, doc, getDoc, setDoc, updateDoc } from './firebase-config.js';
import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderFooter, initFooter } from './components/footer.js';
import { showToast } from './components/ui.js';

// Static view imports
import { render as renderHome, init as initHome } from './pages/home.js';
import { render as renderShop, init as initShop } from './pages/shop.js';
import { render as renderProduct, init as initProduct } from './pages/product.js';
import { render as renderCart, init as initCart } from './pages/cart.js';
import { render as renderCheckout, init as initCheckout } from './pages/checkout.js';
import { render as renderDashboard, init as initDashboard } from './pages/dashboard.js';
import { render as renderAdmin, init as initAdmin } from './pages/admin.js';
import { render as renderAbout, init as initAbout } from './pages/about.js';
import { render as renderContact, init as initContact } from './pages/contact.js';
import { render as renderFaq, init as initFaq } from './pages/faq.js';

// Global application state
export const state = {
  user: null,
  cart: [],
  wishlist: [],
  theme: localStorage.getItem('tyrohub-theme') || 'dark',
  currentPath: window.location.pathname,
  searchQuery: '',
  routeParams: {}
};

// Initialize theme attribute on HTML element
document.documentElement.setAttribute('data-theme', state.theme);

// Global state functions
export function updateState(newState) {
  Object.assign(state, newState);
  renderShell();
}

// Render Header/Footer shell components
export function renderShell() {
  renderNavbar(state);
  initNavbar(state, navigate);
  renderFooter(state);
  initFooter(state, navigate);
}

// Add/Sync actions
export async function addToCart(product, quantity = 1) {
  const existing = state.cart.find(item => item.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      productId: product.id,
      title: product.title,
      price: product.salePrice || product.price,
      quantity: quantity,
      imageUrl: product.imageUrls?.[0] || 'images/hero_laptop.png'
    });
  }
  showToast(`Added ${product.title} to Cart`);
  await syncCartAndWishlist();
  renderShell();
  // Trigger update on current page if it is the cart or checkout page
  triggerPageUpdate();
}

export async function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.productId !== productId);
  showToast('Removed item from Cart');
  await syncCartAndWishlist();
  renderShell();
  triggerPageUpdate();
}

export async function updateCartQty(productId, qty) {
  const item = state.cart.find(i => i.productId === productId);
  if (item) {
    item.quantity = Math.max(1, qty);
    await syncCartAndWishlist();
    renderShell();
    triggerPageUpdate();
  }
}

export async function clearCart() {
  state.cart = [];
  await syncCartAndWishlist();
  renderShell();
  triggerPageUpdate();
}

export async function toggleWishlist(productId, title = 'Product') {
  const index = state.wishlist.indexOf(productId);
  if (index === -1) {
    state.wishlist.push(productId);
    showToast(`Added ${title} to Wishlist ❤️`);
  } else {
    state.wishlist.splice(index, 1);
    showToast(`Removed ${title} from Wishlist`);
  }
  await syncCartAndWishlist();
  renderShell();
  triggerPageUpdate();
}

// Synchronize state data with Firestore or LocalStorage
async function syncCartAndWishlist() {
  if (state.user) {
    try {
      // Sync Cart to Firestore
      const cartRef = doc(db, 'cart', state.user.uid);
      await setDoc(cartRef, {
        items: state.cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          title: item.title,
          price: item.price,
          imageUrl: item.imageUrl
        })),
        updatedAt: new Date()
      });

      // Sync Wishlist to Firestore
      const wishlistRef = doc(db, 'wishlist', state.user.uid);
      await setDoc(wishlistRef, {
        productIds: state.wishlist,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error syncing online state:', err);
    }
  } else {
    // Guest cache in LocalStorage
    localStorage.setItem('tyrohub-cart', JSON.stringify(state.cart));
    localStorage.setItem('tyrohub-wishlist', JSON.stringify(state.wishlist));
  }
}

function triggerPageUpdate() {
  // Simple listener triggers for hot updates in views without complete route reload
  const event = new CustomEvent('state-updated');
  window.dispatchEvent(event);
}

// Client Side Router logic
export async function navigate(path, pushState = true) {
  // Parse path and query parameters
  const url = new URL(path, window.location.origin);
  const cleanPath = url.pathname;
  state.currentPath = cleanPath;
  state.searchQuery = url.searchParams.get('search') || '';

  // Extract Route parameters
  state.routeParams = {};
  let matchedView = null;
  let pageTitle = 'TyroHub — Premium Laptops';
  let pageDesc = 'TyroHub laptop store';

  if (cleanPath === '/' || cleanPath === '/index.html') {
    matchedView = { render: renderHome, init: initHome };
    pageTitle = 'TyroHub — Premium Laptops for Developers, Students & Professionals';
    pageDesc = 'Pakistan\'s modern laptop brand. Premium laptops with official warranty and fast shipping.';
  } else if (cleanPath === '/shop') {
    matchedView = { render: renderShop, init: initShop };
    pageTitle = 'Shop Premium Laptops & Tech Accessories | TyroHub';
    pageDesc = 'Browse our collection of developer laptops, refurbished business rigs, gaming workstations, and accessories.';
  } else if (cleanPath.startsWith('/product/')) {
    const parts = cleanPath.split('/');
    state.routeParams.id = parts[2];
    matchedView = { render: renderProduct, init: initProduct };
    pageTitle = 'Laptop Details | TyroHub';
  } else if (cleanPath === '/cart') {
    matchedView = { render: renderCart, init: initCart };
    pageTitle = 'Your Shopping Cart | TyroHub';
  } else if (cleanPath === '/checkout') {
    matchedView = { render: renderCheckout, init: initCheckout };
    pageTitle = 'Secure Checkout | TyroHub';
  } else if (cleanPath === '/dashboard') {
    matchedView = { render: renderDashboard, init: initDashboard };
    pageTitle = 'User Profile & Orders Dashboard | TyroHub';
  } else if (cleanPath === '/admin') {
    matchedView = { render: renderAdmin, init: initAdmin };
    pageTitle = 'TyroHub Admin Control Center';
  } else if (cleanPath === '/about') {
    matchedView = { render: renderAbout, init: initAbout };
    pageTitle = 'Our Story & Warranty Guidelines | TyroHub';
  } else if (cleanPath === '/contact') {
    matchedView = { render: renderContact, init: initContact };
    pageTitle = 'Contact Us | TyroHub Karachi';
  } else if (cleanPath === '/faq') {
    matchedView = { render: renderFaq, init: initFaq };
    pageTitle = 'Frequently Asked Questions | TyroHub';
  }

  // Handle protected admin routing
  if (cleanPath === '/admin') {
    if (!state.user) {
      showToast('Please sign in to access Admin features', 'info');
      navigate('/');
      return;
    }
    if (!state.user.isAdmin) {
      showToast('Unauthorized access. Admin privileges required.', 'error');
      navigate('/');
      return;
    }
  }

  // Handle protected dashboard routing
  if (cleanPath === '/dashboard') {
    if (!state.user) {
      showToast('Please sign in to access your Account Dashboard', 'info');
      navigate('/');
      return;
    }
  }

  // Push history entry
  if (pushState) {
    window.history.pushState({}, '', path);
  }

  // Update SEO head metadata
  document.title = pageTitle;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', pageDesc);

  // Render header & footer highlights
  renderShell();

  // Render view
  const appContent = document.getElementById('app-content');
  if (appContent && matchedView) {
    window.scrollTo(0, 0);
    appContent.innerHTML = await matchedView.render(state);
    await matchedView.init(state, navigate);
  } else {
    // 404 fallback
    appContent.innerHTML = `
      <div class="max-w-md mx-auto text-center py-20">
        <h1 class="text-6xl font-black text-brand-blue-500 mb-4 font-display">404</h1>
        <p class="text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" class="px-6 py-3 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold transition-colors">Go Back Home</a>
      </div>
    `;
    // Bind click back home
    appContent.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/');
    });
  }
}

// Merge guest data to Firestore upon login
async function mergeGuestData(userId) {
  try {
    const localCart = JSON.parse(localStorage.getItem('tyrohub-cart') || '[]');
    const localWishlist = JSON.parse(localStorage.getItem('tyrohub-wishlist') || '[]');

    if (localCart.length > 0) {
      const cartRef = doc(db, 'cart', userId);
      const cartDoc = await getDoc(cartRef);
      let mergedCart = localCart;

      if (cartDoc.exists()) {
        const onlineCart = cartDoc.data().items || [];
        // Merge carts
        onlineCart.forEach(onlineItem => {
          const match = mergedCart.find(i => i.productId === onlineItem.productId);
          if (match) {
            match.quantity = Math.max(match.quantity, onlineItem.quantity);
          } else {
            mergedCart.push(onlineItem);
          }
        });
      }
      
      await setDoc(cartRef, {
        items: mergedCart,
        updatedAt: new Date()
      });
      state.cart = mergedCart;
      localStorage.removeItem('tyrohub-cart');
    }

    if (localWishlist.length > 0) {
      const wishlistRef = doc(db, 'wishlist', userId);
      const wishlistDoc = await getDoc(wishlistRef);
      let mergedWish = localWishlist;

      if (wishlistDoc.exists()) {
        const onlineWish = wishlistDoc.data().productIds || [];
        mergedWish = [...new Set([...localWishlist, ...onlineWish])];
      }

      await setDoc(wishlistRef, {
        productIds: mergedWish,
        updatedAt: new Date()
      });
      state.wishlist = mergedWish;
      localStorage.removeItem('tyrohub-wishlist');
    }
  } catch (err) {
    console.error('Error merging local guest data on authentication:', err);
  }
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Sync router actions on forward/back button clicks
  window.addEventListener('popstate', () => {
    navigate(window.location.pathname + window.location.search, false);
  });

  // Watch Authentication session changes
  onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Fetch extended user profile information
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        let profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'TyroHub User',
          photoURL: firebaseUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          isAdmin: false
        };

        if (userDoc.exists()) {
          profile = { ...profile, ...userDoc.data() };
        } else {
          // Pre-seed user if document does not exist (e.g. Google Login first time)
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: profile.displayName,
            photoURL: profile.photoURL,
            isAdmin: false,
            createdAt: new Date()
          });
        }

        state.user = profile;

        // Merge guest localStorage data
        await mergeGuestData(firebaseUser.uid);

        // Fetch online cart
        const cartDoc = await getDoc(doc(db, 'cart', firebaseUser.uid));
        state.cart = cartDoc.exists() ? (cartDoc.data().items || []) : [];

        // Fetch online wishlist
        const wishDoc = await getDoc(doc(db, 'wishlist', firebaseUser.uid));
        state.wishlist = wishDoc.exists() ? (wishDoc.data().productIds || []) : [];

      } catch (err) {
        console.error('Error compiling authenticated user session:', err);
        showToast('Error syncing user details.', 'error');
      }
    } else {
      // User is logged out
      state.user = null;
      // Load from LocalStorage
      state.cart = JSON.parse(localStorage.getItem('tyrohub-cart') || '[]');
      state.wishlist = JSON.parse(localStorage.getItem('tyrohub-wishlist') || '[]');
    }

    // Refresh navbar/footer layout
    renderShell();
    
    // Execute routing for the current path
    navigate(window.location.pathname + window.location.search, false);
  });
});
