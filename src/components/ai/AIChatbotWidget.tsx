'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Leaf,
  Clock,
  Maximize2,
  Minimize2,
  Settings,
  Key,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  Zap,
  Utensils,
  Calculator,
  BookOpen,
  Users,
  MessageCircle,
  Star,
} from 'lucide-react';
import { getSurplusItems, calculateImpact } from '@/lib/data';
import { formatPrice, getSurplusPhoto, formatCountdown } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { SurplusItem } from '@/types';

// ============================================================
// Types
// ============================================================
interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  items?: SurplusItem[];
  actionLink?: { label: string; href: string };
  esgMetric?: { kg: number; co2: number; trees: number };
  isLLM?: boolean;
  modelUsed?: string;
}

// ============================================================
// SARA Avatar Component
// ============================================================
function SaraAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const icon = size === 'sm' ? 16 : size === 'lg' ? 24 : 18;
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center shrink-0 relative`}
      style={{
        background: 'linear-gradient(135deg, #143628 0%, #2D6A4F 50%, #1a5c40 100%)',
        boxShadow: '0 2px 8px rgba(45,106,79,0.4)',
      }}
    >
      {/* Leaf icon as SARA's visual identity */}
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" className="text-[#86EFAC]">
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
          fill="rgba(134,239,172,0.2)"
        />
        <path
          d="M17 8c-2.5-.5-5 .5-6.5 2.5C9 12.5 9 15 10 17c1.5-1 2.5-2.5 2.5-4 1 1 1.5 2.5 1 4 1.5-1 2.5-3 2-5 1 .5 1.5 1.5 1.5 2.5.5-1.5.5-3-.5-4.5C17.5 10 17.5 9 17 8z"
          fill="currentColor"
          className="text-[#86EFAC]"
        />
      </svg>
      {/* Online beacon */}
      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E] border border-[#143628]" />
      </span>
    </div>
  );
}

// ============================================================
// Initial welcome message
// ============================================================
const makeWelcomeMessage = (): ChatMessage => ({
  id: 'welcome-1',
  sender: 'bot',
  text: `Hello! I am **SARA** 🌿 — *Smart Agri-food Rescue Assistant* on the **AksesPangan** platform.\n\nI am here to help you 24/7:\n\n🍲 **Find surplus food** near you in Bojongsoang & Greater Bandung\n🌡️ **Food safety guidelines** based on BPOM & HACCP standards\n🌱 **Carbon emissions calculator** (CO₂e) for your rescue actions\n🍳 **Creative zero-waste recipes** for surplus ingredients\n🏪 **Complete guides** on registering & using AksesPangan\n💬 **Open conversation** on food security, nutrition & climate\n\nWhat would you like to explore today?`,
  timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
});

// ============================================================
// Quick prompt categories
// ============================================================
const QUICK_PROMPTS = [
  { icon: '🍲', label: 'Find Free Food' },
  { icon: '🌱', label: 'Calculate 5 kg Emissions' },
  { icon: '🍳', label: 'Leftover Rice Recipe' },
  { icon: '🛡️', label: 'Safe Reheating Guide' },
  { icon: '🏪', label: 'Become a Partner' },
  { icon: '👑', label: 'Who Created This Web?' },
  { icon: '📍', label: 'Stock in Bojongsoang' },
  { icon: '🥬', label: 'Wilted Vegetable Ideas' },
  { icon: '🥐', label: 'Day-Old Bread Recipes' },
  { icon: '❓', label: 'What is AksesPangan?' },
];

// ============================================================
// Offline semantic engine — 15+ smart categories
// ============================================================
function processOfflineQuery(rawQuery: string, allItems: SurplusItem[]): ChatMessage {
  const q = rawQuery.toLowerCase().trim();
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const active = allItems.filter((i) => i.status === 'active');

  // Helper
  const mkBot = (text: string, extras: Partial<ChatMessage> = {}): ChatMessage => ({
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender: 'bot',
    text,
    timestamp: nowTime,
    ...extras,
  });

  // ── 1. GREETINGS ──────────────────────────────────────────
  if (/^(hello|hi|hey|good|morning|afternoon|evening|greetings|halo|hai)/.test(q)) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return mkBot(
      `${greeting}! 🌿 I am **SARA**, your AksesPangan AI assistant.\n\nI can assist you in finding free surplus food, computing your carbon savings, sharing creative recipes, or answering questions on food preservation and environmental impact.\n\nWhere would you like to start?`
    );
  }

  // ── 2. IDENTITY (SARA / BOT) ──────────────────────────────
  if (/(who are you|what is sara|about sara|introduce|about ai|about bot|identity|siapa kamu)/.test(q)) {
    return mkBot(
      `Pleased to meet you! I am **SARA** (Smart Agri-food Rescue Assistant) 🌿\n\nI am the official artificial intelligence assistant for the **AksesPangan** ecosystem, specifically engineered to:\n\n• 🍲 Help you locate & claim surplus food distributions\n• 🌱 Educate on food safety standards & environmental preservation\n• 🍳 Inspire zero-waste culinary recipes\n• 📊 Calculate verified ESG metrics and emissions averted\n\nI was developed by **Team Bojongsantos Empire** and am powered by **Google Gemini AI**. I am active 24/7 to support Indonesia's zero food waste mission! 🇮🇩🌿`
    );
  }

  // ── 3. CREATOR / TEAM ────────────────────────────────────
  if (/(creator|developer|who made|team|member|bojongsantos|created by|author|founder|pembuat)/.test(q)) {
    return mkBot(
      `👑 **AksesPangan** was innovated and built by **Team Bojongsantos Empire**:\n\n1. 🌟 **Maurellio Christopher Yonathan**\n2. 🌸 **Alya Salma Khoerunnisaa**\n3. ⚡ **Rakean Ahmad Zayyid Ardhi**\n4. 🚀 **Jazzkord Cmajor Dahring**\n\nThey engineered this platform featuring **6 isolated microservices** (Auth, Inventory, Booking, Analytics, Governance, Notifications) with integrated AI intelligence to champion **UN SDGs 2, 12, and 13** — Zero Hunger, Responsible Consumption, and Climate Action.\n\nA true tech-for-good innovation! 🇮🇩🌿`
    );
  }

  // ── 4. WHAT IS AKSESPANGAN ───────────────────────────────
  if (/(what is aksespangan|about aksespangan|this platform|this website|how it works|apa itu)/.test(q)) {
    return mkBot(
      `🌿 **AksesPangan** is an integrated digital platform dedicated to rescuing surplus food across Indonesia.\n\n**How it works:**\n1. 🏪 Restaurants, hotels, & caterers upload high-quality surplus inventory\n2. 🍲 Beneficiaries and communities discover & claim meals freely or affordably\n3. 📱 Safe handover verification via **Handover PIN** or **QR Code scan**\n4. 🌱 Every kilogram rescued prevents **2.5 kg CO₂e** of greenhouse emissions\n\n**Measurable impact:**\n• Mitigates food waste in Indonesia (23–48 million tons/year)\n• Enhances food security and nutritional access for underserved communities\n• Delivers automated ESG/CSR compliance metrics for corporate food donors\n\nWould you like to search available food or register as a partner?`,
      { actionLink: { label: 'Explore Surplus Catalog →', href: '#/penerima' } }
    );
  }

  // ── 5. FOOD SEARCH ───────────────────────────────────────
  if (/(search|food|surplus|free|claim|get|bojongsoang|bandung|rice|bread|vegetable|fruit|stock|available|cari|makanan)/.test(q)) {
    let matched = [...active];

    if (q.includes('free') || q.includes('gratis')) matched = matched.filter((i) => i.isFree);
    if (q.includes('bojongsoang')) matched = matched.filter((i) => (i.address + i.providerBusinessName).toLowerCase().includes('bojongsoang'));
    else if (q.includes('bandung')) matched = matched.filter((i) => (i.address + i.providerBusinessName).toLowerCase().includes('bandung'));

    const categoryMap: Record<string, string> = {
      rice: 'nasi', nasi: 'nasi', bread: 'roti', roti: 'roti',
      vegetable: 'sayur', sayur: 'sayur', fruit: 'buah', buah: 'buah',
      meat: 'lauk', lauk: 'lauk', cake: 'kue', kue: 'kue', drink: 'minuman', minuman: 'minuman',
    };
    for (const [key, cat] of Object.entries(categoryMap)) {
      if (q.includes(key)) { matched = matched.filter((i) => i.foodCategory === cat); break; }
    }

    const topItems = matched.slice(0, 4);
    if (topItems.length === 0) {
      return mkBot(
        `Currently, there are no active surplus items matching your specific search query. 😔\n\n💡 **Tips:**\n• Try browsing other categories (grains, baked goods, produce, etc.)\n• Check back in a few hours — new donor surplus is frequently posted in the afternoon (3:00 PM – 6:00 PM WIB)\n• Enable notifications to receive instant surplus alerts`,
        { actionLink: { label: 'Open Live Surplus Map →', href: '#/penerima' } }
      );
    }

    return mkBot(
      `✅ Found **${topItems.length} surplus items** ready to be rescued!\n\n👇 Tap any card below to view details and claim your portion:`,
      {
        items: topItems,
        actionLink: { label: 'View All in Catalog →', href: '#/penerima' },
      }
    );
  }

  // ── 6. FOOD SAFETY ───────────────────────────────────────
  if (/(safe|safety|bpom|haccp|temperature|reheat|spoil|storage|fridge|expire|shelf|danger zone|keamanan)/.test(q)) {
    return mkBot(
      `🛡️ **Food Safety Protocol Guidelines (BPOM & HACCP):**\n\n**⚠️ Danger Zone:** Temperatures between **5°C – 60°C** promote rapid microbial multiplication. Avoid keeping perishable food in this zone for more than **2 hours** in tropical climates.\n\n**🌡️ Storage Protocols:**\n• Prepared food at room temperature: max **2–4 hours**\n• Refrigerated (< 4°C): max **24 hours** (cooked proteins)\n• Deep frozen (< -18°C): **1–3 months**\n\n**🔥 Correct Reheating Procedure:**\n• Heat until the core internal temperature reaches at least **74°C** for **≥ 15 seconds**\n• Reheat only **once**; never repeatedly re-chill and re-heat\n• Add a splash of water to keep rice and grains moist\n\n**👁️ 3-Step Sensory Check before consumption:**\n• **Look:** no discoloration, mold, or unnatural shine\n• **Smell:** no sour, rancid, or pungent odors\n• **Feel:** no slimy or abnormally tacky textures\n\n*When in doubt — **do not consume**.*`,
      { actionLink: { label: 'Read Full Safety Protocols →', href: '#/terms' } }
    );
  }

  // ── 7. CARBON / ESG CALCULATOR ───────────────────────────
  if (/(carbon|emission|co2|esg|footprint|environment|calculate|reduction|climate|methane|tree|hitung)/.test(q)) {
    const numMatch = q.match(/(\d+(?:[.,]\d+)?)\s*kg?/);
    const kg = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 10;
    const co2 = Math.round(kg * 2.5 * 10) / 10;
    const trees = Math.round((co2 / 22) * 10) / 10;

    return mkBot(
      `🌱 **Carbon Emissions Reduction Calculator:**\n\nEvery **1 kg of surplus food rescued** = **2.5 kg CO₂e averted** *(Source: IPCC & WRI)*\n\nFood rotting in municipal landfills generates **methane gas (CH₄)**, which is 25× more potent than carbon dioxide in accelerating global warming.\n\n---\n\n✅ By rescuing **${kg} kg of food**, you have accomplished:`,
      {
        esgMetric: { kg, co2, trees },
        actionLink: { label: 'View ESG Dashboard & Certificates →', href: '#/dashboard' },
      }
    );
  }

  // ── 8. RICE / NASI RECIPE ────────────────────────────────
  if (/(recipe.*rice|rice.*recipe|leftover rice|cold rice|fried rice|resep nasi|olah nasi)/.test(q)) {
    return mkBot(
      `🍚 **5 Creative Recipes from Leftover Rice:**\n\n**1. Special Indonesian Fried Rice** *(10 mins)*\n   Sauté minced garlic + shallots → fold in cold rice + sweet soy sauce + fried egg → garnish with scallions & crisps.\n\n**2. Golden Arancini Rice Balls** *(20 mins)*\n   Mix rice + grated cheese + beaten egg → shape into spheres → roll in breadcrumbs → fry until crispy & golden.\n\n**3. Banana Leaf Baked Rice** *(15 mins)*\n   Combine rice with shredded seasoned chicken/anchovies + lemongrass → wrap in banana leaves → grill over charcoal.\n\n**4. Savory Quick Congee** *(15 mins)*\n   Simmer rice in chicken/vegetable broth while stirring continuously → season with fresh ginger, white pepper, and scallions.\n\n**5. Oven-Crisped Rice Snack** *(30 mins)*\n   Flatten rice onto a baking sheet → bake at 180°C for 20 mins → slice into crackers → sprinkle with sea salt & sesame seeds.\n\n🌿 **Zero-Waste Tip:** If rice is slightly past culinary safety, compost it as nitrogen-rich plant nourishment!`
    );
  }

  // ── 9. BREAD / ROTI RECIPE ───────────────────────────────
  if (/(recipe.*bread|bread.*recipe|stale bread|leftover bread|baguette|sourdough|resep roti)/.test(q)) {
    return mkBot(
      `🍞 **5 Ways to Upcycle Day-Old Bread:**\n\n**1. Classic Golden French Toast** *(10 mins)*\n   Dip slices into beaten egg + milk + cinnamon → toast in butter until caramelized → serve with pure honey.\n\n**2. Custard Bread Pudding** *(45 mins)*\n   Cube bread → soak in milk, egg, sugar, and vanilla extract → pour into a pan → bake at 180°C for 30 mins.\n\n**3. Herbal Salad Croutons** *(15 mins)*\n   Cube bread → toss with olive oil + dried oregano + garlic powder → bake at 160°C for 15 mins until crunchy.\n\n**4. Tomato Garlic Bruschetta** *(10 mins)*\n   Toast bread slices → rub with a fresh garlic clove → top with diced ripe tomatoes, fresh basil, and extra-virgin olive oil.\n\n**5. Quick Bread Pizza** *(15 mins)*\n   Spread tomato marinara sauce + mozzarella cheese + choice toppings → bake at 200°C for 10 mins.\n\n🌿 **Pro Tip:** For dry, hard bread, sprinkle with drops of water and steam for 5 minutes — it regains its soft texture!`
    );
  }

  // ── 10. VEGETABLE / SAYUR RECIPE ─────────────────────────
  if (/(recipe.*vegetable|vegetable.*recipe|wilted|spinach|carrot|broccoli|cabbage|resep sayur)/.test(q)) {
    return mkBot(
      `🥬 **Creative Recipes for Wilted / Leftover Vegetables:**\n\n**1. Nutrient-Rich Vegetable Broth** *(30 mins)*\n   Simmer all clean vegetable trimmings (carrots, celery, onions, greens) in water → strain → freeze as gourmet cooking broth.\n\n**2. Quick Pickled Kimchi** *(10 mins + 1 day ferment)*\n   Chop cabbage/greens → salt to draw water → squeeze → toss with garlic, ginger, chili paste, and a touch of sugar.\n\n**3. Indonesian Spiced Stir-Fry** *(15 mins)*\n   Blend red chili + shallots + tomato → sauté until fragrant → toss in vegetables → finish with sweet soy sauce and sea salt.\n\n**4. Green Energy Smoothie** *(5 mins)*\n   Blend washed greens + ripe banana + milk/plant milk + honey → rich in iron, antioxidants, and dietary fiber.\n\n**5. Oven Vegetable Crisps** *(25 mins)*\n   Thinly slice root vegetables or kale → toss with olive oil and salt → bake at 160°C for 20 mins until crisp.\n\n🌿 **Tip:** Slightly wilted greens are ideal for soups, purees, and broths — avoid tossing them prematurely!`
    );
  }

  // ── 11. FRUIT / BUAH RECIPE ──────────────────────────────
  if (/(recipe.*fruit|fruit.*recipe|overripe|banana|mango|papaya|berry|resep buah)/.test(q)) {
    return mkBot(
      `🍎 **Recipes for Overripe & Surplus Fruits:**\n\n**1. 1-Ingredient Nice Cream** *(5 mins + frozen)*\n   Freeze peeled overripe bananas → blend until silky and creamy → mix in cocoa or berries → nutritious vegan soft-serve!\n\n**2. Tropical Acai/Smoothie Bowl** *(5 mins)*\n   Blend mango/papaya + banana + yogurt → pour into a bowl → garnish with toasted granola, seeds, and sliced fruit.\n\n**3. Homemade Fruit Compote / Jam** *(30 mins)*\n   Chop fruit → simmer with sugar (30-50% fruit weight) + fresh lemon juice → stir until thickened and glossy.\n\n**4. Spiced Fruit Infusion** *(20 mins)*\n   Simmer fruit pieces with cinnamon stick, star anise, and honey → strain → enjoy warm or over crushed ice.\n\n**5. Oven-Dehydrated Fruit Chips** *(low-heat dry)*\n   Thinly slice apples/pears/bananas → bake at 75°C for 2–3 hours until leathery and sweet.\n\n🌿 **Eco Bonus:** Banana peels make outstanding potassium fertilizer for house plants when soaked in water for 48 hours!`
    );
  }

  // ── 12. PROVIDER ONBOARDING ──────────────────────────────
  if (/(partner|provider|restaurant|hotel|catering|donor|upload surplus|how to donate|daftar mitra)/.test(q)) {
    return mkBot(
      `🏪 **Guide to Becoming an AksesPangan Food Donor Partner:**\n\n**Step 1 — Registration (2 mins)**\n   Navigate to "Register" → select the **Business Provider** role → fill in business details and address.\n\n**Step 2 — Post Surplus Inventory (1 min/item)**\n   Access your Provider Portal → Surplus Inventory → Click "+ Add Produce" or "+ Add Prepared Food"\n   Specify: item name, category, weight (kg), portion count, safe consumption window, and pricing (Free / Discounted).\n\n**Step 3 — Review Incoming Requests**\n   Receive real-time notifications when beneficiaries place bookings → accept or reject → coordinate via live order chat.\n\n**Step 4 — Verify Handover Seamlessly**\n   When the recipient arrives, inspect their **Digital QR Code Ticket** or **4-Digit PIN** → scan or confirm → handover completed!\n\n**Step 5 — Automated ESG Reporting**\n   Receive monthly **Certified Environmental Impact Statements** documenting food saved and CO₂e averted — ready for CSR & ESG audits!\n\n🌟 *Join today and become a certified Food & Climate Hero!*`,
      { actionLink: { label: 'Register as Provider Partner →', href: '#/register' } }
    );
  }

  // ── 13. RECIPIENT ONBOARDING ─────────────────────────────
  if (/(how to claim|how to book|pickup|recipient|beneficiary|qr code|pin|ticket|cara ambil)/.test(q)) {
    return mkBot(
      `📱 **How to Claim Surplus Food on AksesPangan:**\n\n**1. Register or Log In** as a Beneficiary Recipient.\n\n**2. Explore the Catalog & Map** — filter by proximity, dietary category, or free distribution.\n\n**3. Click "Claim / Order"** → confirm quantity and pickup notes → wait for provider confirmation.\n\n**4. Digital QR Ticket** — upon confirmation, access your **Digital Boarding Pass** with a secure QR Code & 4-digit PIN under "My Bookings".\n\n**5. Arrive at the Store** — present your QR code or state your PIN to the store staff.\n\n**6. Enjoy Your Meal!** — store verifies handover → order completed → surplus food preserved! 🎉\n\n⏰ *Always note the pickup deadline displayed on your digital ticket!*`,
      { actionLink: { label: 'Browse Available Surplus →', href: '#/penerima' } }
    );
  }

  // ── 14. FOOD WASTE FACTS / EDUCATION ─────────────────────
  if (/(fact|statistic|data|food waste|landfill|hunger|problem|education|fakta)/.test(q)) {
    return mkBot(
      `📊 **Startling Facts on Food Waste & Climate:**\n\n🇮🇩 **Indonesia = 2nd Largest Food Waster in G20**\n   Between 23 – 48 million metric tons of food are wasted annually *(Bappenas)*.\n\n☁️ **Severe Climate Ramifications:**\n   Decomposing food in landfills emits **methane (CH₄)**, 25× more damaging to our climate than CO₂.\n   Global food waste accounts for **8–10%** of total anthropogenic greenhouse gas emissions.\n\n🍽️ **The Food Security Paradox:**\n   While millions of tons of edible food are discarded, **28 million Indonesians** face chronic food vulnerability.\n\n💰 **Economic Toll:**\n   Food waste inflicts an estimated **Rp 213–551 trillion/year** loss on the national economy.\n\n🌱 **The Solution:**\n   Rescuing just 25% of national food waste would feed over **70 million people** daily!\n\n*AksesPangan was engineered to bridge this divide.* 💚`,
      { actionLink: { label: 'View Real-Time ESG Dashboard →', href: '#/dashboard' } }
    );
  }

  // ── 15. NUTRITION / GIZI QUESTIONS ───────────────────────
  if (/(nutrition|vitamin|calorie|protein|carbohydrate|fat|fiber|mineral|healthy|diet|gizi)/.test(q)) {
    return mkBot(
      `🥗 **Nutritional Guidelines for Rescued Surplus Food:**\n\nSurplus food distributed from restaurants, bakeries, and farms is wholesome and nutrient-dense. Here is how to maximize its nutritional value:\n\n**🍚 Carbohydrates (rice, bread):**\n   Primary energy sources. Aim for moderate portions (100–150g) and pair with fiber.\n\n**🍗 Protein (chicken, fish, tofu, tempeh):**\n   Essential for tissue repair and immune defense. Ensure thorough reheating before consumption.\n\n**🥬 Dietary Fiber (vegetables, fresh fruit):**\n   Promotes gut microbiome health and stabilizes blood sugar. Wash and enjoy promptly.\n\n**💧 Proper Hydration:**\n   Drink at least 8 glasses of fresh water daily to aid metabolic digestion.\n\n**⚠️ Safety Reminder:**\n   Surplus food retains high nutritional integrity when stored within safe temperature ranges and consumed before the stated deadline.\n\n*Have questions about a specific ingredient's nutritional value? Just ask!* 😊`
    );
  }

  // ── 16. ESG / DASHBOARD / CERTIFICATE ────────────────────
  if (/(dashboard|report|certificate|esg|csr|audit|impact|telemetry|sertifikat)/.test(q)) {
    return mkBot(
      `📈 **AksesPangan ESG Telemetry & Impact Certification:**\n\nEvery rescued meal is tracked and quantified using international ecological formulas:\n\n📊 **Key Dashboard Metrics:**\n• Total kilograms of surplus food rescued\n• Greenhouse gas emissions (CO₂e) averted\n• Total nutritious portions distributed\n• Cumulative ecological trendlines\n• Tree seedling equivalence (1 tree = ±22 kg CO₂/year)\n\n🏆 **Official ESG Impact Certificates for Providers:**\nCorporate food donors receive verifiable certificates suitable for:\n• Corporate CSR sustainability disclosures\n• Green business ESG audits and ISO certification\n• Public stakeholder brand transparency\n\n*All data is verified, transparent, and updated in real time!*`,
      { actionLink: { label: 'Open ESG Dashboard →', href: '#/dashboard' } }
    );
  }

  // ── DEFAULT FALLBACK ──────────────────────────────────────
  return mkBot(
    `Thank you for asking about *"${rawQuery}"* 💬\n\nI am SARA, your AksesPangan AI assistant. For complex, nuanced questions, I perform best with **Google Gemini AI** activated.\n\n⚡ **Enable Full AI:**\nClick the ⚙️ Settings icon at the top right → enter your free **Gemini API Key** from [aistudio.google.com](https://aistudio.google.com) → I can provide in-depth answers to any topic!\n\nIn the meantime, I can readily assist with:\n• 🍲 Finding active surplus food near you\n• 🌱 Calculating carbon emission reductions\n• 🍳 Zero-waste culinary recipes\n• 🛡️ Certified food safety protocols`,
    { actionLink: { label: 'Explore Surplus Catalog →', href: '#/penerima' } }
  );
}

