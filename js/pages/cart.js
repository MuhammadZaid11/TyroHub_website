import { updateCartQty, removeFromCart, navigate } from '../app.js';

export async function render(state) {
  const cartItems = state.cart;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 0 : 0; // Free delivery promo!
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return `
      <div class="max-w-xl mx-auto px-6 py-20 text-center space-y-6 text-slate-300">
        <div class="w-20 h-20 rounded-full bg-brand-blue-500/10 text-brand-blue-400 flex items-center justify-center text-4xl mx-auto">
          <i class="ri-shopping-cart-2-line"></i>
        </div>
        <h1 class="text-3xl font-black font-display text-white">Your Cart is Empty</h1>
        <p class="text-slate-400 text-sm">You haven't added any laptop configurations to your cart yet. Visit the catalog to customize your machine.</p>
        <a href="/shop" id="cart-empty-shop-now" class="px-8 py-4 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold text-sm transition-all duration-200 shadow-glow-blue inline-flex items-center gap-2 text-white">
          <i class="ri-grid-line"></i>
          <span>Shop Laptops Now</span>
        </a>
      </div>
    `;
  }

  return `
    <div class="max-w-7xl mx-auto px-6 py-8 text-slate-300" id="cart-view-container">
      
      <!-- Header -->
      <div class="mb-8 text-left">
        <h1 class="text-3xl font-black font-display text-white tracking-tight">Shopping Cart</h1>
        <p class="text-slate-400 text-sm">Review your selected computing rigs and accessories before checking out.</p>
      </div>

      <!-- Layout Split -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Cart Items List (lg:col-span-8) -->
        <div class="lg:col-span-8 space-y-4 text-left">
          ${cartItems.map(item => {
            return `
              <div class="p-5 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/15 transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
                
                <!-- Product Thumb and Details -->
                <div class="flex items-center gap-4 w-full sm:w-auto">
                  <div class="w-20 h-16 rounded-xl bg-white/5 p-2 flex items-center justify-center flex-shrink-0">
                    <img src="${item.imageUrl}" alt="${item.title}" class="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h3 class="font-bold text-white text-sm sm:text-base line-clamp-1">${item.title}</h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Laptop Config</p>
                  </div>
                </div>

                <!-- Price, Qty and Subtotal Controls -->
                <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  
                  <!-- Price -->
                  <div class="text-left sm:text-right min-w-[100px]">
                    <span class="text-[10px] text-slate-500 block">Unit Price</span>
                    <span class="text-sm font-bold text-slate-200 font-display">PKR ${item.price.toLocaleString()}</span>
                  </div>

                  <!-- Qty widget -->
                  <div class="flex items-center border border-white/10 rounded-xl bg-white/5">
                    <button class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors qty-dec-btn" data-cart-id="${item.productId}">
                      <i class="ri-subtract-line text-xs font-bold"></i>
                    </button>
                    <span class="w-8 text-center font-bold text-xs text-white">${item.quantity}</span>
                    <button class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors qty-inc-btn" data-cart-id="${item.productId}">
                      <i class="ri-add-line text-xs font-bold"></i>
                    </button>
                  </div>

                  <!-- Subtotal -->
                  <div class="text-right min-w-[110px] hidden sm:block">
                    <span class="text-[10px] text-slate-500 block">Subtotal</span>
                    <span class="text-sm font-black text-white font-display">PKR ${(item.price * item.quantity).toLocaleString()}</span>
                  </div>

                  <!-- Remove Action -->
                  <button class="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all remove-cart-btn" data-cart-id="${item.productId}" aria-label="Remove item">
                    <i class="ri-delete-bin-line"></i>
                  </button>

                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- Checkout Summary Card (lg:col-span-4) -->
        <aside class="lg:col-span-4 p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 glass-card text-left space-y-6">
          <h3 class="font-bold text-white text-sm font-display uppercase tracking-wider border-b border-white/5 pb-3">Order Summary</h3>

          <div class="space-y-4 text-xs font-medium text-slate-400">
            <div class="flex justify-between">
              <span>Cart Subtotal</span>
              <span class="text-white font-bold font-display">PKR ${subtotal.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span>Shipping Fee</span>
              <span class="text-emerald-400 font-bold font-display uppercase tracking-wide">Free (Promo)</span>
            </div>
            <div class="flex justify-between text-slate-500 pb-2">
              <span>Delivery Location</span>
              <span class="text-slate-400">Pakistan Insured</span>
            </div>
            
            <div class="h-px bg-white/5"></div>
            
            <div class="flex justify-between text-sm pt-2">
              <span class="text-white font-bold">Total Amount</span>
              <span class="text-brand-blue-500 font-black font-display text-base">PKR ${total.toLocaleString()}</span>
            </div>
          </div>

          <div class="space-y-3">
            <button id="cart-btn-checkout" class="w-full py-4 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-bold text-sm transition-all duration-200 shadow-glow-blue hover:shadow-brand-blue-500/50 flex items-center justify-center gap-2">
              <span>Proceed to Checkout</span>
              <i class="ri-arrow-right-line"></i>
            </button>
            <a href="/shop" id="cart-btn-continue" class="w-full py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-semibold text-xs text-center block transition-all">
              Continue Shopping
            </a>
          </div>

          <!-- Trust highlights -->
          <div class="pt-4 border-t border-white/5 text-[10px] text-slate-500 font-semibold space-y-2 flex flex-col justify-start">
            <span class="flex items-center gap-2"><i class="ri-lock-2-line text-brand-blue-500 text-sm"></i> Insured dispatch and tracking</span>
            <span class="flex items-center gap-2"><i class="ri-shield-check-line text-brand-blue-500 text-sm"></i> Official 12-Month TyroHub warranty</span>
          </div>

        </aside>

      </div>

    </div>
  `;
}

export async function init(state, navigateCallback) {
  // Bind simple empty shop CTA
  const emptyShopBtn = document.getElementById('cart-empty-shop-now');
  if (emptyShopBtn) {
    emptyShopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateCallback('/shop');
    });
  }

  // Bind Checkout & Continue buttons
  const checkoutBtn = document.getElementById('cart-btn-checkout');
  const continueBtn = document.getElementById('cart-btn-continue');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      navigateCallback('/checkout');
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateCallback('/shop');
    });
  }

  // Bind Line items buttons
  bindCartRowEvents(state, navigateCallback);

  // Set up real-time listener to repaint Cart when other scripts alter global state
  const handleUpdate = async () => {
    const container = document.getElementById('app-content');
    if (container && state.currentPath === '/cart') {
      container.innerHTML = await render(state);
      init(state, navigateCallback);
    }
  };

  window.addEventListener('state-updated', handleUpdate);
}

function bindCartRowEvents(state, navigateCallback) {
  // Increment Qty click
  document.querySelectorAll('.qty-inc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cartId;
      const item = state.cart.find(i => i.productId === id);
      if (item) {
        updateCartQty(id, item.quantity + 1);
      }
    });
  });

  // Decrement Qty click
  document.querySelectorAll('.qty-dec-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cartId;
      const item = state.cart.find(i => i.productId === id);
      if (item && item.quantity > 1) {
        updateCartQty(id, item.quantity - 1);
      }
    });
  });

  // Remove row click
  document.querySelectorAll('.remove-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.cartId;
      removeFromCart(id);
    });
  });

  // Bind details link navigation
  document.querySelectorAll('#cart-view-container a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) navigateCallback(href);
    });
  });
}
