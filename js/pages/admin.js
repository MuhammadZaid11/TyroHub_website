import { db, storage, collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '../firebase-config.js';
import { seedProducts } from '../seed-data.js';
import { showToast } from '../components/ui.js';

export async function render(state) {
  return `
    <div class="max-w-7xl mx-auto px-6 py-8 text-slate-300">
      
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 text-left border-b border-white/5 pb-6">
        <div>
          <h1 class="text-3xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <span>Control Center</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-brand-blue-500/20 text-brand-blue-400 tracking-widest">Admin</span>
          </h1>
          <p class="text-slate-400 text-sm">Monitor business analytics, catalog entries, customer shipments, and user privileges.</p>
        </div>

        <!-- Dashboard tabs navigation -->
        <div class="flex flex-wrap gap-2 text-xs font-semibold" id="admin-tabs">
          <button data-tab="analytics" class="px-4 py-2.5 rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/10 text-white active-tab">Overview</button>
          <button data-tab="products" class="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white">Products</button>
          <button data-tab="orders" class="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white">Orders</button>
          <button data-tab="users" class="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white">Users</button>
        </div>
      </div>

      <!-- Main Dynamic Content Box -->
      <div id="admin-panel-content">
        <!-- Analytics Loader initially -->
        <div class="p-12 text-center text-slate-500">
          <svg class="animate-spin h-8 w-8 mx-auto mb-2 text-brand-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Aggregating statistics data...</span>
        </div>
      </div>

    </div>
  `;
}

// Global cached datasets within admin session to avoid redundant database reads
let productsList = [];
let ordersList = [];
let usersList = [];

export async function init(state, navigateCallback) {
  // Bind tab switching
  const tabs = document.querySelectorAll('#admin-tabs button');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.className = 'px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white');
      btn.className = 'px-4 py-2.5 rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/10 text-white font-bold active-tab';
      
      const targetTab = btn.dataset.tab;
      loadTabContent(targetTab, navigateCallback);
    });
  });

  // Perform initial database load of collections
  await fetchAllAdminData();
  
  // Show Overview by default
  loadTabContent('analytics', navigateCallback);
}

