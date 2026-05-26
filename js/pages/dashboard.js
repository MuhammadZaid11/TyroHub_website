import { db, collection, getDocs, query, where, orderBy, doc, updateDoc } from '../firebase-config.js';
import { updateState } from '../app.js';
import { showToast } from '../components/ui.js';

export async function render(state) {
  return `
    <div class="max-w-7xl mx-auto px-6 py-8 text-slate-300" id="dashboard-page-container">
      
      <!-- Page Title -->
      <div class="mb-8 text-left">
        <h1 class="text-3xl font-black font-display text-white tracking-tight">Your Dashboard</h1>
        <p class="text-slate-400 text-sm">Manage your profile, shipping addresses, and track active order deliveries.</p>
      </div>

      <!-- Layout Grid Split -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left Sidebar: Profile Details & Editor (lg:col-span-4) -->
        <aside class="lg:col-span-4 space-y-6">
          <!-- Profile View Card -->
          <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 glass-card text-left space-y-6" id="profile-display-card">
            <div class="flex items-center gap-4">
              <img src="${state.user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" 
                alt="${state.user?.displayName}" class="w-16 h-16 rounded-2xl object-cover border border-white/10" />
              <div>
                <h3 class="font-bold text-white text-base md:text-lg font-display truncate max-w-[180px]">${state.user?.displayName}</h3>
                <span class="text-[10px] text-brand-blue-400 font-bold uppercase tracking-wider">TyroHub Customer</span>
              </div>
            </div>

            <div class="h-px bg-white/5"></div>

            <div class="space-y-4 text-xs font-semibold">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Email Address</span>
                <span class="text-slate-300">${state.user?.email}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Contact Number</span>
                <span class="text-slate-300">${state.user?.phoneNumber || '<span class="text-slate-600 font-normal italic">Not provided</span>'}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Default Shipping Address</span>
                <span class="text-slate-300 block leading-relaxed">${state.user?.shippingAddress || '<span class="text-slate-600 font-normal italic">Not provided</span>'}</span>
              </div>
            </div>

            <button id="btn-edit-profile" class="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs text-white transition-colors">
              Edit Account Info
            </button>
          </div>

          <!-- Profile Editor Card (Hidden by default) -->
          <div class="p-6 rounded-2xl border border-brand-blue-500/25 bg-brand-navy-900/50 glass-card text-left space-y-5 hidden" id="profile-editor-card">
            <h3 class="font-bold text-white text-sm font-display uppercase tracking-wider border-b border-white/5 pb-2">Edit Account Info</h3>
            
            <form id="profile-editor-form" class="space-y-4 text-xs">
              <div>
                <label class="block text-slate-500 font-semibold mb-1 uppercase">Full Name</label>
                <input type="text" id="edit-name" required value="${state.user?.displayName || ''}"
                  class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors" />
              </div>
              <div>
                <label class="block text-slate-500 font-semibold mb-1 uppercase">Phone Number</label>
                <input type="tel" id="edit-phone" placeholder="e.g. 03001234567" value="${state.user?.phoneNumber || ''}"
                  class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors" />
              </div>
              <div>
                <label class="block text-slate-500 font-semibold mb-1 uppercase">Shipping Address</label>
                <textarea id="edit-address" rows="3" placeholder="Street / House / Area..."
                  class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors">${state.user?.shippingAddress || ''}</textarea>
              </div>

              <div class="flex gap-2.5 pt-2">
                <button type="button" id="btn-cancel-edit" class="flex-1 py-3 rounded-xl border border-white/5 hover:bg-white/5 font-bold text-[10px] text-slate-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" id="btn-save-profile" class="flex-1 py-3 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-bold text-[10px] text-white transition-colors shadow-glow-blue">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </aside>

        <!-- Right Side: Order Transaction History (lg:col-span-8) -->
        <section class="lg:col-span-8 space-y-6">
          <h2 class="text-xl font-bold font-display text-white text-left">Your Order History</h2>

          <div class="space-y-5 text-left" id="dashboard-orders-list">
            <!-- Loading indicator initially -->
            <div class="p-12 text-center text-slate-500 text-sm">
              <svg class="animate-spin h-6 w-6 mx-auto mb-2 text-brand-blue-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading purchase logs...</span>
            </div>
          </div>
        </section>

      </div>

    </div>
  `;
}

