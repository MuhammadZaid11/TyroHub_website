import { db, collection, addDoc, serverTimestamp } from '../firebase-config.js';
import { showToast } from '../components/ui.js';

export async function render(state) {
  return `
    <div class="max-w-6xl mx-auto px-6 py-12 md:py-20 text-slate-300">
      
      <!-- Page Header -->
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span class="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-brand-blue-500/10 text-brand-blue-400 border border-brand-blue-500/20 uppercase">
          Get In Touch
        </span>
        <h1 class="text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-none">
          We're Here to <span class="gradient-text">Help You Build</span>
        </h1>
        <p class="text-slate-400 text-sm md:text-base">
          Have a question about a model, need advice on configuration, or want to discuss corporate upgrades? Let's connect.
        </p>
      </div>

      <!-- Split Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <!-- Contact Information Info Card -->
        <div class="space-y-8 lg:pr-6">
          <div class="space-y-3">
            <h2 class="text-2xl font-bold font-display text-white">Karachi Headquarters</h2>
            <p class="text-slate-400 text-sm leading-relaxed">
              Visit our showroom to inspect machines, run performance benchmarks, and finalize specifications. We recommend scheduling an appointment via WhatsApp first.
            </p>
          </div>

          <div class="space-y-6">
            <!-- Location -->
            <div class="flex gap-4 items-start">
              <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/5 text-brand-blue-400 flex items-center justify-center text-xl flex-shrink-0">
                <i class="ri-map-pin-line"></i>
              </div>
              <div class="space-y-1">
                <h4 class="text-white font-semibold font-display text-sm">Physical Address</h4>
                <p class="text-slate-400 text-sm">DHA Phase 6, Main Khayaban-e-Ittehad, Karachi, Pakistan</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex gap-4 items-start">
              <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/5 text-brand-blue-400 flex items-center justify-center text-xl flex-shrink-0">
                <i class="ri-phone-line"></i>
              </div>
              <div class="space-y-1">
                <h4 class="text-white font-semibold font-display text-sm">Call & WhatsApp Support</h4>
                <p class="text-slate-400 text-sm">+92 300 1234567</p>
                <p class="text-slate-500 text-xs">Mon - Sat · 11:00 AM to 8:00 PM</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex gap-4 items-start">
              <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/5 text-brand-blue-400 flex items-center justify-center text-xl flex-shrink-0">
                <i class="ri-mail-send-line"></i>
              </div>
              <div class="space-y-1">
                <h4 class="text-white font-semibold font-display text-sm">Online Inquiries</h4>
                <p class="text-slate-400 text-sm">support@tyrohub.com</p>
              </div>
            </div>
          </div>

          <!-- Dummy Map Placeholder -->
          <div class="w-full h-56 rounded-2xl border border-white/10 bg-brand-navy-900/40 relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
            <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <i class="ri-map-2-line text-brand-blue-400 text-3xl"></i>
              <span class="text-sm font-semibold text-slate-300">DHA Phase 6 Showroom Map</span>
              <span class="text-xs text-slate-500">Interactive Google Maps overlay loading...</span>
            </div>
          </div>
        </div>

        <!-- Contact Form Card -->
        <div class="p-8 rounded-2xl border border-white/5 bg-brand-navy-900/40 glass-card">
          <h3 class="text-xl font-bold font-display text-white mb-6">Send Us a Message</h3>
          
          <form id="contact-form" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Your Name</label>
                <input type="text" id="contact-name" required placeholder="John Doe" 
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input type="email" id="contact-email" required placeholder="email@example.com" 
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Subject</label>
              <input type="text" id="contact-subject" required placeholder="Inquiry about Lenovo Legion / Business Laptop" 
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Message Content</label>
              <textarea id="contact-message" required rows="5" placeholder="Details about your requirements, spec preferences, etc..." 
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-blue-500 transition-colors text-sm"></textarea>
            </div>

            <button type="submit" id="contact-submit" class="w-full py-4 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 font-semibold text-sm transition-all duration-200 shadow-glow-blue hover:shadow-brand-blue-500/50 flex items-center justify-center gap-2 text-white">
              <span>Send Message</span>
              <i class="ri-send-plane-fill"></i>
            </button>
          </form>
        </div>

      </div>

    </div>
  `;
}

export async function init(state, navigateCallback) {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const submitBtn = document.getElementById('contact-submit');

    if (!name || !email || !subject || !message) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    try {
      // Toggle button state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Sending inquiry...</span>
      `;

      // Save inquiry to Firestore database
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        subject,
        message,
        createdAt: serverTimestamp()
      });

      showToast('🎉 Message sent successfully! We will contact you soon.');
      form.reset();
    } catch (err) {
      console.error('Contact Firestore error:', err);
      showToast('Could not save your message. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <i class="ri-send-plane-fill"></i>
      `;
    }
  });
}
