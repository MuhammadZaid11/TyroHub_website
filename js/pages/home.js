import { db, collection, getDocs, query, where, limit } from '../firebase-config.js';
import { seedProducts } from '../seed-data.js';
import { addToCart, toggleWishlist } from '../app.js';
import { getProductCardSkeleton } from '../components/ui.js';

export async function render(state) {
  return `
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 pt-12">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
        
        <!-- Hero Details -->
        <div class="lg:col-span-7 space-y-6 md:space-y-8 text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-blue-500/10 text-brand-blue-400 border border-brand-blue-500/20 shadow-sm animate-pulse">
            <span class="w-2 h-2 rounded-full bg-brand-blue-500"></span>
            Pakistan's Premium Technology Hub · Karachi
          </div>
          
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-none">
            Premium Laptops For<br class="hidden sm:inline" />
            <span class="gradient-text">Developers, Students</span><br />
            &amp; Professionals
          </h1>
          
          <p class="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
            Professionally tested systems backed by up to **12 months warranty**. Experience seamless coding, high-fidelity gaming, and reliable corporate workflows with fast Karachi shipping.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a href="/shop" class="px-8 py-4 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold text-center text-sm transition-all duration-200 shadow-glow-blue hover:shadow-brand-blue-500/50 flex items-center justify-center gap-2 text-white">
              <i class="ri-shopping-bag-line text-lg"></i>
              <span>Shop Laptops</span>
            </a>
            <a href="/about" class="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-center font-semibold text-sm text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2">
              <i class="ri-information-line text-lg"></i>
              <span>Our QA Testing</span>
            </a>
          </div>

          <!-- Hero Metrics -->
          <div class="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 max-w-md" id="hero-stats-panel">
            <div>
              <p class="text-2xl md:text-3xl font-black text-white font-display stat-number" data-target="500" data-suffix="+">0+</p>
              <p class="text-xs text-slate-500 font-medium">Laptops Sold</p>
            </div>
            <div>
              <p class="text-2xl md:text-3xl font-black text-white font-display stat-number" data-target="300" data-suffix="+">0+</p>
              <p class="text-xs text-slate-500 font-medium">Happy Users</p>
            </div>
            <div>
              <p class="text-2xl md:text-3xl font-black text-white font-display stat-number" data-target="12" data-suffix="m">0m</p>
              <p class="text-xs text-slate-500 font-medium">Official Warranty</p>
            </div>
          </div>
        </div>

        <!-- Hero Image (Floating Laptop Mockup) -->
        <div class="lg:col-span-5 flex justify-center relative">
          <div class="absolute w-72 h-72 rounded-full bg-brand-blue-500/10 blur-[60px] dark:bg-brand-blue-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div class="relative max-w-sm sm:max-w-md w-full animate-float">
            <img src="/images/hero_laptop.png" alt="Premium laptop display" class="w-full h-auto drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)] object-contain" />
            
            <!-- Badges -->
            <div class="absolute top-4 -left-4 sm:-left-8 px-4 py-3 rounded-2xl glass-card flex items-center gap-3 border border-white/10 shadow-lg text-left">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                <i class="ri-shield-check-line"></i>
              </div>
              <div>
                <p class="text-xs font-bold text-white">QA Certified</p>
                <p class="text-[10px] text-slate-400">20-Point Diagnostics</p>
              </div>
            </div>

            <div class="absolute bottom-4 -right-4 sm:-right-8 px-4 py-3 rounded-2xl glass-card flex items-center gap-3 border border-white/10 shadow-lg text-left">
              <div class="w-10 h-10 rounded-xl bg-brand-blue-500/20 text-brand-blue-400 flex items-center justify-center text-xl">
                <i class="ri-truck-line"></i>
              </div>
              <div>
                <p class="text-xs font-bold text-white">Fast Karachi Delivery</p>
                <p class="text-[10px] text-slate-400">COD Available</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Trust Badges Bar (Infinite Ticker) -->
    <section class="py-6 border-y border-white/5 bg-brand-navy-950/50 overflow-hidden relative" aria-label="Trust elements">
      <div class="flex animate-ticker w-[200%] md:w-[150%]">
        <!-- Slide track (duplicated contents for seamless wrapping) -->
        <div class="flex justify-around items-center w-1/2 text-slate-400 font-semibold text-xs md:text-sm tracking-wide">
          <span class="flex items-center gap-2"><i class="ri-shield-check-fill text-brand-blue-500"></i> Local Warranty Support</span>
          <span class="flex items-center gap-2"><i class="ri-settings-3-fill text-brand-blue-500"></i> Upgraded RAM/SSD Configs</span>
          <span class="flex items-center gap-2"><i class="ri-checkbox-circle-fill text-brand-blue-500"></i> Pristine Grade-A Models</span>
          <span class="flex items-center gap-2"><i class="ri-customer-service-2-fill text-brand-blue-500"></i> direct Engineer Consult</span>
          <span class="flex items-center gap-2"><i class="ri-secure-payment-fill text-brand-blue-500"></i> Bank Transfer / COD</span>
        </div>
        <div class="flex justify-around items-center w-1/2 text-slate-400 font-semibold text-xs md:text-sm tracking-wide">
          <span class="flex items-center gap-2"><i class="ri-shield-check-fill text-brand-blue-500"></i> Local Warranty Support</span>
          <span class="flex items-center gap-2"><i class="ri-settings-3-fill text-brand-blue-500"></i> Upgraded RAM/SSD Configs</span>
          <span class="flex items-center gap-2"><i class="ri-checkbox-circle-fill text-brand-blue-500"></i> Pristine Grade-A Models</span>
          <span class="flex items-center gap-2"><i class="ri-customer-service-2-fill text-brand-blue-500"></i> direct Engineer Consult</span>
          <span class="flex items-center gap-2"><i class="ri-secure-payment-fill text-brand-blue-500"></i> Bank Transfer / COD</span>
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
      <div class="max-w-2xl mx-auto space-y-3">
        <h2 class="text-3xl md:text-4xl font-black font-display text-white">Engineered For Your Workloads</h2>
        <p class="text-slate-400 text-sm md:text-base">Select a category tailored to your technical requirements.</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <!-- Gaming -->
        <a href="/shop?category=gaming" class="group p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 hover:shadow-brand-blue-500/5 transition-all duration-300 flex flex-col items-center gap-4 text-center">
          <img src="/images/gaming_laptop.png" alt="Gaming laptop category" class="w-20 h-auto object-contain group-hover:scale-105 transition-transform" />
          <div class="space-y-1">
            <h3 class="font-bold text-white group-hover:text-brand-blue-400 transition-colors text-sm md:text-base">Gaming Rigs</h3>
            <p class="text-[10px] text-slate-500">RTX &amp; AMD Dedicated GPUs</p>
          </div>
        </a>

        <!-- Coding -->
        <a href="/shop?category=developer" class="group p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 hover:shadow-brand-blue-500/5 transition-all duration-300 flex flex-col items-center gap-4 text-center">
          <img src="/images/coding_laptop.png" alt="Developer laptop category" class="w-20 h-auto object-contain group-hover:scale-105 transition-transform" />
          <div class="space-y-1">
            <h3 class="font-bold text-white group-hover:text-brand-blue-400 transition-colors text-sm md:text-base">Developer Grade</h3>
            <p class="text-[10px] text-slate-500">ThinkPads &amp; MacBook Pros</p>
          </div>
        </a>

        <!-- Student -->
        <a href="/shop?category=student" class="group p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 hover:shadow-brand-blue-500/5 transition-all duration-300 flex flex-col items-center gap-4 text-center">
          <img src="/images/student_laptop.png" alt="Student laptop category" class="w-20 h-auto object-contain group-hover:scale-105 transition-transform" />
          <div class="space-y-1">
            <h3 class="font-bold text-white group-hover:text-brand-blue-400 transition-colors text-sm md:text-base">Student Picks</h3>
            <p class="text-[10px] text-slate-500">Thin, Light &amp; Long Battery</p>
          </div>
        </a>

        <!-- Refurbished Business -->
        <a href="/shop?category=refurbished" class="group p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 hover:shadow-brand-blue-500/5 transition-all duration-300 flex flex-col items-center gap-4 text-center">
          <img src="/images/business_laptop.png" alt="Refurbished business category" class="w-20 h-auto object-contain group-hover:scale-105 transition-transform" />
          <div class="space-y-1">
            <h3 class="font-bold text-white group-hover:text-brand-blue-400 transition-colors text-sm md:text-base">Refurbished Biz</h3>
            <p class="text-[10px] text-slate-500">Enterprise Grade Laptops</p>
          </div>
        </a>

        <!-- Accessories -->
        <a href="/shop?category=accessories" class="group p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 hover:shadow-brand-blue-500/5 transition-all duration-300 flex flex-col items-center gap-4 text-center col-span-2 md:col-span-1">
          <img src="/images/tech_accessories.png" alt="Accessories category" class="w-20 h-auto object-contain group-hover:scale-105 transition-transform" />
          <div class="space-y-1">
            <h3 class="font-bold text-white group-hover:text-brand-blue-400 transition-colors text-sm md:text-base">Accessories</h3>
            <p class="text-[10px] text-slate-500">Organizers, hubs &amp; Cables</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Featured Products Showcase -->
    <section class="max-w-7xl mx-auto px-6 py-12 space-y-10 text-slate-200">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div class="space-y-2">
          <h2 class="text-3xl font-black font-display text-white">Featured Hardware</h2>
          <p class="text-slate-400 text-sm">Explore hot deals and top recommendations in our inventory.</p>
        </div>

        <!-- Filter tabs -->
        <div class="flex flex-wrap gap-2 text-xs font-semibold" id="home-filter-tabs">
          <button data-filter="all" class="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white active-tab">All Models</button>
          <button data-filter="gaming" class="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white">Gaming</button>
          <button data-filter="developer" class="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white">Developer</button>
          <button data-filter="student" class="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white">Student</button>
          <button data-filter="refurbished" class="px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white">Business</button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="home-featured-grid">
        ${[1, 2, 3, 4].map(() => getProductCardSkeleton()).join('')}
      </div>
      
      <!-- Browse Shop CTA -->
      <div class="text-center pt-8">
        <a href="/shop" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-brand-blue-500/30 text-brand-blue-400 hover:text-white hover:bg-brand-blue-500 transition-all font-semibold text-sm">
          <span>Browse All In Stock Laptops</span>
          <i class="ri-arrow-right-line"></i>
        </a>
      </div>
    </section>

    <!-- Why Choose TyroHub -->
    <section class="max-w-7xl mx-auto px-6 py-20">
      <div class="p-8 md:p-12 rounded-3xl border border-white/5 bg-brand-navy-900/20 relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Glow -->
        <div class="absolute w-[400px] h-[400px] rounded-full bg-brand-blue-500/5 blur-[100px] -bottom-1/2 -right-1/4"></div>
        
        <div class="space-y-6">
          <span class="text-xs font-black uppercase tracking-wider text-brand-blue-500">Engineered Trust</span>
          <h2 class="text-3xl md:text-4xl font-black font-display text-white tracking-tight leading-none">Why Pakistani Builders Choose TyroHub</h2>
          <p class="text-slate-400 text-sm leading-relaxed">
            Unlike standard resellers, we focus specifically on tech professionals and students. Our devices are optimized for development workflows, 3D workloads, and heavy multitasking.
          </p>

          <div class="space-y-4 text-left">
            <div class="flex gap-4 items-start">
              <i class="ri-check-line text-emerald-400 text-xl font-bold"></i>
              <div>
                <h4 class="text-white font-semibold text-sm">20-Point Diagnostic Clearance</h4>
                <p class="text-slate-400 text-xs mt-0.5">Every laptop undergoes strict diagnostics checking drive health, memory, batteries, thermal cooling, and screens.</p>
              </div>
            </div>
            <div class="flex gap-4 items-start">
              <i class="ri-check-line text-emerald-400 text-xl font-bold"></i>
              <div>
                <h4 class="text-white font-semibold text-sm">Direct Professional Support</h4>
                <p class="text-slate-400 text-xs mt-0.5">Talk to a laptop engineer who understands compilers, GPUs, and developer needs to help pick your model.</p>
              </div>
            </div>
            <div class="flex gap-4 items-start">
              <i class="ri-check-line text-emerald-400 text-xl font-bold"></i>
              <div>
                <h4 class="text-white font-semibold text-sm">Flexible Payment & Delivery</h4>
                <p class="text-slate-400 text-xs mt-0.5">Cash on Delivery across Karachi, insured courier nationwide, or physical pickup from our DHA Phase 6 hub.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative flex justify-center">
          <img src="/images/tech_accessories.png" alt="Accessories layout" class="w-full max-w-sm rounded-2xl border border-white/10 drop-shadow-2xl shadow-glow-blue/20" />
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div class="text-center space-y-3">
        <h2 class="text-3xl font-black font-display text-white">Endorsed by the Community</h2>
        <p class="text-slate-400 text-sm">Read reviews from developers and freelancers in Karachi and beyond.</p>
      </div>

      <!-- Testimonial Slider Container -->
      <div class="relative w-full overflow-hidden" id="home-reviews-slider">
        <!-- Review track -->
        <div class="flex gap-6 transition-transform duration-500 ease-out" id="reviews-track">
          <!-- Slide cards -->
          ${[
            { name: "Zafar Iqbal", role: "Full-Stack Dev", review: "Got my Dell XPS 15 from TyroHub. Battery health was 92% and the device was cleaner than expected. Essential resource for developers in Karachi.", rating: 5, city: "Karachi" },
            { name: "Aisha Rehman", role: "CS Student at FAST", review: "Purchased a refurbished ThinkPad T490. It runs Linux perfectly and lasts 7 hours. The price was unmatched compared to Saddar markets.", rating: 5, city: "Karachi" },
            { name: "Bilal Farooq", role: "3D Visualizer", review: "The Lenovo Legion is absolute beast for my Blender projects. Prompt delivery and very helpful engineers who assisted with custom RAM upgrades.", rating: 5, city: "Lahore" },
            { name: "Sara Khan", role: "Content Creator", review: "Very premium service. They walked me through testing screen colors at their showroom. Will definitely buy again.", rating: 5, city: "Karachi" }
          ].map(r => `
            <div class="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 space-y-4">
              <div class="flex items-center gap-1 text-amber-500">
                ${Array(r.rating).fill('<i class="ri-star-fill text-sm"></i>').join('')}
              </div>
              <p class="text-slate-300 text-sm leading-relaxed font-medium italic">"${r.review}"</p>
              <div class="flex items-center gap-3 pt-2">
                <div class="w-10 h-10 rounded-full bg-brand-blue-500/10 text-brand-blue-400 flex items-center justify-center font-bold text-sm">
                  ${r.name[0]}
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">${r.name}</h4>
                  <p class="text-[10px] text-slate-500">${r.role} · ${r.city}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

export async function init(state, navigateCallback) {
  let products = [];
  const grid = document.getElementById('home-featured-grid');

  // Load products from Firestore
  try {
    const productsRef = collection(db, 'products');
    // Fetch products
    const q = query(productsRef, where('featured', '==', true), limit(8));
    const snap = await getDocs(q);
    
    snap.forEach(docSnap => {
      products.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Seed check
    if (products.length === 0) {
      products = seedProducts.filter(p => p.featured);
    }
  } catch (err) {
    console.warn('Firestore failed loading home products, falling back to seeds:', err);
    products = seedProducts.filter(p => p.featured);
  }

  // Render product cards
  renderFeaturedGrid(products, 'all');

  // Set up filter buttons
  const tabs = document.querySelectorAll('#home-filter-tabs button');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.className = 'px-4 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white');
      btn.className = 'px-4 py-2.5 rounded-xl border border-brand-blue-500/20 bg-brand-blue-500/10 text-white font-bold';
      
      const filter = btn.dataset.filter;
      renderFeaturedGrid(products, filter);
    });
  });

  function renderFeaturedGrid(items, filter) {
    if (!grid) return;

    const filtered = filter === 'all' ? items : items.filter(item => item.category === filter);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500 text-sm">
          <i class="ri-inbox-line text-3xl mb-2 block"></i>
          <span>No laptops found in this category.</span>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const isWishlisted = state.wishlist.includes(item.id);
      const discount = item.salePrice ? Math.round(((item.price - item.salePrice) / item.price) * 100) : 0;

      return `
        <div class="group rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 hover:shadow-brand-blue-500/5 transition-all duration-300 flex flex-col p-4 relative overflow-hidden">
          
          <!-- Discount badge -->
          ${discount > 0 ? `
            <span class="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-rose-500/90 text-[10px] font-black text-white uppercase tracking-wider">
              -${discount}% OFF
            </span>
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
              
              <!-- Specs pills -->
              <div class="flex flex-wrap gap-1 mt-2 mb-3">
                ${item.specifications ? item.specifications.slice(0, 2).map(s => `
                  <span class="text-[9px] font-semibold px-2 py-1 rounded bg-white/5 border border-white/5 text-slate-400 truncate max-w-[120px]">${s}</span>
                `).join('') : ''}
              </div>
            </div>

            <!-- Price and CTAs -->
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
                <button data-buy-id="${item.id}" class="px-3.5 py-2 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-bold text-xs text-white transition-colors flex items-center gap-1 shadow-md hover:shadow-brand-blue-500/20">
                  <i class="ri-shopping-cart-line"></i>
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind card action buttons
    bindProductCardEvents(filtered);
  }

  function bindProductCardEvents(items) {
    // Wishlist click handler
    grid.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = btn.dataset.wishlistId;
        const title = btn.dataset.wishlistTitle;
        await toggleWishlist(id, title);
        // Refresh grid to update heart icon status
        renderFeaturedGrid(products, document.querySelector('#home-filter-tabs .active-tab')?.dataset.filter || 'all');
      });
    });

    // Add to cart click handler
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

    // Bind card anchors for router navigation
    grid.querySelectorAll('a').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        navigateCallback(href);
      });
    });
  }

  // Set up Review Slider Autoplay / Scroll
  const track = document.getElementById('reviews-track');
  if (track) {
    let currentSlide = 0;
    const cards = track.children;
    const gap = 24;
    
    // Auto-scroll every 5 seconds
    setInterval(() => {
      if (!track) return;
      const cardWidth = cards[0]?.offsetWidth || 300;
      const count = window.innerWidth < 640 ? 4 : window.innerWidth < 1024 ? 2 : 2.2;
      currentSlide = (currentSlide + 1) % Math.ceil(cards.length);
      
      const offset = currentSlide * (cardWidth + gap);
      // reset back to start if it runs off screen
      if (offset > track.scrollWidth - track.offsetWidth) {
        currentSlide = 0;
        track.style.transform = 'translateX(0px)';
      } else {
        track.style.transform = `translateX(-${offset}px)`;
      }
    }, 5000);
  }

  // Count up animations for stat values
  const statsPanel = document.getElementById('hero-stats-panel');
  if (statsPanel) {
    const numEls = statsPanel.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          numEls.forEach(el => {
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            let count = 0;
            const duration = 1500; // ms
            const stepTime = 16; // ~60fps
            const steps = Math.ceil(duration / stepTime);
            const increment = target / steps;

            const timer = setInterval(() => {
              count += increment;
              if (count >= target) {
                el.textContent = target.toLocaleString() + suffix;
                clearInterval(timer);
              } else {
                el.textContent = Math.floor(count).toLocaleString() + suffix;
              }
            }, stepTime);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(statsPanel);
  }
}
