import { db, collection, addDoc, serverTimestamp, doc, updateDoc, increment, writeBatch } from '../firebase-config.js';
import { clearCart, navigate } from '../app.js';
import { showToast } from '../components/ui.js';

export async function render(state) {
  const cartItems = state.cart;

  if (cartItems.length === 0) {
    return `
      <div class="max-w-xl mx-auto px-6 py-20 text-center space-y-6 text-slate-300">
        <i class="ri-shopping-cart-2-line text-6xl text-slate-500"></i>
        <h2 class="text-2xl font-bold font-display text-white">Your Cart is Empty</h2>
        <p class="text-xs text-slate-400">Add configurations to your cart before proceeding to checkout.</p>
        <a href="/shop" class="px-6 py-3 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold text-xs text-white transition-colors inline-block">Browse Catalog</a>
      </div>
    `;
  }

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  // Default to Karachi (Free), else we update dynamically
  const initialShipping = 0;
  const initialTotal = subtotal + initialShipping;

  return `
    <div class="max-w-7xl mx-auto px-6 py-8 text-slate-300" id="checkout-view-container">
      
      <!-- Page Header -->
      <div class="mb-8 text-left">
        <h1 class="text-3xl font-black font-display text-white tracking-tight">Checkout</h1>
        <p class="text-slate-400 text-sm">Provide your shipping details and select a payment placeholder to complete your order.</p>
      </div>

      <!-- Main Layout Split -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Side: Shipping & Payments Form (lg:col-span-7) -->
        <div class="lg:col-span-7 p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 glass-card text-left space-y-6">
          <h3 class="font-bold text-white text-sm font-display uppercase tracking-wider border-b border-white/5 pb-3">Shipping Details</h3>
          
          <form id="checkout-shipping-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                <input type="text" id="chk-name" required placeholder="John Doe" value="${state.user?.displayName || ''}"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                <input type="tel" id="chk-phone" required placeholder="03001234567" value="${state.user?.phoneNumber || ''}"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <input type="email" id="chk-email" required placeholder="email@example.com" value="${state.user?.email || ''}"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Shipping Address</label>
                <input type="text" id="chk-address" required placeholder="Street / Apartment / Area" value="${state.user?.shippingAddress || ''}"
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">City</label>
                <select id="chk-city" class="w-full px-4 py-3 rounded-xl bg-brand-navy-900 border border-white/10 text-slate-300 focus:outline-none focus:border-brand-blue-500 cursor-pointer text-sm">
                  <option value="karachi">Karachi (Same-Day)</option>
                  <option value="lahore">Lahore</option>
                  <option value="islamabad">Islamabad</option>
                  <option value="rawalpindi">Rawalpindi</option>
                  <option value="peshawar">Peshawar</option>
                  <option value="faisalabad">Faisalabad</option>
                  <option value="other">Other City</option>
                </select>
              </div>
            </div>

            <!-- Shipping Note Alert -->
            <div id="shipping-alert" class="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <i class="ri-truck-line text-lg"></i>
              <span id="shipping-alert-text">Free same-day express delivery within Karachi!</span>
            </div>

            <!-- Payments Placeholders Options -->
            <div class="space-y-3 pt-4 border-t border-white/5">
              <h4 class="font-bold text-white text-xs font-display uppercase tracking-wider mb-2">Payment Method</h4>
              
              <div class="space-y-2 text-xs font-medium">
                <!-- COD -->
                <label class="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors text-slate-200">
                  <input type="radio" name="chk-payment" value="cod" checked class="mt-0.5 accent-brand-blue-500" />
                  <div>
                    <span class="font-bold text-white block">Cash on Delivery (COD)</span>
                    <span class="text-slate-400 text-[10px]">Pay with cash at your doorstep upon receiving the shipment.</span>
                  </div>
                </label>

                <!-- Easypaisa -->
                <label class="flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/10 cursor-pointer transition-colors text-slate-200">
                  <input type="radio" name="chk-payment" value="easypaisa" class="mt-0.5 accent-brand-blue-500" />
                  <div>
                    <span class="font-bold text-white block">Easypaisa</span>
                    <span class="text-slate-400 text-[10px] hidden" id="pay-details-easypaisa">Send transfer to Easypaisa Account: **03001234567** (Name: TyroHub Store). Paste reference ID in comments.</span>
                    <span class="text-slate-500 text-[10px]" id="pay-summary-easypaisa">Pay online via Easypaisa mobile wallet.</span>
                  </div>
                </label>

                <!-- JazzCash -->
                <label class="flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/10 cursor-pointer transition-colors text-slate-200">
                  <input type="radio" name="chk-payment" value="jazzcash" class="mt-0.5 accent-brand-blue-500" />
                  <div>
                    <span class="font-bold text-white block">JazzCash</span>
                    <span class="text-slate-400 text-[10px] hidden" id="pay-details-jazzcash">Send transfer to JazzCash Account: **03001234567** (Name: TyroHub Store). Paste reference ID in comments.</span>
                    <span class="text-slate-500 text-[10px]" id="pay-summary-jazzcash">Pay online via JazzCash mobile wallet.</span>
                  </div>
                </label>

                <!-- Bank Transfer -->
                <label class="flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/10 cursor-pointer transition-colors text-slate-200">
                  <input type="radio" name="chk-payment" value="bank_transfer" class="mt-0.5 accent-brand-blue-500" />
                  <div>
                    <span class="font-bold text-white block">Direct Bank Transfer</span>
                    <span class="text-slate-400 text-[10px] hidden" id="pay-details-bank_transfer">Bank: **Habib Bank Limited (HBL)**<br/>Account Number: **1234-56789-0123**<br/>Title: **TyroHub Technologies**<br/>Branch Code: **0542**. Send proof on WhatsApp.</span>
                    <span class="text-slate-500 text-[10px]" id="pay-summary-bank_transfer">Transfer directly from your bank application.</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Order Notes & Transfer Reference ID (Optional)</label>
              <textarea id="chk-notes" rows="2" placeholder="Instructions for courier, or online payment reference code..."
                class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-xs"></textarea>
            </div>

          </form>
        </div>

        <!-- Right Side: Order Summary items (lg:col-span-5) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Summary card -->
          <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 glass-card text-left space-y-6">
            <h3 class="font-bold text-white text-sm font-display uppercase tracking-wider border-b border-white/5 pb-3">Line Items</h3>
            
            <div class="max-h-60 overflow-y-auto space-y-3.5 pr-2">
              ${cartItems.map(item => `
                <div class="flex items-center justify-between gap-4 text-xs font-medium">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-8 rounded bg-white/5 p-1 flex items-center justify-center flex-shrink-0">
                      <img src="${item.imageUrl}" alt="${item.title}" class="max-h-full max-w-full object-contain" />
                    </div>
                    <div class="text-left">
                      <h4 class="text-white font-semibold line-clamp-1 max-w-[150px] sm:max-w-[200px]">${item.title}</h4>
                      <span class="text-[10px] text-slate-500">Qty: ${item.quantity}</span>
                    </div>
                  </div>
                  <span class="text-white font-bold font-display">PKR ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              `).join('')}
            </div>

            <div class="h-px bg-white/5"></div>

            <!-- Totals -->
            <div class="space-y-3.5 text-xs font-medium text-slate-400">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="text-white font-bold font-display">PKR ${subtotal.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span>Shipping Cost</span>
                <span id="summary-shipping" class="text-emerald-400 font-bold font-display uppercase">Free</span>
              </div>
              <div class="h-px bg-white/5 my-1.5"></div>
              <div class="flex justify-between text-sm">
                <span class="text-white font-bold">Total Payable</span>
                <span id="summary-total" class="text-brand-blue-500 font-black font-display text-base">PKR ${initialTotal.toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" form="checkout-shipping-form" id="btn-place-order" class="w-full py-4 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-bold text-sm transition-all duration-200 shadow-glow-blue hover:shadow-brand-blue-500/50 flex items-center justify-center gap-2">
              <i class="ri-checkbox-circle-line text-lg"></i>
              <span>Place Order</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  `;
}