// ============================================================
// Main Widget Component
// ============================================================
export function AIChatbotWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcomeMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<SurplusItem | null>(null);
  const [activeModel, setActiveModel] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aksespangan_gemini_key') || '';
      const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const active = stored || envKey;
      if (active) { setGeminiApiKey(active); setTempApiKey(active); }
    } catch { /* ignore */ }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping, scrollToBottom]);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setGeminiApiKey(trimmed);
    try {
      trimmed
        ? localStorage.setItem('aksespangan_gemini_key', trimmed)
        : localStorage.removeItem('aksespangan_gemini_key');
    } catch { /* ignore */ }
    setShowSettings(false);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3500);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Build message history for Gemini (last 10 turns to stay within context)
    const historyForApi = [...messages, userMsg]
      .slice(-20)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text }));

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          userApiKey: geminiApiKey || undefined,
          userContext: {
            userName: user?.name,
            userRole: user?.role,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.reply) {
        const q = text.toLowerCase();
        const shouldAttachItems =
          q.includes('makanan') || q.includes('cari') || q.includes('gratis') ||
          q.includes('stok') || q.includes('surplus') || q.includes('ambil') ||
          q.includes('bojongsoang') || q.includes('bandung');

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: nowTime,
          isLLM: true,
          modelUsed: data.model,
        };

        if (shouldAttachItems) {
          const items = getSurplusItems().filter((i) => i.status === 'active').slice(0, 3);
          if (items.length > 0) botMsg.items = items;
        }

        if (data.model) setActiveModel(data.model);
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('SARA API fallback to offline engine:', err);
    }

    // Offline fallback
    setTimeout(() => {
      const allItems = getSurplusItems();
      const botReply = processOfflineQuery(text, allItems);
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    setMessages([makeWelcomeMessage()]);
    setActiveModel('');
  };

  const handleClaimFood = () => {
    setSelectedFoodItem(null);
    setIsOpen(false);
    window.location.hash = isAuthenticated ? '#/penerima' : '#/login';
  };

  const hasKey = !!geminiApiKey;

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Launcher Button ── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 py-2.5 px-4 rounded-full shadow-2xl border cursor-pointer select-none transition-all"
          style={{
            background: 'linear-gradient(135deg, #143628 0%, #1C4736 100%)',
            borderColor: 'rgba(45,106,79,0.5)',
            boxShadow: '0 8px 24px rgba(20,54,40,0.45)',
          }}
          aria-label="Open SARA AI Assistant"
        >
          <SaraAvatar size="sm" />
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
              SARA
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#2D6A4F]/60 border border-[#2D6A4F]/40 text-[#86EFAC]">
                {hasKey ? 'Gemini AI' : 'AI'}
              </span>
            </div>
            <div className="text-[10px] text-white/65 leading-tight">
              {hasKey ? 'Active & Ready' : 'Food & ESG Assistant'}
            </div>
          </div>
          {/* Notification dot when closed */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FBBF24] rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles size={8} className="text-[#78350F]" />
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Chat Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-[#DCE5DB] flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-3 md:inset-8 w-auto h-auto max-w-4xl max-h-[88vh] m-auto'
                : 'bottom-20 md:bottom-20 right-3 sm:right-6 w-[95vw] sm:w-[420px] h-[600px] max-h-[88vh]'
            }`}
          >
            {/* ── Header ── */}
            <div
              className="text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #0d2a1c 0%, #143628 60%, #1a4a32 100%)' }}
            >
              <div className="flex items-center gap-2.5">
                <SaraAvatar size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold leading-tight tracking-tight">SARA</h3>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-semibold border ${
                        hasKey
                          ? 'bg-emerald-500/20 text-[#86EFAC] border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                      }`}
                    >
                      {activeModel
                        ? activeModel === 'gemini-2.0-flash' ? 'Gemini 2.0' : 'Gemini 1.5'
                        : hasKey ? 'Gemini AI' : 'Smart Engine'}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/70 m-0 leading-tight">
                    Smart Agri-food Rescue Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-white/80">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
                  title="API Key Settings"
                ><Settings size={14} /></button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >{isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
                <button
                  onClick={handleReset}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Reset Conversation"
                ><RefreshCw size={13} /></button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white ml-0.5"
                  title="Close"
                ><X size={16} /></button>
              </div>
            </div>

            {/* ── Key Saved Toast ── */}
            {keySavedToast && (
              <div className="bg-emerald-700 text-white text-[11px] px-3 py-1.5 flex items-center justify-between font-medium shrink-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Gemini API Key saved successfully! SARA is now running with full AI capabilities.</span>
                </div>
                <button onClick={() => setKeySavedToast(false)}><X size={12} /></button>
              </div>
            )}

            {/* ── Settings Panel ── */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#EDF2EC] border-b border-[#CAD6C8] p-3.5 shrink-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#143628]">
                      <Key size={13} className="text-[#2D6A4F]" />
                      <span>Google Gemini AI Configuration</span>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="text-[#597367] hover:text-[#143628]">
                      <X size={13} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#597367] mb-2.5 leading-relaxed">
                    Enable your <strong>Gemini API Key</strong> to unlock SARA&apos;s full potential — answers open questions on recipes, nutrition, food science, and more.
                  </p>
                  <input
                    type="password"
                    placeholder="AIzaSy... (paste Gemini API Key here)"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CAD6C8] rounded-lg text-xs text-[#143628] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1"
                    >
                      Get Free Key → Google AI Studio
                      <ExternalLink size={9} />
                    </a>
                    <button
                      onClick={handleSaveApiKey}
                      className="bg-[#2D6A4F] hover:bg-[#1C4736] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Save & Activate
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Quick Prompts Bar ── */}
            <div
              className="bg-[#F7F9F6] border-b border-[#DCE5DB] px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(`${p.icon} ${p.label}`)}
                  className="whitespace-nowrap bg-white hover:bg-[#EDF2EC] text-[#143628] border border-[#DCE5DB] text-[11px] font-medium py-1 px-2.5 rounded-full transition-all shrink-0 hover:border-[#2D6A4F] shadow-2xs cursor-pointer active:scale-95"
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]/40">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
                    {isBot && <SaraAvatar size="sm" />}

                    <div
                      className={`max-w-[86%] rounded-[18px] p-3.5 text-xs leading-relaxed shadow-2xs ${
                        isBot
                          ? 'bg-white text-[#143628] border border-[#DCE5DB] rounded-tl-sm'
                          : 'text-white rounded-tr-sm'
                      }`}
                      style={isBot ? {} : {
                        background: 'linear-gradient(135deg, #143628 0%, #1C4736 100%)',
                      }}
                    >
                      {/* Markdown-lite renderer */}
                      <div className="whitespace-pre-line space-y-0.5">
                        {msg.text.split('\n').map((line, li) => {
                          const html = line
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>');
                          return (
                            <span
                              key={li}
                              dangerouslySetInnerHTML={{ __html: html }}
                              className="block"
                            />
                          );
                        })}
                      </div>

                      {/* ESG Metric Card */}
                      {msg.esgMetric && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-emerald-200">
                          <div className="bg-emerald-50 px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Leaf size={15} className="text-emerald-700" />
                              <span className="font-bold text-xs text-emerald-900">{msg.esgMetric.kg} kg Food Rescued</span>
                            </div>
                          </div>
                          <div className="bg-white px-3 py-2.5 grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <div className="font-mono font-black text-lg text-emerald-700">−{msg.esgMetric.co2}</div>
                              <div className="text-[10px] text-emerald-600 font-semibold">kg CO₂e Averted</div>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <div className="font-mono font-black text-lg text-emerald-700">≈{msg.esgMetric.trees}</div>
                              <div className="text-[10px] text-emerald-600 font-semibold">Trees/Year</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Food Item Cards */}
                      {msg.items && msg.items.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-[11px] font-bold text-[#2D6A4F] flex items-center gap-1">
                            <ShoppingBag size={12} />
                            <span>Click for details & pickup info:</span>
                          </div>
                          {msg.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedFoodItem(item)}
                              role="button"
                              tabIndex={0}
                              className="p-2.5 bg-[#F7F9F6] hover:bg-[#EDF2EC] rounded-xl border border-[#DCE5DB] hover:border-[#2D6A4F] flex items-center gap-2.5 cursor-pointer transition-all group active:scale-[0.98]"
                            >
                              <img
                                src={getSurplusPhoto(item)}
                                alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover border border-[#DCE5DB] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-[11px] text-[#143628] group-hover:text-[#2D6A4F] truncate transition-colors">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-[#597367] truncate">{item.providerBusinessName}</div>
                                <div className="text-[10px] text-[#2D6A4F] font-medium flex items-center gap-1 mt-0.5">
                                  <Clock size={9} />
                                  <span>{formatCountdown(item.expiryTime)}</span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                item.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                              }`}>
                                {item.isFree ? 'Free' : formatPrice(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Link */}
                      {msg.actionLink && (
                        <a
                          href={msg.actionLink.href}
                          onClick={() => setIsOpen(false)}
                          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2D6A4F] hover:underline"
                        >
                          <ArrowRight size={11} />
                          <span>{msg.actionLink.label}</span>
                        </a>
                      )}

                      {/* Timestamp + model badge */}
                      <div className={`text-[9px] mt-1.5 flex items-center justify-between ${isBot ? 'text-[#597367]' : 'text-white/50'}`}>
                        <span>{msg.timestamp}</span>
                        {msg.isLLM && msg.modelUsed && (
                          <span className="text-[8px] font-mono text-[#2D6A4F]/70 flex items-center gap-0.5">
                            <Zap size={7} />
                            {msg.modelUsed}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5">
                  <SaraAvatar size="sm" />
                  <div className="bg-white border border-[#DCE5DB] rounded-[16px] rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2 shadow-2xs">
                    <div className="flex gap-1 items-center">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#597367] font-medium">SARA is thinking…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Food Item Detail Modal ── */}
            <AnimatePresence>
              {selectedFoodItem && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3"
                >
                  <motion.div
                    initial={{ scale: 0.92, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, y: 15 }}
                    className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#DCE5DB] flex flex-col max-h-[90%]"
                  >
                    <div className="relative h-40 bg-stone-100 shrink-0">
                      <img src={getSurplusPhoto(selectedFoodItem)} alt={selectedFoodItem.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSelectedFoodItem(null)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center cursor-pointer transition-all"
                      ><X size={14} /></button>
                      <div className="absolute bottom-2 left-2 flex gap-1.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${selectedFoodItem.isFree ? 'bg-emerald-600 text-white' : 'bg-white text-[#143628]'}`}>
                          {selectedFoodItem.isFree ? '100% FREE' : formatPrice(selectedFoodItem.price)}
                        </span>
                        <span className="text-[11px] bg-black/70 text-white px-2.5 py-1 rounded-full font-semibold">
                          {selectedFoodItem.quantity} kg
                        </span>
                      </div>
                    </div>

                    <div className="p-4 overflow-y-auto space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-[#143628] leading-snug">{selectedFoodItem.name}</h4>
                        <p className="text-xs text-[#597367] mt-0.5 leading-relaxed">
                          {selectedFoodItem.description || 'Wholesome, high-quality surplus food ready for consumption.'}
                        </p>
                      </div>

                      <div className="bg-[#F7F9F6] p-2.5 rounded-xl border border-[#DCE5DB] text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-[#143628] font-semibold">
                          <MapPin size={12} className="text-[#2D6A4F] shrink-0" />
                          <span className="truncate">{selectedFoodItem.providerBusinessName}</span>
                        </div>
                        <div className="text-[11px] text-[#597367] pl-4">{selectedFoodItem.address}</div>
                        <div className="flex items-center gap-2 text-[11px] text-[#597367] pt-0.5">
                          <Clock size={11} className="text-[#B8401A] shrink-0" />
                          <span>
                            Pickup before: {selectedFoodItem.expiryTime
                              ? new Date(selectedFoodItem.expiryTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                              : 'Today'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                        <span className="text-[11px] text-emerald-900">Verified under BPOM & HACCP food safety protocols.</span>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          onClick={handleClaimFood}
                          className="w-full py-2.5 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                          style={{ background: 'linear-gradient(135deg, #143628 0%, #2D6A4F 100%)' }}
                        >
                          <ShoppingBag size={13} />
                          {isAuthenticated ? 'Claim / Order Now' : 'Log In to Claim Food'}
                        </button>
                        <button
                          onClick={() => { setSelectedFoodItem(null); setIsOpen(false); window.location.hash = '#/penerima'; }}
                          className="w-full py-2 bg-white hover:bg-stone-50 border border-[#DCE5DB] text-[#143628] rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MapPin size={12} />
                          View on Live Map
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input Bar ── */}
            <div className="p-3 bg-white border-t border-[#DCE5DB] shrink-0">
              <div className="flex items-center gap-2 bg-[#F7F9F6] border border-[#DCE5DB] focus-within:border-[#2D6A4F] focus-within:bg-white rounded-full px-3.5 py-2 transition-all shadow-2xs">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasKey ? 'Ask SARA anything…' : 'Search surplus food, recipes, or safety tips…'}
                  className="flex-1 bg-transparent text-xs text-[#143628] focus:outline-none placeholder:text-[#597367]/55"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputValue.trim() && !isTyping
                      ? 'text-white shadow-xs'
                      : 'bg-[#DCE5DB] text-white/60 cursor-not-allowed'
                  }`}
                  style={inputValue.trim() && !isTyping ? {
                    background: 'linear-gradient(135deg, #143628 0%, #2D6A4F 100%)',
                  } : {}}
                  aria-label="Send"
                >
                  <Send size={13} className="translate-x-[0.5px]" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1.5 px-1 text-[9px] text-[#597367]/75">
                <span className="flex items-center gap-1">
                  {hasKey
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Powered by Google Gemini AI</>
                    : <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> SARA Smart Engine Mode</>
                  }
                </span>
                <button
                  onClick={() => setShowSettings(true)}
                  className="hover:underline text-[#2D6A4F] font-semibold cursor-pointer"
                >
                  {hasKey ? 'Change API Key' : '⚡ Activate Full AI'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
