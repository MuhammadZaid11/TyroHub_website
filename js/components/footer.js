import { showToast } from './ui.js';

export function renderFooter(state) {
  const container = document.getElementById('footer-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Top Decorative Line -->
    <div class="h-0.5 w-full bg-gradient-to-r from-transparent via-brand-blue-500/20 to-transparent"></div>
    
    <div class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-slate-400">
      
      <!-- Brand Segment -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 text-2xl font-bold font-display text-white">
          <span class="text-brand-blue-500">⚡</span> Tyro<span>Hub</span>
        </div>
        <p class="text-sm leading-relaxed">
          Premium laptop and technology solutions tailored for developers, freelancers, students, and professionals in Pakistan. Quality guaranteed.
        </p>
        <!-- Social Icons -->
        <div class="flex items-center gap-4 pt-2">
          <a href="#" aria-label="Facebook" class="w-9 h-9 rounded-lg bg-white/5 border border-white/5 hover:border-brand-blue-500 hover:text-white flex items-center justify-center transition-all">
            <i class="ri-facebook-fill text-lg"></i>
          </a>
          <a href="#" aria-label="Instagram" class="w-9 h-9 rounded-lg bg-white/5 border border-white/5 hover:border-brand-blue-500 hover:text-white flex items-center justify-center transition-all">
            <i class="ri-instagram-line text-lg"></i>
          </a>
          <a href="#" aria-label="LinkedIn" class="w-9 h-9 rounded-lg bg-white/5 border border-white/5 hover:border-brand-blue-500 hover:text-white flex items-center justify-center transition-all">
            <i class="ri-linkedin-fill text-lg"></i>
          </a>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="space-y-4">
        <h4 class="text-white font-semibold font-display text-sm tracking-wider uppercase">Collections</h4>
        <ul class="space-y-2.5 text-sm">
          <li><a href="/shop?category=gaming" class="footer-link hover:text-white transition-colors">Gaming Rigs</a></li>
          <li><a href="/shop?category=developer" class="footer-link hover:text-white transition-colors">Developer Laptops</a></li>
          <li><a href="/shop?category=student" class="footer-link hover:text-white transition-colors">Student Workstations</a></li>
          <li><a href="/shop?category=refurbished" class="footer-link hover:text-white transition-colors">Refurbished Business</a></li>
          <li><a href="/shop?category=accessories" class="footer-link hover:text-white transition-colors">Accessories</a></li>
        </ul>
      </div>

      <!-- Direct Contact Details -->
      <div class="space-y-4">
        <h4 class="text-white font-semibold font-display text-sm tracking-wider uppercase">Karachi Hub</h4>
        <ul class="space-y-3 text-sm">
          <li class="flex items-start gap-3">
            <i class="ri-map-pin-line text-brand-blue-500 text-lg flex-shrink-0"></i>
            <span>DHA Phase 6, Main Khayaban-e-Ittehad, Karachi, Pakistan</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="ri-phone-line text-brand-blue-500 text-lg flex-shrink-0"></i>
            <span>+92 300 1234567</span>
          </li>
          <li class="flex items-center gap-3">
            <i class="ri-mail-line text-brand-blue-500 text-lg flex-shrink-0"></i>
            <span>support@tyrohub.com</span>
          </li>
        </ul>
      </div>

      <!-- Newsletter Segment -->
      <div class="space-y-4">
        <h4 class="text-white font-semibold font-display text-sm tracking-wider uppercase">Stay Updated</h4>
        <p class="text-sm">Subscribe to get notification on new arrivals and flash sales.</p>
        <form id="footer-newsletter-form" class="space-y-2">
          <div class="relative">
            <input type="email" required placeholder="Enter your email" 
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors" />
            <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-brand-blue-500 hover:bg-brand-blue-600 text-white flex items-center justify-center transition-colors">
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </form>
      </div>

    </div>

    <!-- Copyright Bar -->
    <div class="border-t border-white/5 py-6 text-center text-xs text-slate-500 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p>&copy; ${new Date().getFullYear()} TyroHub. All rights reserved.</p>
      <div class="flex items-center gap-6">
        <a href="/faq" class="hover:text-slate-400">Warranty Policy</a>
        <a href="/faq" class="hover:text-slate-400">Shipping & Returns</a>
      </div>
    </div>

    <!-- Global Floating WhatsApp Button -->
    <a href="https://wa.me/923001234567?text=Hi%20TyroHub!%20I'm%20looking%20for%20a%20laptop." 
       target="_blank" rel="noopener" 
       class="fixed bottom-6 left-6 z-45 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 pointer-events-auto"
       aria-label="Contact TyroHub on WhatsApp">
      <i class="ri-whatsapp-line text-3xl"></i>
    </a>
  `;
}

export function initFooter(state, navigateCallback) {
  // Bind click handlers to footer links for client routing
  document.querySelectorAll('.footer-link, .border-t a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      navigateCallback(href);
    });
  });

  // Newsletter submission listener
  const form = document.getElementById('footer-newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        showToast('🎉 Subscribed successfully to TyroHub newsletter!');
        input.value = '';
      }
    });
  }
}
