export async function render(state) {
  return `
    <div class="max-w-6xl mx-auto px-6 py-12 md:py-20 text-slate-300">
      
      <!-- Header Section -->
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span class="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-brand-blue-500/10 text-brand-blue-400 border border-brand-blue-500/20 uppercase">
          Who We Are
        </span>
        <h1 class="text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-none">
          Redefining Laptop Retail in <span class="gradient-text">Pakistan</span>
        </h1>
        <p class="text-base md:text-lg text-slate-400">
          At TyroHub, we empower Pakistan's developers, students, and remote professionals by providing premium, professionally-tested technology solutions with solid warranties.
        </p>
      </div>

      <!-- Hero Visual Split -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
        <div class="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img src="/images/tech_accessories.png" alt="Developer Workstation Accessories" class="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-navy-950 via-brand-navy-950/20 to-transparent"></div>
        </div>
        <div class="space-y-6">
          <h2 class="text-2xl md:text-3xl font-bold font-display text-white">
            Built by Tech Enthusiasts, For Builders
          </h2>
          <p class="leading-relaxed">
            Founded in Karachi, TyroHub started with a simple observation: finding high-quality, reliable, and reasonably priced laptops in Pakistan was a stressful task. Buyers were forced to choose between overpriced new systems or risky, untested secondhand laptops from local markets.
          </p>
          <p class="leading-relaxed">
            We solved this by establishing a rigorous **20-point testing system** led by tech experts. Every machine that leaves our hub—whether it's a refurbished enterprise ThinkPad, an RTX gaming rig, or an AMD student station—is thoroughly verified, cleaned, and graded.
          </p>
          <div class="flex flex-wrap gap-4 pt-2">
            <div class="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white">
              <i class="ri-shield-check-fill text-brand-blue-500 text-base"></i>
              <span>20-Point QA Checklist</span>
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white">
              <i class="ri-history-line text-brand-blue-500 text-base"></i>
              <span>12 Months Replacement Warranty</span>
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white">
              <i class="ri-truck-line text-brand-blue-500 text-base"></i>
              <span>Same-Day Karachi Shipping</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Core Values Grid -->
      <div class="space-y-12">
        <div class="text-center max-w-2xl mx-auto space-y-3">
          <h2 class="text-2xl md:text-3xl font-bold font-display text-white">Our Core Commitments</h2>
          <p class="text-slate-400 text-sm">The pillars that define our daily operations and customer support.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Value 1 -->
          <div class="p-8 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/30 transition-all duration-300 space-y-4 hover:shadow-brand-blue-500/5 group">
            <div class="w-12 h-12 rounded-xl bg-brand-blue-500/10 text-brand-blue-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
              <i class="ri-cpu-line"></i>
            </div>
            <h3 class="text-white font-bold font-display text-lg">Pristine Grade-A Hardware</h3>
            <p class="text-sm leading-relaxed text-slate-400">
              We import business-grade laptops from trusted corporations. Our devices exhibit negligible signs of wear and run like new, delivering peak durability.
            </p>
          </div>

          <!-- Value 2 -->
          <div class="p-8 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/30 transition-all duration-300 space-y-4 hover:shadow-brand-blue-500/5 group">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
              <i class="ri-customer-service-line"></i>
            </div>
            <h3 class="text-white font-bold font-display text-lg">Direct Engineer Support</h3>
            <p class="text-sm leading-relaxed text-slate-400">
              Skip standard call centers. When you contact TyroHub, you deal directly with tech experts who can help troubleshoot, configure environments, or advise on upgrades.
            </p>
          </div>

          <!-- Value 3 -->
          <div class="p-8 rounded-2xl border border-white/5 bg-brand-navy-900/40 hover:border-brand-blue-500/30 transition-all duration-300 space-y-4 hover:shadow-brand-blue-500/5 group">
            <div class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
              <i class="ri-seedling-line"></i>
            </div>
            <h3 class="text-white font-bold font-display text-lg">Tech Sustainability</h3>
            <p class="text-sm leading-relaxed text-slate-400">
              Refurbishing high-end computing components reduces massive amounts of carbon output and electronic waste, contributing to a cleaner, greener earth.
            </p>
          </div>

        </div>
      </div>

    </div>
  `;
}

export async function init(state, navigateCallback) {
  // Static view, no dynamic actions needed on startup
}