export async function init(state, navigateCallback) {
  const form = document.getElementById('checkout-shipping-form');
  if (!form) return;

  const cartItems = state.cart;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const citySelector = document.getElementById('chk-city');
  const summaryShipping = document.getElementById('summary-shipping');
  const summaryTotal = document.getElementById('summary-total');
  const shippingAlert = document.getElementById('shipping-alert');
  const shippingAlertText = document.getElementById('shipping-alert-text');
  const submitBtn = document.getElementById('btn-place-order');

  let currentShipping = 0;

  // City change handler for dynamic shipping computation
  if (citySelector && summaryShipping && summaryTotal && shippingAlert && shippingAlertText) {
    citySelector.addEventListener('change', () => {
      const city = citySelector.value;
      if (city === 'karachi') {
        currentShipping = 0;
        summaryShipping.textContent = "Free";
        summaryShipping.className = "text-emerald-400 font-bold font-display uppercase";
        shippingAlert.className = "p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium flex items-center gap-2";
        shippingAlertText.innerHTML = "Free same-day express delivery within Karachi!";
      } else {
        currentShipping = 500;
        summaryShipping.textContent = "PKR 500";
        summaryShipping.className = "text-white font-bold font-display";
        shippingAlert.className = "p-3 rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/5 text-brand-blue-400 text-xs font-medium flex items-center gap-2";
        shippingAlertText.innerHTML = "Insured courier shipping. Arrives in 2-3 business days.";
      }

      const total = subtotal + currentShipping;
      summaryTotal.textContent = `PKR ${total.toLocaleString()}`;
    });
  }

  // Radios payment details expanders
  const payRadios = document.getElementsByName('chk-payment');
  payRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      // Hide all details
      document.getElementById('pay-details-easypaisa').classList.add('hidden');
      document.getElementById('pay-details-jazzcash').classList.add('hidden');
      document.getElementById('pay-details-bank_transfer').classList.add('hidden');
      document.getElementById('pay-summary-easypaisa').classList.remove('hidden');
      document.getElementById('pay-summary-jazzcash').classList.remove('hidden');
      document.getElementById('pay-summary-bank_transfer').classList.remove('hidden');

      const selected = radio.value;
      if (selected !== 'cod') {
        document.getElementById(`pay-details-${selected}`).classList.remove('hidden');
        document.getElementById(`pay-summary-${selected}`).classList.add('hidden');
      }
    });
  });

  // Submit form trigger (Place Order)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('chk-name').value.trim();
    const phone = document.getElementById('chk-phone').value.trim();
    const email = document.getElementById('chk-email').value.trim();
    const address = document.getElementById('chk-address').value.trim();
    const city = citySelector.value;
    const payment = document.querySelector('input[name="chk-payment"]:checked')?.value || 'cod';
    const notes = document.getElementById('chk-notes').value.trim();

    if (!name || !phone || !email || !address) {
      showToast('Please fill out all shipping details', 'error');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Processing Order...</span>
      `;

      // 1. Transactional check and stock decrement using Firestore Batch writes
      const batch = writeBatch(db);
      
      // We will loop over cart items and queue up updates to decrement stock.
      // Note: For custom items or seed items, their docs might not exist in the online DB.
      // We will check and update their stock online.
      for (const item of cartItems) {
        const prodRef = doc(db, 'products', item.productId);
        
        try {
          const snap = await getDoc(prodRef);
          if (snap.exists()) {
            const currentStock = snap.data().stock || 0;
            if (currentStock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.title}. Only ${currentStock} left.`);
            }
            batch.update(prodRef, {
              stock: increment(-item.quantity)
            });
          }
        } catch (snapErr) {
          // If product document does not exist, let it bypass or update silently
          console.warn(`Product reference not found online during stock check: ${item.productId}`);
        }
      }

      // Execute stock decrements
      await batch.commit();

      // 2. Write Order document into Firestore 'orders' collection
      const orderData = {
        userId: state.user ? state.user.uid : 'guest',
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: `${address}, ${city.toUpperCase()}`,
        items: cartItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        totalAmount: subtotal + currentShipping,
        paymentMethod: payment,
        status: 'pending',
        trackingNumber: null,
        notes: notes || '',
        createdAt: serverTimestamp()
      };

      const ordersRef = collection(db, 'orders');
      const placedOrder = await addDoc(ordersRef, orderData);

      showToast('🎉 Order placed successfully!');
      
      // 3. Clear cart globally
      await clearCart();

      // 4. Redirect customer to their dashboard if logged in, else show success notice page
      if (state.user) {
        navigate('/dashboard');
      } else {
        // Show success splash page directly in content area
        const appContent = document.getElementById('app-content');
        if (appContent) {
          appContent.innerHTML = `
            <div class="max-w-xl mx-auto px-6 py-20 text-center space-y-6 text-slate-300">
              <div class="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-4xl mx-auto">
                <i class="ri-checkbox-circle-line"></i>
              </div>
              <h1 class="text-3xl font-black font-display text-white">Order Confirmed!</h1>
              <p class="text-slate-400 text-sm">Thank you for your order, **${name}**. We have logged your transaction under reference ID: <span class="text-brand-blue-400 font-mono text-xs block mt-1">${placedOrder.id}</span></p>
              <p class="text-xs text-slate-500 leading-relaxed">Our dispatch engineers will review the configurations, test components, and courier your package. Total payable amount is **PKR ${(subtotal + currentShipping).toLocaleString()}** via **${payment.toUpperCase()}**.</p>
              
              <div class="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <a href="/shop" id="guest-success-shop" class="px-6 py-3 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-bold text-xs transition-colors shadow-glow-blue w-full sm:w-auto">Shop Laptops</a>
                <a href="https://wa.me/923001234567?text=Hi%20TyroHub!%20My%20order%20ID%20is%20${placedOrder.id}" target="_blank" class="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs transition-colors w-full sm:w-auto flex items-center justify-center gap-1.5">
                  <i class="ri-whatsapp-line text-emerald-500"></i>
                  <span>Track on WhatsApp</span>
                </a>
              </div>
            </div>
          `;
          // Bind shop link
          appContent.querySelector('#guest-success-shop').addEventListener('click', (e) => {
            e.preventDefault();
            navigate('/shop');
          });
        }
      }

    } catch (err) {
      console.error('Order checkout error:', err);
      showToast(err.message || 'Could not place order. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <i class="ri-checkbox-circle-line text-lg"></i>
        <span>Place Order</span>
      `;
    }
  });
}