export async function init(state, navigateCallback) {
  const displayCard = document.getElementById('profile-display-card');
  const editorCard = document.getElementById('profile-editor-card');
  const editBtn = document.getElementById('btn-edit-profile');
  const cancelBtn = document.getElementById('btn-cancel-edit');
  const editorForm = document.getElementById('profile-editor-form');

  // Toggle View/Edit account info cards
  if (editBtn && cancelBtn && displayCard && editorCard) {
    editBtn.addEventListener('click', () => {
      displayCard.classList.add('hidden');
      editorCard.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
      editorCard.classList.add('hidden');
      displayCard.classList.remove('hidden');
    });
  }

  // Profile Form update submit handler
  if (editorForm) {
    editorForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('edit-name').value.trim();
      const phone = document.getElementById('edit-phone').value.trim();
      const address = document.getElementById('edit-address').value.trim();
      const saveBtn = document.getElementById('btn-save-profile');

      if (!name) {
        showToast('Full name is required', 'error');
        return;
      }

      try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const userDocRef = doc(db, 'users', state.user.uid);
        const updatedFields = {
          displayName: name,
          phoneNumber: phone || null,
          shippingAddress: address || null
        };

        // Write to Firestore db users profile
        await updateDoc(userDocRef, updatedFields);
        
        // Sync local global state user
        const mergedUser = { ...state.user, ...updatedFields };
        updateState({ user: mergedUser });

        showToast('🎉 Account profile updated!');
      } catch (err) {
        console.error('Error updating user profile:', err);
        showToast('Failed to update details. Try again.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    });
  }

  // Query order purchase logs from Firestore
  const listContainer = document.getElementById('dashboard-orders-list');
  if (!listContainer) return;

  try {
    const ordersRef = collection(db, 'orders');
    // Fetch orders
    const q = query(ordersRef, where('userId', '==', state.user.uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const orders = [];
    
    snap.forEach(docSnap => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (orders.length === 0) {
      listContainer.innerHTML = `
        <div class="p-12 text-center rounded-2xl border border-white/5 bg-brand-navy-900/20 text-slate-500">
          <i class="ri-inbox-archive-line text-4xl mb-2 block"></i>
          <span class="text-sm font-semibold">You haven't placed any orders yet.</span>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = orders.map(order => {
      const date = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent';
      
      // Status badges coloring
      let statusColorClass = 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      if (order.status === 'processing') statusColorClass = 'bg-brand-blue-500/10 border-brand-blue-500/20 text-brand-blue-400';
      if (order.status === 'shipped') statusColorClass = 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      if (order.status === 'delivered') statusColorClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      if (order.status === 'cancelled') statusColorClass = 'bg-rose-500/10 border-rose-500/20 text-rose-500';

      return `
        <div class="rounded-2xl border border-white/5 bg-brand-navy-900/40 p-5 space-y-4 hover:border-white/10 transition-colors">
          
          <!-- Order ID / Date & Status block -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-slate-500 uppercase tracking-tight">Order ID</span>
                <span class="text-xs font-mono font-bold text-white">${order.id}</span>
              </div>
              <span class="text-[10px] text-slate-500 block mt-0.5">Placed on ${date}</span>
            </div>
            
            <div class="flex flex-wrap gap-2 items-center">
              <!-- Tracking information -->
              ${order.trackingNumber ? `
                <span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                  Tracking: ${order.trackingNumber}
                </span>
              ` : ''}
              <span class="px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${statusColorClass}">
                ${order.status}
              </span>
            </div>
          </div>

          <!-- Items Row -->
          <div class="space-y-3.5 max-h-40 overflow-y-auto">
            ${order.items.map(item => `
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-7 rounded bg-white/5 p-1 flex items-center justify-center flex-shrink-0">
                    <img src="${item.imageUrl || 'images/hero_laptop.png'}" alt="${item.title}" class="max-h-full max-w-full object-contain" />
                  </div>
                  <div class="text-left">
                    <h5 class="text-white font-semibold line-clamp-1 max-w-[200px]">${item.title}</h5>
                    <span class="text-[9px] text-slate-500">Qty: ${item.quantity} · Price: PKR ${item.price.toLocaleString()}</span>
                  </div>
                </div>
                <span class="font-bold text-slate-300 font-display">PKR ${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>

          <!-- Summary footer -->
          <div class="flex justify-between items-center pt-3 border-t border-white/5 text-xs">
            <span class="text-slate-500 font-bold">Payment: ${order.paymentMethod.toUpperCase()}</span>
            <div class="text-right">
              <span class="text-slate-500 mr-2">Total Amount</span>
              <span class="font-black text-brand-blue-400 font-display text-sm">PKR ${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error fetching order logs on dashboard:', err);
    listContainer.innerHTML = `
      <div class="p-6 text-center text-rose-500 border border-rose-500/10 bg-rose-500/5 rounded-2xl text-xs">
        <i class="ri-error-warning-line text-2xl mb-1.5 block"></i>
        <span>Firestore Error: Could not compile purchase orders. Make sure you have indexes enabled or network coverage.</span>
      </div>
    `;
  }
}
