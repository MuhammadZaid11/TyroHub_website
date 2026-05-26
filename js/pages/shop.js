import { db, collection, getDocs } from '../firebase-config.js';
import { seedProducts } from '../seed-data.js';
import { addToCart, toggleWishlist } from '../app.js';
import { getProductCardSkeleton } from '../components/ui.js';

export async function render(state) {
  return `
    <div class="max-w-7xl mx-auto px-6 py-8 text-slate-300">
      
      <!-- Banner / Title -->
      <div class="mb-8 space-y-2 text-left">
        <h1 class="text-3xl md:text-4xl font-black font-display text-white tracking-tight">TyroHub Catalog</h1>
        <p class="text-slate-400 text-sm">Explore our collection of handpicked, engineer-certified technology and systems.</p>
      </div>

      <!-- Controls Wrapper (Filters & Products) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Sidebar Filters (lg:col-span-3) -->
        <aside class="lg:col-span-3 p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 glass-card space-y-6 text-left">
          
          <!-- Title -->
          <div class="flex items-center justify-between border-b border-white/5 pb-3">
            <span class="font-bold text-white text-sm font-display uppercase tracking-wider">Filters</span>
            <button id="btn-clear-filters" class="text-xs text-brand-blue-400 hover:text-white transition-colors">Clear All</button>
          </div>

          <!-- Keyword Search -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Search</label>
            <div class="relative">
              <input type="text" id="filter-search" placeholder="Type model, spec..." 
                class="w-full px-3 py-2.5 pl-9 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors" />
              <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            </div>
          </div>

          <!-- Category Selection -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
            <div class="flex flex-col gap-1.5 text-xs font-medium text-slate-400">
              <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors hover:text-white">
                <input type="radio" name="filter-category" value="all" checked class="w-4 h-4 accent-brand-blue-500" />
                <span>All Laptops</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors hover:text-white">
                <input type="radio" name="filter-category" value="gaming" class="w-4 h-4 accent-brand-blue-500" />
                <span>Gaming Rigs</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors hover:text-white">
                <input type="radio" name="filter-category" value="developer" class="w-4 h-4 accent-brand-blue-500" />
                <span>Developer Grade</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors hover:text-white">
                <input type="radio" name="filter-category" value="student" class="w-4 h-4 accent-brand-blue-500" />
                <span>Student Workstations</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors hover:text-white">
                <input type="radio" name="filter-category" value="refurbished" class="w-4 h-4 accent-brand-blue-500" />
                <span>Refurbished Business</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors hover:text-white">
                <input type="radio" name="filter-category" value="accessories" class="w-4 h-4 accent-brand-blue-500" />
                <span>Accessories</span>
              </label>
            </div>
          </div>

          <!-- Price Threshold Slider -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Max Budget</label>
              <span id="price-value" class="text-xs font-bold text-brand-blue-400">PKR 500,000</span>
            </div>
            <input type="range" id="filter-price" min="10000" max="500000" step="5000" value="500000"
              class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-blue-500" />
            <div class="flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span>PKR 10,000</span>
              <span>PKR 500,000</span>
            </div>
          </div>

          <!-- Special Toggle Checks -->
          <div class="space-y-2 border-t border-white/5 pt-4">
            <label class="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-400 hover:text-white transition-colors">
              <input type="checkbox" id="filter-wishlist" class="w-4 h-4 rounded bg-white/5 border-white/10 accent-brand-blue-500" />
              <span>Show Wishlist Only</span>
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-400 hover:text-white transition-colors">
              <input type="checkbox" id="filter-stock" class="w-4 h-4 rounded bg-white/5 border-white/10 accent-brand-blue-500" />
              <span>Show In Stock Only</span>
            </label>
          </div>

        </aside>

        <!-- Products Section (lg:col-span-9) -->
        <section class="lg:col-span-9 space-y-6">
          
          <!-- Top Sort & Results Header -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4 text-xs font-bold">
            <div class="text-slate-400">
              Showing <span id="results-count" class="text-white">...</span> Laptop configurations
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-slate-500 uppercase tracking-wide">Sort By</span>
              <select id="sort-selector" class="px-3 py-2 rounded-xl bg-brand-navy-900 border border-white/10 text-slate-300 focus:outline-none focus:border-brand-blue-500 cursor-pointer">
                <option value="newest">Latest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock Available</option>
              </select>
            </div>
          </div>

          <!-- Catalog Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" id="shop-grid">
            ${[1, 2, 3, 6].map(() => getProductCardSkeleton()).join('')}
          </div>

        </section>

      </div>

    </div>
  `;
}

