export async function render(state) {
  const faqs = [
    {
      q: "What is TyroHub's product source and grading standard?",
      a: "Our laptops are primarily imported business-grade systems (like Lenovo ThinkPads, Dell XPS, and HP EliteBooks) sourced from Fortune 500 companies in North America and Europe. Every laptop is classified as Grade-A pristine, meaning they have minimal signs of use and are in 100% perfect functional condition. We run a comprehensive 20-point diagnostics review covering CPU, GPU benchmarks, SSD health, battery capacities (always above 80% original spec), displays, ports, and keyboards before listing them."
    },
    {
      q: "What warranty do you offer on purchases?",
      a: "We provide an industry-leading **12-month local testing and diagnostic warranty** on all refurbished business laptops. For gaming systems, we offer a **3-month parts warranty** and a **1-year service warranty**. If any hardware defect arises under normal usage parameters during your warranty window, we will repair the issue, replace the machine with an identical or higher model, or process a store credit refund. Upgrades like RAM and SSD modifications do not void your base warranty."
    },
    {
      q: "What payment options are available?",
      a: "We support multiple secure payment gateways for your convenience: Cash on Delivery (COD) for orders delivered within Karachi, Direct Bank Transfers, Easypaisa, and JazzCash. Details for online transfers are presented at the final checkout stage. For high-value transactions, our sales representatives will contact you to confirm details before dispatch."
    },
    {
      q: "What are your shipping rates and delivery schedules?",
      a: "For Karachi customers, we offer **Same-Day Express Delivery** on orders placed before 2:00 PM (otherwise next-day delivery), completely free of charge. For other cities (Lahore, Islamabad, Rawalpindi, Peshawar, Faisalabad, etc.), we ship via specialized insured couriers (TCS/M&P) with a delivery time of 2-3 business days. A tracking number will be provided once dispatched."
    },
    {
      q: "Can I inspect the laptop before buying?",
      a: "Absolutely! We invite you to visit our physical DHA Phase 6 hub in Karachi. Here you can inspect multiple devices, run custom developer builds, execute benchmarks, examine battery metrics, and consult directly with our tech engineers to find the absolute best match for your workflows. Please book an inspection slot through WhatsApp."
    },
    {
      q: "Do you offer RAM and Storage upgrades?",
      a: "Yes! We specialize in custom setups. Most models can be configured with RAM upgrades (up to 64GB DDR4/DDR5) and SSD expansions (up to 4TB NVMe SSDs). Select your upgrade requirements on the product pages or notify our engineers. We carry out upgrades inside our labs, run diagnostics checks, and ship the modified unit with no extra delay."
    }
  ];

  return `
    <div class="max-w-4xl mx-auto px-6 py-12 md:py-20 text-slate-300">
      
      <!-- Page Header -->
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span class="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-brand-blue-500/10 text-brand-blue-400 border border-brand-blue-500/20 uppercase">
          FAQ Helpdesk
        </span>
        <h1 class="text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-none">
          Answers to Your <span class="gradient-text">Questions</span>
        </h1>
        <p class="text-slate-400 text-sm md:text-base">
          Find fast responses regarding warranties, shipping, grading, payment details, and customized computing configs.
        </p>
      </div>

      <!-- FAQ Accordions -->
      <div class="space-y-4" id="faq-accordion-group">
        ${faqs.map((faq, i) => `
          <div class="faq-item border border-white/5 bg-brand-navy-900/20 rounded-xl overflow-hidden transition-all duration-300">
            <button class="w-full flex items-center justify-between p-5 text-left font-bold font-display text-white hover:text-brand-blue-400 hover:bg-white/5 transition-all text-sm md:text-base faq-trigger" aria-expanded="false" data-faq-index="${i}">
              <span>${faq.q}</span>
              <i class="ri-arrow-down-s-line text-slate-400 transition-transform duration-300 text-xl"></i>
            </button>
            <div class="faq-content max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5 mt-4">
                ${faq.a}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

export async function init(state, navigateCallback) {
  const triggers = document.querySelectorAll('.faq-trigger');
  
  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const item = btn.closest('.faq-item');
      const content = item.querySelector('.faq-content');
      const icon = btn.querySelector('i');

      // Close all other accordions
      document.querySelectorAll('.faq-trigger').forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.querySelector('i').classList.remove('rotate-180');
          const otherItem = otherBtn.closest('.faq-item');
          otherItem.querySelector('.faq-content').style.maxHeight = '0';
          otherItem.classList.remove('border-brand-blue-500/25', 'bg-brand-navy-900/40');
        }
      });

      // Toggle current accordion
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        icon.classList.remove('rotate-180');
        content.style.maxHeight = '0';
        item.classList.remove('border-brand-blue-500/25', 'bg-brand-navy-900/40');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        icon.classList.add('rotate-180');
        content.style.maxHeight = content.scrollHeight + 'px';
        item.classList.add('border-brand-blue-500/25', 'bg-brand-navy-900/40');
      }
    });
  });
}
