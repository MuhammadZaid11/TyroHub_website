import { db, doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from '../firebase-config.js';
import { seedProducts } from '../seed-data.js';
import { addToCart, toggleWishlist } from '../app.js';
import { getProductDetailSkeleton, showToast } from '../components/ui.js';

export async function render(state) {
  return `
    <div class="max-w-7xl mx-auto px-6 py-8" id="product-detail-page">
      ${getProductDetailSkeleton()}
    </div>
  `;
}

export async function init(state, navigateCallback) {
  const pageContainer = document.getElementById('product-detail-page');
  if (!pageContainer) return;

  const productId = state.routeParams.id;
  let product = null;

  // 1. Fetch Product details from Firestore or local seed fallbacks
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      product = { id: docSnap.id, ...docSnap.data() };
    } else {
      product = seedProducts.find(p => p.id === productId);
    }
  } catch (err) {
    console.warn('Firestore single product query failed, checking seed list:', err);
    product = seedProducts.find(p => p.id === productId);
  }

  if (!product) {
    pageContainer.innerHTML = `
      <div class="text-center py-20 max-w-md mx-auto space-y-6">
        <i class="ri-alert-line text-6xl text-rose-500"></i>
        <h2 class="text-2xl font-bold font-display text-white">Laptop Not Found</h2>
        <p class="text-slate-400 text-sm">We couldn't find the configuration you're looking for. It may have been discontinued.</p>
        <a href="/shop" class="px-6 py-3 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold text-sm transition-colors text-white inline-block">Back to Catalog</a>
      </div>
    `;
    // Bind link
    pageContainer.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      navigateCallback('/shop');
    });
    return;
  }

  // 2. Fetch reviews and related products in parallel
  let reviews = [];
  let related = [];

  try {
    // Reviews
    const reviewsRef = collection(db, 'reviews');
    const qReviews = query(reviewsRef, where('productId', '==', productId));
    const snapReviews = await getDocs(qReviews);
    snapReviews.forEach(docSnap => {
      reviews.push(docSnap.data());
    });

    // Related Products (same category, limit 4, excluding current product)
    const productsRef = collection(db, 'products');
    const qRelated = query(productsRef, where('category', '==', product.category), where('__name__', '!=', productId));
    const snapRelated = await getDocs(qRelated);
    snapRelated.forEach(docSnap => {
      related.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (related.length === 0) {
      related = seedProducts.filter(p => p.category === product.category && p.id !== productId).slice(0, 4);
    }
  } catch (err) {
    console.warn('Firestore additional listings failed:', err);
    related = seedProducts.filter(p => p.category === product.category && p.id !== productId).slice(0, 4);
  }

  // Calculate discount
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const isOutOfStock = product.stock <= 0;
  const isWishlisted = state.wishlist.includes(product.id);

  // Render Page Content
  pageContainer.innerHTML = `
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 max-w-6xl mx-auto uppercase tracking-wider">
      <a href="/" class="hover:text-white transition-colors" id="bc-home">Home</a>
      <i class="ri-arrow-right-s-line"></i>
      <a href="/shop" class="hover:text-white transition-colors" id="bc-shop">Catalog</a>
      <i class="ri-arrow-right-s-line"></i>
      <span class="text-slate-400 truncate max-w-[200px]">${product.title}</span>
    </nav>

    <!-- Main Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
      
      <!-- Left Column: Images (lg:col-span-6) -->
      <div class="lg:col-span-6 space-y-4">
        <!-- Main Image Card -->
        <div class="aspect-video w-full rounded-2xl border border-white/5 bg-brand-navy-900/40 flex items-center justify-center p-6 relative overflow-hidden">
          <img src="${product.imageUrls?.[0] || '/images/hero_laptop.png'}" id="main-product-image" alt="${product.title}" class="max-h-[350px] max-w-full object-contain drop-shadow-xl transition-all duration-300" />
        </div>

        <!-- Gallery Thumbnails (if multiple image URLs) -->
        ${product.imageUrls && product.imageUrls.length > 1 ? `
          <div class="flex gap-3 overflow-x-auto pb-1" id="image-gallery-thumbnails">
            ${product.imageUrls.map((url, i) => `
              <button class="w-20 h-16 rounded-xl border-2 ${i === 0 ? 'border-brand-blue-500' : 'border-white/5'} bg-brand-navy-900/40 p-2 flex-shrink-0 flex items-center justify-center transition-colors hover:border-brand-blue-400" data-img-url="${url}">
                <img src="${url}" alt="Thumbnail ${i + 1}" class="max-h-full max-w-full object-contain" />
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Right Column: Specs / Actions (lg:col-span-6) -->
      <div class="lg:col-span-6 space-y-6 text-left text-slate-300">
        
        <div class="space-y-2">
          <!-- Category -->
          <span class="text-xs uppercase font-bold text-brand-blue-500 tracking-widest">${product.category}</span>
          <!-- Title -->
          <h1 class="text-2xl md:text-3xl font-black font-display text-white tracking-tight leading-snug">${product.title}</h1>
          
          <!-- Review Summary Stars -->
          <div class="flex items-center gap-2 text-xs">
            <div class="flex items-center text-amber-500">
              ${reviews.length > 0 ? 
                Array(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)).fill('<i class="ri-star-fill"></i>').join('') 
                : '<i class="ri-star-line text-slate-500"></i><i class="ri-star-line text-slate-500"></i><i class="ri-star-line text-slate-500"></i><i class="ri-star-line text-slate-500"></i><i class="ri-star-line text-slate-500"></i>'
              }
            </div>
            <span class="text-slate-500 font-semibold">(${reviews.length} customer reviews)</span>
          </div>
        </div>

        <div class="h-px bg-white/5 w-full"></div>

        <!-- Prices & Discount info -->
        <div class="flex items-baseline gap-4">
          ${product.salePrice ? `
            <span class="text-2xl font-black text-white font-display">PKR ${product.salePrice.toLocaleString()}</span>
            <span class="text-sm text-slate-500 line-through">PKR ${product.price.toLocaleString()}</span>
            <span class="px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 tracking-wider">
              SAVE PKR ${(product.price - product.salePrice).toLocaleString()} (-${discount}%)
            </span>
          ` : `
            <span class="text-2xl font-black text-white font-display">PKR ${product.price.toLocaleString()}</span>
          `}
        </div>

        <!-- Brief description -->
        <p class="text-slate-400 text-sm leading-relaxed">${product.description}</p>

        <!-- Product specifications -->
        <div class="space-y-2.5">
          <h4 class="text-white text-xs font-bold uppercase tracking-wider">Key Specifications</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${product.specifications ? product.specifications.map(spec => `
              <div class="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-brand-navy-900/20">
                <i class="ri-cpu-line text-brand-blue-500 text-sm"></i>
                <span class="font-medium text-slate-300 truncate">${spec}</span>
              </div>
            `).join('') : ''}
          </div>
        </div>

        <!-- Action Panel (Qty selector & button) -->
        <div class="p-4 rounded-2xl border border-white/5 bg-brand-navy-900/20 flex flex-wrap items-center gap-4">
          
          <!-- Stock status -->
          <div class="w-full text-xs font-semibold mb-1">
            ${isOutOfStock ? `
              <span class="text-rose-500 flex items-center gap-1.5"><i class="ri-error-warning-line"></i> Temporarily Out of Stock</span>
            ` : product.stock <= 3 ? `
              <span class="text-amber-500 flex items-center gap-1.5"><i class="ri-alert-line animate-pulse"></i> Only ${product.stock} units left in stock!</span>
            ` : `
              <span class="text-emerald-500 flex items-center gap-1.5"><i class="ri-checkbox-circle-line"></i> In Stock (Ready to dispatch)</span>
            `}
          </div>

          <!-- Qty Decrement / Increment -->
          <div class="flex items-center border border-white/10 rounded-xl bg-white/5">
            <button id="qty-dec" ${isOutOfStock ? 'disabled' : ''} class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50">
              <i class="ri-subtract-line font-bold"></i>
            </button>
            <span id="qty-val" class="w-10 text-center font-bold text-sm text-white">1</span>
            <button id="qty-inc" ${isOutOfStock ? 'disabled' : ''} class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-50">
              <i class="ri-add-line font-bold"></i>
            </button>
          </div>

          <!-- Add to Cart CTA -->
          <button id="btn-add-cart" ${isOutOfStock ? 'disabled' : ''} 
            class="flex-grow py-3 px-6 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 disabled:bg-slate-800 disabled:text-slate-500 font-semibold text-sm transition-all duration-200 shadow-glow-blue hover:shadow-brand-blue-500/50 flex items-center justify-center gap-2 text-white">
            <i class="ri-shopping-cart-2-line text-lg"></i>
            <span>Add to Cart</span>
          </button>

          <!-- Wishlist Toggle -->
          <button id="btn-toggle-wishlist" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-rose-500 transition-colors flex items-center justify-center" aria-label="Wishlist">
            <i class="${isWishlisted ? 'ri-heart-fill text-rose-500' : 'ri-heart-line'} text-xl"></i>
          </button>

        </div>

      </div>

    </div>

    <!-- Technical Trust Grid -->
    <div class="max-w-6xl mx-auto mt-16 pt-16 border-t border-white/5 text-slate-400">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div class="space-y-2 p-6 rounded-xl bg-brand-navy-900/10 border border-white/5">
          <i class="ri-shield-check-line text-brand-blue-500 text-3xl"></i>
          <h4 class="text-white font-bold text-sm">Official Local Warranty</h4>
          <p class="text-xs leading-relaxed">Hardware and replacement warranty covered directly by our service office in Karachi.</p>
        </div>
        <div class="space-y-2 p-6 rounded-xl bg-brand-navy-900/10 border border-white/5">
          <i class="ri-tools-line text-brand-blue-500 text-3xl"></i>
          <h4 class="text-white font-bold text-sm">Upgrade Compatibility</h4>
          <p class="text-xs leading-relaxed">Request upgrades for memory or fast SSD space. Our technicians install and verify benchmarks prior to shipping.</p>
        </div>
        <div class="space-y-2 p-6 rounded-xl bg-brand-navy-900/10 border border-white/5">
          <i class="ri-truck-line text-brand-blue-500 text-3xl"></i>
          <h4 class="text-white font-bold text-sm">Insured Nationwide Delivery</h4>
          <p class="text-xs leading-relaxed">Double-boxed insured packaging via top domestic couriers. Zero-risk damage policy on shipments.</p>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div class="max-w-6xl mx-auto mt-16 pt-16 border-t border-white/5 text-slate-300">
      <h3 class="text-xl font-bold font-display text-white mb-8 text-left">Similar Recommendations</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6" id="product-related-grid">
        ${related.map(item => {
          const discountVal = item.salePrice ? Math.round(((item.price - item.salePrice) / item.price) * 100) : 0;
          return `
            <a href="/product/${item.id}" class="group rounded-xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/35 transition-all p-3 text-left flex flex-col justify-between relative overflow-hidden block">
              ${discountVal > 0 ? `<span class="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-rose-500 text-[8px] font-black text-white">-${discountVal}%</span>` : ''}
              <div class="aspect-video w-full rounded-lg bg-white/5 mb-3 flex items-center justify-center p-2">
                <img src="${item.imageUrls?.[0] || '/images/hero_laptop.png'}" alt="${item.title}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-white group-hover:text-brand-blue-400 transition-colors line-clamp-1">${item.title}</h4>
                <p class="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide font-semibold">${item.category}</p>
              </div>
              <div class="mt-2 text-xs font-black text-white font-display pt-1.5 border-t border-white/5">
                PKR ${(item.salePrice || item.price).toLocaleString()}
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Review Section Sheet -->
    <div class="max-w-6xl mx-auto mt-16 pt-16 border-t border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-12 text-left text-slate-300">
      
      <!-- List Reviews (lg:col-span-7) -->
      <div class="lg:col-span-7 space-y-6">
        <h3 class="text-xl font-bold font-display text-white mb-2">Customer Reviews</h3>
        
        <div class="space-y-4" id="reviews-list-container">
          ${reviews.length === 0 ? `
            <div class="p-6 text-center text-slate-500 text-sm">
              <i class="ri-chat-smile-3-line text-4xl mb-2 block"></i>
              <span>No reviews yet. Be the first to share your experience with this device!</span>
            </div>
          ` : reviews.map(rev => `
            <div class="p-5 rounded-2xl border border-white/5 bg-brand-navy-900/30 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-brand-blue-500/10 text-brand-blue-400 flex items-center justify-center text-xs font-bold uppercase">
                    ${rev.userName[0]}
                  </div>
                  <div>
                    <h5 class="text-xs font-bold text-white">${rev.userName}</h5>
                    <p class="text-[9px] text-slate-500">${rev.createdAt?.seconds ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</p>
                  </div>
                </div>
                <div class="flex text-amber-500 text-xs">
                  ${Array(rev.rating).fill('<i class="ri-star-fill"></i>').join('')}
                </div>
              </div>
              <p class="text-xs leading-relaxed text-slate-400 font-medium italic">"${rev.comment}"</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Write a Review Form (lg:col-span-5) -->
      <div class="lg:col-span-5">
        <div class="p-6 rounded-2xl border border-white/5 bg-brand-navy-900/40 glass-card space-y-4">
          <h4 class="text-base font-bold font-display text-white">Write a Review</h4>
          
          ${state.user ? `
            <form id="product-review-form" class="space-y-4">
              <!-- Star rating -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Your Rating</label>
                <div class="flex gap-2 text-2xl text-slate-600" id="star-rating-selector">
                  <button type="button" data-rating="1" class="hover:text-amber-500 transition-colors" aria-label="1 star"><i class="ri-star-fill"></i></button>
                  <button type="button" data-rating="2" class="hover:text-amber-500 transition-colors" aria-label="2 stars"><i class="ri-star-fill"></i></button>
                  <button type="button" data-rating="3" class="hover:text-amber-500 transition-colors" aria-label="3 stars"><i class="ri-star-fill"></i></button>
                  <button type="button" data-rating="4" class="hover:text-amber-500 transition-colors" aria-label="4 stars"><i class="ri-star-fill"></i></button>
                  <button type="button" data-rating="5" class="hover:text-amber-500 transition-colors text-amber-500" aria-label="5 stars"><i class="ri-star-fill"></i></button>
                </div>
                <input type="hidden" id="review-rating-value" value="5" />
              </div>

              <!-- Comment input -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Review Comment</label>
                <textarea id="review-comment" required rows="4" placeholder="How is the laptop performing? Discuss build, screen, shipping..." 
                  class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors"></textarea>
              </div>

              <button type="submit" id="btn-submit-review" class="w-full py-3 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-white">
                <i class="ri-send-plane-fill"></i>
                <span>Submit Feedback</span>
              </button>
            </form>
          ` : `
            <div class="py-6 text-center text-slate-500 space-y-3">
              <i class="ri-lock-line text-3xl"></i>
              <p class="text-xs">You must be signed in to leave reviews.</p>
              <button id="btn-review-login" class="px-4 py-2.5 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-bold text-xs transition-colors">Sign In Now</button>
            </div>
          `}
        </div>
      </div>

    </div>
  `;

  // Attach event bindings
  bindProductDetailsEvents(product, related, reviews, navigateCallback);
}

function bindProductDetailsEvents(product, related, reviews, navigateCallback) {
  // Breadcrumb links click
  const bcHome = document.getElementById('bc-home');
  const bcShop = document.getElementById('bc-shop');
  if (bcHome) bcHome.addEventListener('click', (e) => { e.preventDefault(); navigateCallback('/'); });
  if (bcShop) bcShop.addEventListener('click', (e) => { e.preventDefault(); navigateCallback('/shop'); });

  // Thumbnail clicks (Multi-image preview)
  const mainImg = document.getElementById('main-product-image');
  const thumbs = document.querySelectorAll('[data-img-url]');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.className = 'w-20 h-16 rounded-xl border-2 border-white/5 bg-brand-navy-900/40 p-2 flex-shrink-0 flex items-center justify-center transition-colors');
      thumb.className = 'w-20 h-16 rounded-xl border-2 border-brand-blue-500 bg-brand-navy-900/40 p-2 flex-shrink-0 flex items-center justify-center transition-colors';
      mainImg.src = thumb.dataset.imgUrl;
    });
  });

  // Quantity selector click logic
  const qtyVal = document.getElementById('qty-val');
  const qtyInc = document.getElementById('qty-inc');
  const qtyDec = document.getElementById('qty-dec');
  let currentQty = 1;

  if (qtyInc && qtyDec && qtyVal) {
    qtyInc.addEventListener('click', () => {
      if (currentQty < product.stock) {
        currentQty++;
        qtyVal.textContent = currentQty;
      } else {
        showToast('Maximum stock limit reached', 'warning');
      }
    });

    qtyDec.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        qtyVal.textContent = currentQty;
      }
    });
  }

  // Add to cart click
  const addCartBtn = document.getElementById('btn-add-cart');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', async () => {
      await addToCart(product, currentQty);
    });
  }

  // Wishlist click
  const wishlistBtn = document.getElementById('btn-toggle-wishlist');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', async () => {
      await toggleWishlist(product.id, product.title);
      // Toggle heart icon state
      const isWish = state.wishlist.includes(product.id);
      wishlistBtn.querySelector('i').className = isWish ? 'ri-heart-fill text-rose-500' : 'ri-heart-line';
    });
  }

  // Related products link click routing
  document.querySelectorAll('#product-related-grid a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      navigateCallback(href);
    });
  });

  // Review Login Button Trigger
  const reviewLoginBtn = document.getElementById('btn-review-login');
  if (reviewLoginBtn) {
    reviewLoginBtn.addEventListener('click', () => {
      import('../components/ui.js').then(ui => ui.openAuthModal('login'));
    });
  }

  // Star Rating Selector Logic
  const starContainer = document.getElementById('star-rating-selector');
  const ratingInput = document.getElementById('review-rating-value');
  if (starContainer && ratingInput) {
    const starBtns = starContainer.querySelectorAll('button');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating);
        ratingInput.value = rating;

        starBtns.forEach(b => {
          const bRating = parseInt(b.dataset.rating);
          if (bRating <= rating) {
            b.className = 'text-amber-500 transition-colors';
          } else {
            b.className = 'text-slate-600 hover:text-amber-500 transition-colors';
          }
        });
      });
    });
  }

  // Review Form Submit Handler
  const reviewForm = document.getElementById('product-review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = parseInt(document.getElementById('review-rating-value').value);
      const comment = document.getElementById('review-comment').value.trim();
      const submitBtn = document.getElementById('btn-submit-review');

      if (!comment) return;

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Saving feedback...</span>
        `;

        const newReview = {
          productId: product.id,
          userId: state.user.uid,
          userName: state.user.displayName,
          rating,
          comment,
          createdAt: new Date()
        };

        // Write to Firestore db reviews collection
        await addDoc(collection(db, 'reviews'), {
          ...newReview,
          createdAt: serverTimestamp()
        });

        showToast('🎉 Thank you! Your review was saved.');
        
        // Append new review dynamically to lists
        reviews.unshift(newReview);
        const listContainer = document.getElementById('reviews-list-container');
        if (listContainer) {
          const noReviewEl = listContainer.querySelector('.text-slate-500');
          if (noReviewEl) noReviewEl.remove();

          const newRevCard = document.createElement('div');
          newRevCard.className = 'p-5 rounded-2xl border border-white/5 bg-brand-navy-900/30 space-y-2';
          newRevCard.innerHTML = `
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-brand-blue-500/10 text-brand-blue-400 flex items-center justify-center text-xs font-bold uppercase">
                  ${newReview.userName[0]}
                </div>
                <div>
                  <h5 class="text-xs font-bold text-white">${newReview.userName}</h5>
                  <p class="text-[9px] text-slate-500">Just Now</p>
                </div>
              </div>
              <div class="flex text-amber-500 text-xs">
                ${Array(newReview.rating).fill('<i class="ri-star-fill"></i>').join('')}
              </div>
            </div>
            <p class="text-xs leading-relaxed text-slate-400 font-medium italic">"${newReview.comment}"</p>
          `;
          listContainer.prepend(newRevCard);
        }

        reviewForm.reset();
        // Reset stars visual to 5 stars
        if (starContainer) {
          starContainer.querySelectorAll('button').forEach(b => b.className = 'text-amber-500 transition-colors');
          ratingInput.value = 5;
        }

      } catch (err) {
        console.error('Review Firestore Error:', err);
        showToast('Failed to save review. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <i class="ri-send-plane-fill"></i>
          <span>Submit Feedback</span>
        `;
      }
    });
  }
}