export async function init(state, navigateCallback) {
  let products = [];
  const grid = document.getElementById('shop-grid');

  // Load items from Firestore
  try {
    const snap = await getDocs(collection(db, 'products'));
    snap.forEach(docSnap => {
      products.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (products.length === 0) {
      products = seedProducts;
    }
  } catch (err) {
    console.warn('Firestore load failed in Shop catalog, falling back to seeds:', err);
    products = seedProducts;
  }

  // Parse initial query params for filters
  const params = new URLSearchParams(window.location.search);
  const qCategory = params.get('category');
  const qSearch = params.get('search');
  const qWishlist = params.get('wishlist') === 'true';

  // Apply inputs to DOM nodes based on query params
  const inputSearch = document.getElementById('filter-search');
  const inputPrice = document.getElementById('filter-price');
  const checkWishlist = document.getElementById('filter-wishlist');
  const checkStock = document.getElementById('filter-stock');
  const selectorSort = document.getElementById('sort-selector');
  const priceValue = document.getElementById('price-value');
  const btnClear = document.getElementById('btn-clear-filters');

  if (qSearch && inputSearch) inputSearch.value = qSearch;
  if (qWishlist && checkWishlist) checkWishlist.checked = true;
  if (qCategory) {
    const radio = document.querySelector(`input[name="filter-category"][value="${qCategory}"]`);
    if (radio) radio.checked = true;
  }

  // Trigger catalog filter logic
  applyFilters();

  // Attach DOM Listeners for filters
  if (inputSearch) inputSearch.addEventListener('input', applyFilters);
  if (inputPrice) {
    inputPrice.addEventListener('input', () => {
      priceValue.textContent = `PKR ${parseInt(inputPrice.value).toLocaleString()}`;
      applyFilters();
    });
  }
  if (checkWishlist) checkWishlist.addEventListener('change', applyFilters);
  if (checkStock) checkStock.addEventListener('change', applyFilters);
  if (selectorSort) selectorSort.addEventListener('change', applyFilters);

  // Category radios trigger
  document.querySelectorAll('input[name="filter-category"]').forEach(radio => {
    radio.addEventListener('change', applyFilters);
  });

  // Clear filters trigger
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputSearch) inputSearch.value = '';
      if (inputPrice) {
        inputPrice.value = 500000;
        priceValue.textContent = 'PKR 500,000';
      }
      if (checkWishlist) checkWishlist.checked = false;
      if (checkStock) checkStock.checked = false;
      const allRadio = document.querySelector('input[name="filter-category"][value="all"]');
      if (allRadio) allRadio.checked = true;
      if (selectorSort) selectorSort.value = 'newest';
      
      applyFilters();
    });
  }

  // Core Filtering and Sorting Engine
  function applyFilters() {
    if (!grid) return;

    const querySearch = inputSearch ? inputSearch.value.trim().toLowerCase() : '';
    const queryCategory = document.querySelector('input[name="filter-category"]:checked')?.value || 'all';
    const queryMaxPrice = inputPrice ? parseInt(inputPrice.value) : 500000;
    const queryWishlist = checkWishlist ? checkWishlist.checked : false;
    const queryInStock = checkStock ? checkStock.checked : false;
    const querySort = selectorSort ? selectorSort.value : 'newest';

    let filtered = [...products];

    // Filter by category
    if (queryCategory !== 'all') {
      filtered = filtered.filter(item => item.category === queryCategory);
    }

    // Filter by search query (checks title, specifications, and description)
    if (querySearch) {
      filtered = filtered.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(querySearch);
        const descMatch = item.description?.toLowerCase().includes(querySearch);
        const specMatch = item.specifications?.some(spec => spec.toLowerCase().includes(querySearch));
        return titleMatch || descMatch || specMatch;
      });
    }

    // Filter by maximum price threshold
    filtered = filtered.filter(item => {
      const activePrice = item.salePrice || item.price;
      return activePrice <= queryMaxPrice;
    });

    // Filter by wishlist status
    if (queryWishlist) {
      filtered = filtered.filter(item => state.wishlist.includes(item.id));
    }

    // Filter by inventory availability
    if (queryInStock) {
      filtered = filtered.filter(item => item.stock > 0);
    }

    // Sort items
    if (querySort === 'price-low') {
      filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (querySort === 'price-high') {
      filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (querySort === 'stock') {
      filtered.sort((a, b) => b.stock - a.stock);
    } else {
      // Default: newest (falls back to ID sorting or date if exists)
      filtered.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
    }

    // Update count indicator
    document.getElementById('results-count').textContent = filtered.length;

    // Render cards
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-20 text-center text-slate-500">
          <i class="ri-search-eye-line text-5xl mb-3 block"></i>
          <span class="text-sm font-semibold">No matches found for your filter selection.</span>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const isWishlisted = state.wishlist.includes(item.id);
      const discount = item.salePrice ? Math.round(((item.price - item.salePrice) / item.price) * 100) : 0;
      const isOutOfStock = item.stock <= 0;

      return `
        <div class="group rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 hover:shadow-brand-blue-500/5 transition-all duration-300 flex flex-col p-4 relative overflow-hidden">
          
          <!-- Discount badge -->
          ${discount > 0 ? `
            <span class="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-rose-500/90 text-[10px] font-black text-white uppercase tracking-wider">
              -${discount}% OFF
            </span>
          ` : ''}

          <!-- Out of stock overlay -->
          ${isOutOfStock ? `
            <div class="absolute inset-0 z-20 bg-brand-navy-950/70 backdrop-blur-[2px] flex items-center justify-center">
              <span class="px-4 py-2 rounded-xl bg-slate-900/95 border border-white/10 text-rose-500 font-bold text-xs uppercase tracking-wider">Out of Stock</span>
            </div>
          ` : ''}
          
          <!-- Wishlist button -->
          <button data-wishlist-id="${item.id}" data-wishlist-title="${item.title}" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors border border-white/10" aria-label="Add to wishlist">
            <i class="${isWishlisted ? 'ri-heart-fill text-rose-500' : 'ri-heart-line'} text-base"></i>
          </button>

          <!-- Product Image Link -->
          <a href="/product/${item.id}" class="aspect-video w-full rounded-xl bg-slate-950/20 dark:bg-white/5 mb-4 flex items-center justify-center p-2 overflow-hidden block">
            <img src="${item.imageUrls?.[0] || '/images/hero_laptop.png'}" alt="${item.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
          </a>

          <!-- Details -->
          <div class="flex-grow space-y-1.5 flex flex-col justify-between">
            <div>
              <span class="text-[10px] uppercase font-bold text-brand-blue-500 tracking-widest">${item.category}</span>
              <h3 class="font-bold text-white group-hover:text-brand-blue-400 transition-colors text-sm sm:text-base line-clamp-1">
                <a href="/product/${item.id}">${item.title}</a>
              </h3>
              
              <!-- Specs list -->
              <div class="flex flex-wrap gap-1 mt-2 mb-3">
                ${item.specifications ? item.specifications.slice(0, 3).map(s => `
                  <span class="text-[9px] font-semibold px-2 py-1 rounded bg-white/5 border border-white/5 text-slate-400 truncate max-w-[150px]">${s}</span>
                `).join('') : ''}
              </div>
            </div>

            <!-- Pricing and Action Trigger -->
            <div class="flex items-center justify-between pt-2 border-t border-white/5">
              <div class="text-left">
                ${item.salePrice ? `
                  <span class="text-xs text-slate-500 line-through">PKR ${item.price.toLocaleString()}</span>
                  <p class="text-sm font-black text-white font-display">PKR ${item.salePrice.toLocaleString()}</p>
                ` : `
                  <p class="text-sm font-black text-white font-display">PKR ${item.price.toLocaleString()}</p>
                `}
              </div>

              <div class="flex gap-1.5">
                <a href="/product/${item.id}" class="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors" title="View details">
                  <i class="ri-eye-line"></i>
                </a>
                <button data-buy-id="${item.id}" ${isOutOfStock ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-bold text-xs text-white transition-colors flex items-center gap-1 shadow-md hover:shadow-brand-blue-500/20 disabled:opacity-50">
                  <i class="ri-shopping-cart-line"></i>
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindCatalogEvents(filtered);
  }

  function bindCatalogEvents(items) {
    // Wishlist events
    grid.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = btn.dataset.wishlistId;
        const title = btn.dataset.wishlistTitle;
        await toggleWishlist(id, title);
        applyFilters(); // Re-filter to immediately remove cards if on Wishlist Only view
      });
    });

    // Cart events
    grid.querySelectorAll('[data-buy-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = btn.dataset.buyId;
        const item = items.find(i => i.id === id);
        if (item) {
          await addToCart(item, 1);
        }
      });
    });

    // Client routing anchors click
    grid.querySelectorAll('a').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        navigateCallback(href);
      });
    });
  }
}