async function fetchAllAdminData() {
  try {
    // 1. Fetch products
    const snapProd = await getDocs(collection(db, 'products'));
    productsList = [];
    snapProd.forEach(docSnap => productsList.push({ id: docSnap.id, ...docSnap.data() }));
    if (productsList.length === 0) productsList = seedProducts;

    // 2. Fetch orders
    const snapOrder = await getDocs(collection(db, 'orders'));
    ordersList = [];
    snapOrder.forEach(docSnap => ordersList.push({ id: docSnap.id, ...docSnap.data() }));

    // 3. Fetch users
    const snapUser = await getDocs(collection(db, 'users'));
    usersList = [];
    snapUser.forEach(docSnap => usersList.push({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error('Admin fetching collection error:', err);
    showToast('Failed to load real-time collections. Showing fallbacks.', 'warning');
    if (productsList.length === 0) productsList = seedProducts;
  }
}

async function loadTabContent(tabName, navigateCallback) {
  const panel = document.getElementById('admin-panel-content');
  if (!panel) return;

  if (tabName === 'analytics') {
    // ----------------------------------------------------
    // ANALYTICS OVERVIEW VIEW
    // ----------------------------------------------------
    const activeOrders = ordersList.filter(o => o.status !== 'cancelled');
    const revenue = activeOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const pendingOrders = ordersList.filter(o => o.status === 'pending').length;

    panel.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-left">
        <!-- Revenue Widget -->
        <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/20 transition-all">
          <div class="flex justify-between items-center text-slate-500 mb-3 text-xs uppercase font-bold tracking-wider">
            <span>Total Revenue</span>
            <i class="ri-money-dollar-circle-line text-brand-blue-500 text-lg"></i>
          </div>
          <p class="text-2xl font-black text-white font-display">PKR ${revenue.toLocaleString()}</p>
          <span class="text-[10px] text-emerald-400 font-semibold flex items-center mt-1"><i class="ri-arrow-up-line"></i> +12% from last week</span>
        </div>

        <!-- Orders Widget -->
        <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/20 transition-all">
          <div class="flex justify-between items-center text-slate-500 mb-3 text-xs uppercase font-bold tracking-wider">
            <span>Total Orders</span>
            <i class="ri-shopping-bag-line text-brand-blue-500 text-lg"></i>
          </div>
          <p class="text-2xl font-black text-white font-display">${ordersList.length}</p>
          <span class="text-[10px] text-amber-500 font-semibold flex items-center mt-1"><i class="ri-error-warning-line"></i> ${pendingOrders} orders pending</span>
        </div>

        <!-- Products Widget -->
        <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/20 transition-all">
          <div class="flex justify-between items-center text-slate-500 mb-3 text-xs uppercase font-bold tracking-wider">
            <span>Inventory Items</span>
            <i class="ri-computer-line text-brand-blue-500 text-lg"></i>
          </div>
          <p class="text-2xl font-black text-white font-display">${productsList.length}</p>
          <span class="text-[10px] text-slate-500 font-medium">5 hardware categories</span>
        </div>

        <!-- Users Widget -->
        <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/20 transition-all">
          <div class="flex justify-between items-center text-slate-500 mb-3 text-xs uppercase font-bold tracking-wider">
            <span>Registered Users</span>
            <i class="ri-group-line text-brand-blue-500 text-lg"></i>
          </div>
          <p class="text-2xl font-black text-white font-display">${usersList.length}</p>
          <span class="text-[10px] text-slate-500 font-medium">${usersList.filter(u => u.isAdmin).length} admin records</span>
        </div>
      </div>

      <!-- Quick summary lists / Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        <!-- Recent Orders -->
        <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 space-y-4">
          <h3 class="font-bold text-white text-sm font-display uppercase tracking-wider">Active Operations</h3>
          <div class="space-y-3.5 max-h-96 overflow-y-auto">
            ${ordersList.slice(0, 5).map(ord => `
              <div class="flex justify-between items-center text-xs p-3.5 border border-white/5 rounded-xl bg-white/5">
                <div>
                  <p class="font-bold text-white truncate max-w-[150px]">${ord.customerName}</p>
                  <span class="text-[10px] text-slate-500">${ord.paymentMethod.toUpperCase()} · PKR ${ord.totalAmount.toLocaleString()}</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-white/5 border border-white/10 text-slate-300">${ord.status}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Registrations -->
        <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 space-y-4">
          <h3 class="font-bold text-white text-sm font-display uppercase tracking-wider">Recent Users</h3>
          <div class="space-y-3.5 max-h-96 overflow-y-auto">
            ${usersList.slice(0, 5).map(usr => `
              <div class="flex items-center gap-3 p-3 border border-white/5 rounded-xl bg-white/5">
                <img src="${usr.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <h4 class="font-bold text-xs text-white">${usr.displayName}</h4>
                  <span class="text-[10px] text-slate-500">${usr.email}</span>
                </div>
                <span class="ml-auto px-2 py-0.5 rounded text-[8px] font-black bg-brand-blue-500/10 text-brand-blue-400 border border-brand-blue-500/20">${usr.isAdmin ? 'Admin' : 'Customer'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

  } else if (tabName === 'products') {
    // ----------------------------------------------------
    // PRODUCT MANAGER VIEW
    // ----------------------------------------------------
    panel.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold font-display text-white">Product Catalog</h2>
        <button id="btn-add-product-modal" class="px-4 py-2.5 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
          <i class="ri-add-line text-sm"></i>
          <span>Add New Product</span>
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-white/5 bg-brand-navy-900/40">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-white/5 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <th class="p-4">Product Details</th>
              <th class="p-4">Category</th>
              <th class="p-4">Base Price</th>
              <th class="p-4">Stock</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            ${productsList.map(item => `
              <tr class="hover:bg-white/5 transition-colors">
                <td class="p-4 flex items-center gap-3">
                  <div class="w-10 h-8 rounded bg-white/5 p-1 flex items-center justify-center flex-shrink-0">
                    <img src="${item.imageUrls?.[0] || '/images/hero_laptop.png'}" class="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h4 class="font-bold text-white line-clamp-1 max-w-[200px]">${item.title}</h4>
                    <span class="text-[9px] text-slate-500 font-mono">ID: ${item.id}</span>
                  </div>
                </td>
                <td class="p-4 capitalize text-slate-400">${item.category}</td>
                <td class="p-4 font-bold text-slate-200">PKR ${(item.salePrice || item.price).toLocaleString()}</td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded font-mono ${item.stock <= 0 ? 'bg-rose-500/10 text-rose-500' : item.stock <= 3 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}">
                    ${item.stock} qty
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-center gap-2">
                    <button class="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 btn-edit-prod" data-prod-id="${item.id}" title="Edit"><i class="ri-edit-line"></i></button>
                    <button class="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 btn-del-prod" data-prod-id="${item.id}" title="Delete"><i class="ri-delete-bin-line"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Product Modal Dialog Container -->
      <div id="product-modal-container" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300"></div>
    `;

    // Bind catalog CRUD buttons
    bindProductManagerTabEvents(navigateCallback);

  } else if (tabName === 'orders') {
    // ----------------------------------------------------
    // ORDER MANAGEMENT VIEW
    // ----------------------------------------------------
    panel.innerHTML = `
      <div class="mb-6 text-left">
        <h2 class="text-xl font-bold font-display text-white">Customer Orders</h2>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-white/5 bg-brand-navy-900/40">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-white/5 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <th class="p-4">Order ID &amp; Customer</th>
              <th class="p-4">Price</th>
              <th class="p-4">Shipping Info</th>
              <th class="p-4">Status &amp; Tracking</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            ${ordersList.length === 0 ? `
              <tr><td colspan="5" class="p-12 text-center text-slate-500">No customer orders found in the database.</td></tr>
            ` : ordersList.map(ord => `
              <tr class="hover:bg-white/5 transition-colors">
                <!-- ID & Customer -->
                <td class="p-4">
                  <h4 class="font-bold text-white">${ord.customerName}</h4>
                  <span class="text-[9px] text-slate-500 font-mono block">ID: ${ord.id}</span>
                  <span class="text-[9px] text-slate-500 block mt-0.5">${ord.customerEmail} · ${ord.customerPhone}</span>
                </td>
                
                <!-- Price -->
                <td class="p-4">
                  <span class="font-bold text-slate-200 font-display">PKR ${ord.totalAmount.toLocaleString()}</span>
                  <span class="text-[9px] text-slate-500 block mt-0.5">${ord.paymentMethod.toUpperCase()}</span>
                </td>
                
                <!-- Shipping Address -->
                <td class="p-4 text-slate-400 max-w-[200px] truncate" title="${ord.shippingAddress}">
                  ${ord.shippingAddress}
                </td>
                
                <!-- Status & Tracking info -->
                <td class="p-4">
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      ord.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      ord.status === 'processing' ? 'bg-brand-blue-500/10 text-brand-blue-400 border border-brand-blue-500/20' :
                      ord.status === 'shipped' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      ord.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }">
                      ${ord.status}
                    </span>
                  </div>

                  <!-- Tracking details update block -->
                  <div class="flex items-center gap-1.5">
                    <input type="text" id="track-${ord.id}" placeholder="Tracking #" value="${ord.trackingNumber || ''}" 
                      class="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] w-28 focus:outline-none focus:border-brand-blue-500 text-slate-300" />
                    <button class="px-2 py-1 rounded bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-bold text-[9px] btn-save-tracking" data-order-id="${ord.id}">Set</button>
                  </div>
                </td>
                
                <!-- Dropdown Status selector -->
                <td class="p-4">
                  <div class="flex items-center justify-center">
                    <select class="px-2.5 py-1.5 rounded-lg bg-brand-navy-900 border border-white/10 text-slate-300 font-bold focus:outline-none focus:border-brand-blue-500 cursor-pointer select-order-status" data-order-id="${ord.id}">
                      <option value="pending" ${ord.status === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="processing" ${ord.status === 'processing' ? 'selected' : ''}>Processing</option>
                      <option value="shipped" ${ord.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="delivered" ${ord.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="cancelled" ${ord.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindOrderOperationsEvents();

  } else if (tabName === 'users') {
    // ----------------------------------------------------
    // USER RECORDS VIEW
    // ----------------------------------------------------
    panel.innerHTML = `
      <div class="mb-6 text-left">
        <h2 class="text-xl font-bold font-display text-white">Registered Customer Accounts</h2>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-white/5 bg-brand-navy-900/40">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-white/5 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <th class="p-4">User Details</th>
              <th class="p-4">Email</th>
              <th class="p-4">Access Level</th>
              <th class="p-4 text-center">Toggle Privilege</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            ${usersList.map(usr => `
              <tr class="hover:bg-white/5 transition-colors">
                <td class="p-4 flex items-center gap-3">
                  <img src="${usr.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="w-8 h-8 rounded-lg object-cover" />
                  <h4 class="font-bold text-white">${usr.displayName}</h4>
                </td>
                <td class="p-4 text-slate-400">${usr.email}</td>
                <td class="p-4">
                  <span class="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${usr.isAdmin ? 'bg-brand-blue-500/10 text-brand-blue-400 border border-brand-blue-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}">
                    ${usr.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-center">
                    <button class="px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 font-semibold text-[10px] text-slate-400 hover:text-white transition-all btn-toggle-admin" data-user-id="${usr.id}" data-admin-state="${usr.isAdmin}">
                      Toggle Role
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindUserRecordsEvents();
  }
}

// --------------------------------------------------------
// DOM Event Binder for Product Manager Tab
// --------------------------------------------------------
function bindProductManagerTabEvents(navigateCallback) {
  const modalContainer = document.getElementById('product-modal-container');
  const addBtn = document.getElementById('btn-add-product-modal');

  // Trigger Add Product Form Modal
  if (addBtn && modalContainer) {
    addBtn.addEventListener('click', () => {
      openProductFormModal(null);
    });
  }

  // Edit Button Clicks
  document.querySelectorAll('.btn-edit-prod').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.prodId;
      const target = productsList.find(p => p.id === id);
      if (target) {
        openProductFormModal(target);
      }
    });
  });

  // Delete Button Clicks
  document.querySelectorAll('.btn-del-prod').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.prodId;
      const confirmText = `Are you sure you want to delete product "${id}"?`;
      if (!confirm(confirmText)) return;

      try {
        await deleteDoc(doc(db, 'products', id));
        showToast('🗑️ Product deleted from Firestore!');
        await fetchAllAdminData();
        loadTabContent('products', navigateCallback);
      } catch (err) {
        console.error('Delete product error:', err);
        showToast('Failed to delete product', 'error');
      }
    });
  });

  // unified Modal Generator (supports edit and create product)
  function openProductFormModal(prod = null) {
    if (!modalContainer) return;
    const isEdit = prod !== null;
    let imageUrls = isEdit ? [...(prod.imageUrls || [])] : [];

    modalContainer.innerHTML = `
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-brand-navy-950/80 backdrop-blur-sm pointer-events-auto"></div>
      
      <!-- Modal Box -->
      <div class="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 rounded-2xl border border-white/10 bg-brand-navy-900 shadow-2xl glass-modal pointer-events-auto transition-all transform scale-95 opacity-0 text-slate-300 text-xs">
        <button id="btn-close-prod-modal" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors" aria-label="Close">
          <i class="ri-close-line text-2xl"></i>
        </button>

        <h3 class="font-bold text-white text-base font-display uppercase tracking-wider mb-6 border-b border-white/5 pb-2">
          ${isEdit ? 'Modify Laptop Configuration' : 'Create Laptop Configuration'}
        </h3>

        <form id="prod-form" class="space-y-4">
          <!-- ID Field (New product only) -->
          <div>
            <label class="block text-slate-500 font-semibold mb-1 uppercase">Custom Route ID (Slug)</label>
            <input type="text" id="p-id" required placeholder="e.g. thinkpad-t14-g3" ${isEdit ? 'disabled' : ''} value="${isEdit ? prod.id : ''}"
              class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors disabled:opacity-50" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-500 font-semibold mb-1 uppercase">Product Name</label>
              <input type="text" id="p-title" required placeholder="e.g. Lenovo ThinkPad T14 Gen 3" value="${isEdit ? prod.title : ''}"
                class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors" />
            </div>
            <div>
              <label class="block text-slate-500 font-semibold mb-1 uppercase">Category</label>
              <select id="p-category" class="w-full px-3 py-2.5 rounded-lg bg-brand-navy-900 border border-white/10 text-slate-300 focus:outline-none focus:border-brand-blue-500 cursor-pointer">
                <option value="gaming" ${isEdit && prod.category === 'gaming' ? 'selected' : ''}>Gaming</option>
                <option value="developer" ${isEdit && prod.category === 'developer' ? 'selected' : ''}>Developer</option>
                <option value="student" ${isEdit && prod.category === 'student' ? 'selected' : ''}>Student</option>
                <option value="refurbished" ${isEdit && prod.category === 'refurbished' ? 'selected' : ''}>Refurbished Business</option>
                <option value="accessories" ${isEdit && prod.category === 'accessories' ? 'selected' : ''}>Accessories</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-500 font-semibold mb-1 uppercase">Detailed Description</label>
            <textarea id="p-desc" required rows="3" placeholder="Specs summaries, chassis detail, condition status..." 
              class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors">${isEdit ? prod.description : ''}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-500 font-semibold mb-1 uppercase">Base Price (PKR)</label>
              <input type="number" id="p-price" required placeholder="125000" value="${isEdit ? prod.price : ''}"
                class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors" />
            </div>
            <div>
              <label class="block text-slate-500 font-semibold mb-1 uppercase">Sale Price (PKR, Optional)</label>
              <input type="number" id="p-saleprice" placeholder="115000" value="${isEdit && prod.salePrice ? prod.salePrice : ''}"
                class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors" />
            </div>
            <div>
              <label class="block text-slate-500 font-semibold mb-1 uppercase">Stock Volume</label>
              <input type="number" id="p-stock" required placeholder="5" value="${isEdit ? prod.stock : '5'}"
                class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors" />
            </div>
          </div>

          <!-- Specs list input split -->
          <div>
            <label class="block text-slate-500 font-semibold mb-1 uppercase">Technical Specifications (One per line)</label>
            <textarea id="p-specs" required rows="3" placeholder="Intel Core i5-1240P&#10;8GB LPDDR5&#10;256GB PCIe NVMe SSD&#10;14.0 inch WUXGA Screen"
              class="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-blue-500 transition-colors">${isEdit && prod.specifications ? prod.specifications.join('\n') : ''}</textarea>
          </div>

          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-400 hover:text-white transition-colors">
              <input type="checkbox" id="p-featured" ${isEdit && prod.featured ? 'checked' : ''} class="w-4 h-4 rounded bg-white/5 border border-white/10 accent-brand-blue-500" />
              <span>Show in Homepage Featured showcase</span>
            </label>
          </div>

          <!-- -----------------------------------------------
               DRAG & DROP IMAGE UPLOAD SYSTEM
          ------------------------------------------------ -->
          <div class="space-y-3 pt-3 border-t border-white/5">
            <label class="block text-slate-500 font-semibold uppercase">Product Media Catalogs</label>
            
            <!-- Drop target -->
            <div id="drop-zone" class="border-2 border-dashed border-white/10 hover:border-brand-blue-500/50 rounded-2xl p-6 bg-white/5 hover:bg-white/10 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
              <i class="ri-upload-cloud-2-line text-brand-blue-500 text-3xl"></i>
              <p class="font-bold text-slate-200">Drag &amp; drop pictures here, or click to choose files</p>
              <p class="text-[10px] text-slate-500 font-semibold">Supports PNG, JPG, JPEG · Upload multiple files</p>
              <input type="file" id="drop-input" multiple accept="image/*" class="hidden" />
            </div>

            <!-- Upload progress bar container -->
            <div id="upload-progress-container" class="space-y-1.5 hidden">
              <div class="flex justify-between font-bold text-[10px]">
                <span id="upload-status" class="text-slate-400">Uploading picture...</span>
                <span id="upload-percent" class="text-brand-blue-400">0%</span>
              </div>
              <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div id="upload-progress-bar" class="w-0 bg-brand-blue-500 h-full rounded-full transition-all duration-150"></div>
              </div>
            </div>

            <!-- Image thumbnail previews grid -->
            <div id="modal-image-previews" class="flex flex-wrap gap-2.5 pt-2">
              ${imageUrls.map((url, i) => `
                <div class="relative w-20 h-16 rounded-xl border border-white/10 bg-brand-navy-950 p-1 flex items-center justify-center group flex-shrink-0">
                  <img src="${url}" alt="Preview ${i + 1}" class="max-h-full max-w-full object-contain" />
                  <button type="button" class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg btn-remove-uploaded" data-index="${i}">
                    <i class="ri-close-line text-xs font-bold"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <button type="submit" id="btn-save-product" class="w-full py-4 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-bold text-sm transition-all duration-200 shadow-glow-blue flex items-center justify-center gap-1.5 text-white">
            <i class="ri-save-line text-lg"></i>
            <span>${isEdit ? 'Update Details' : 'Create Product'}</span>
          </button>
        </form>
      </div>
    `;

    // Modal display animation
    modalContainer.classList.remove('pointer-events-none');
    modalContainer.style.opacity = '1';
    const card = modalContainer.querySelector('.relative.w-full');
    setTimeout(() => {
      card.classList.remove('scale-95', 'opacity-0');
    }, 10);

    // Bind Close events
    const closeBtn = document.getElementById('btn-close-prod-modal');
    closeBtn.addEventListener('click', closeModal);
    modalContainer.querySelector('.absolute.inset-0').addEventListener('click', closeModal);

    function closeModal() {
      card.classList.add('scale-95', 'opacity-0');
      card.addEventListener('transitionend', () => {
        modalContainer.innerHTML = '';
        modalContainer.classList.add('pointer-events-none');
        modalContainer.style.opacity = '0';
      }, { once: true });
    }

    // ----------------------------------------------------
    // Drag & Drop File Handling Logic
    // ----------------------------------------------------
    const dropZone = document.getElementById('drop-zone');
    const dropInput = document.getElementById('drop-input');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressPercent = document.getElementById('upload-percent');
    const progressStatus = document.getElementById('upload-status');
    const previewsContainer = document.getElementById('modal-image-previews');

    if (dropZone && dropInput) {
      dropZone.addEventListener('click', () => dropInput.click());

      // Drag highlights
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.add('border-brand-blue-500', 'bg-white/10');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.remove('border-brand-blue-500', 'bg-white/10');
        }, false);
      });

      dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFilesUpload(files);
      });

      dropInput.addEventListener('change', () => {
        if (dropInput.files.length > 0) handleFilesUpload(dropInput.files);
      });
    }

    async function handleFilesUpload(files) {
      progressContainer.classList.remove('hidden');
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        progressStatus.textContent = `Uploading ${file.name} (${i + 1}/${files.length})...`;
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';

        try {
          // Initialize upload task in Firebase Storage
          const storageRef = ref(storage, `products/${uniqueName}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
              (snapshot) => {
                const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progressBar.style.width = `${percent}%`;
                progressPercent.textContent = `${percent}%`;
              }, 
              (err) => {
                console.error('Storage Upload task rejected:', err);
                reject(err);
              }, 
              async () => {
                // Completed!
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                imageUrls.push(downloadURL);
                showToast(`Uploaded ${file.name}`);
                resolve();
              }
            );
          });
        } catch (uploadErr) {
          console.error('Firebase Storage writing error:', uploadErr);
          showToast(`Upload failed for ${file.name}. Utilizing local mock path fallback.`, 'warning');
          
          // Fallback image path (mock asset)
          imageUrls.push('/images/hero_laptop.png');
        }
      }

      progressContainer.classList.add('hidden');
      repaintPreviews();
    }

    function repaintPreviews() {
      if (!previewsContainer) return;
      previewsContainer.innerHTML = imageUrls.map((url, i) => `
        <div class="relative w-20 h-16 rounded-xl border border-white/10 bg-brand-navy-950 p-1 flex items-center justify-center group flex-shrink-0">
          <img src="${url}" alt="Preview ${i + 1}" class="max-h-full max-w-full object-contain" />
          <button type="button" class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg btn-remove-uploaded" data-index="${i}">
            <i class="ri-close-line text-xs font-bold"></i>
          </button>
        </div>
      `).join('');

      // Re-bind delete uploaded buttons
      previewsContainer.querySelectorAll('.btn-remove-uploaded').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const idx = parseInt(btn.dataset.index);
          const removedUrl = imageUrls.splice(idx, 1)[0];
          showToast('Image queued for removal');
          
          // In real production, we could delete object from Storage if it matches storage domains:
          // deleteObject(ref(storage, removedUrl)).catch(...)
          
          repaintPreviews();
        });
      });
    }

    // Rebind initial delete previews (for Edit Mode)
    repaintPreviews();

    // ----------------------------------------------------
    // Submit Product Details Form Handler
    // ----------------------------------------------------
    const form = document.getElementById('prod-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-product');
      const pId = document.getElementById('p-id').value.trim();
      const pTitle = document.getElementById('p-title').value.trim();
      const pCategory = document.getElementById('p-category').value;
      const pDesc = document.getElementById('p-desc').value.trim();
      const pPrice = parseFloat(document.getElementById('p-price').value);
      const pSalePriceVal = document.getElementById('p-saleprice').value.trim();
      const pSalePrice = pSalePriceVal ? parseFloat(pSalePriceVal) : null;
      const pStock = parseInt(document.getElementById('p-stock').value);
      const pSpecs = document.getElementById('p-specs').value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      const pFeatured = document.getElementById('p-featured').checked;

      if (!pId || !pTitle || !pDesc || isNaN(pPrice) || isNaN(pStock)) {
        showToast('Please verify all required form fields', 'error');
        return;
      }

      try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving configuration...';

        const productData = {
          title: pTitle,
          description: pDesc,
          category: pCategory,
          price: pPrice,
          salePrice: pSalePrice,
          stock: pStock,
          specifications: pSpecs,
          imageUrls: imageUrls,
          featured: pFeatured,
          createdAt: isEdit ? (prod.createdAt || new Date()) : new Date()
        };

        // Write directly to products collection using setDoc with the custom ID
        await setDoc(doc(db, 'products', pId), productData);

        showToast(isEdit ? '🎉 Product configuration updated!' : '🎉 Product created successfully!');
        closeModal();
        
        // Refresh catalog table
        await fetchAllAdminData();
        loadTabContent('products', navigateCallback);
      } catch (err) {
        console.error('Firestore save product error:', err);
        showToast('Failed to save product details.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
          <i class="ri-save-line text-lg"></i>
          <span>${isEdit ? 'Update Details' : 'Create Product'}</span>
        `;
      }
    });
  }
}

// --------------------------------------------------------
// DOM Event Binder for Orders Tab
// --------------------------------------------------------
function bindOrderOperationsEvents() {
  // Update Order Status selectors
  document.querySelectorAll('.select-order-status').forEach(select => {
    select.addEventListener('change', async () => {
      const orderId = select.dataset.orderId;
      const nextStatus = select.value;

      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status: nextStatus
        });
        showToast(`Order status updated to "${nextStatus.toUpperCase()}"`);
        
        // Update local cached orders List value to prevent desync
        const local = ordersList.find(o => o.id === orderId);
        if (local) local.status = nextStatus;
      } catch (err) {
        console.error('Update status error:', err);
        showToast('Failed to update status', 'error');
      }
    });
  });

  // Update Tracking Number buttons
  document.querySelectorAll('.btn-save-tracking').forEach(btn => {
    btn.addEventListener('click', async () => {
      const orderId = btn.dataset.orderId;
      const trackInput = document.getElementById(`track-${orderId}`);
      const val = trackInput ? trackInput.value.trim() : '';

      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          trackingNumber: val || null
        });
        showToast(val ? `Tracking number updated to: ${val}` : 'Tracking number removed');
        
        const local = ordersList.find(o => o.id === orderId);
        if (local) local.trackingNumber = val || null;
      } catch (err) {
        console.error('Update tracking code error:', err);
        showToast('Failed to save tracking number', 'error');
      }
    });
  });
}

// --------------------------------------------------------
// DOM Event Binder for Users Tab
// --------------------------------------------------------
function bindUserRecordsEvents() {
  document.querySelectorAll('.btn-toggle-admin').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uid = btn.dataset.userId;
      const currentState = btn.dataset.adminState === 'true';
      const nextState = !currentState;
      const confirmText = `Change access level for this user to: ${nextState ? 'ADMIN' : 'CUSTOMER'}?`;

      if (!confirm(confirmText)) return;

      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          isAdmin: nextState
        });

        showToast('🎉 User privileges updated successfully!');
        
        // Refresh local cache values
        const local = usersList.find(u => u.id === uid);
        if (local) local.isAdmin = nextState;

        // Redraw table
        loadTabContent('users', null);
      } catch (err) {
        console.error('Toggle admin status database error:', err);
        showToast('Could not modify user privileges', 'error');
      }
    });
  });
}
