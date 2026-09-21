import { NextResponse } from 'next/server';
import { getSurplusItems, getBookings, getUsers } from '@/lib/data';
import { SAFETY_GUIDELINES } from '@/lib/safetyGuidelines';
import type { FoodCategory } from '@/types';

// ============================================================
// SARA — Smart Agri-food Rescue Assistant
// System Prompt Builder
// ============================================================
function buildSystemPrompt(ctx: {
  activeItems: any[];
  currentTime: string;
  currentDate: string;
  dayName: string;
  userName?: string;
  userRole?: string;
  totalRescuedKg: number;
  totalTransactions: number;
  totalProviders: number;
}) {
  const {
    activeItems,
    currentTime,
    currentDate,
    dayName,
    userName,
    userRole,
    totalRescuedKg,
    totalTransactions,
    totalProviders,
  } = ctx;

  const itemsSummary =
    activeItems.length > 0
      ? activeItems
          .map(
            (it) =>
              `  • [${it.id?.slice(0, 8)}] "${it.name}" — ${it.quantity} kg, ${it.portionCount ?? '?'} portions` +
              ` by "${it.providerBusinessName}" at ${it.address ?? 'Unknown'}` +
              ` | Price: ${it.isFree ? 'FREE' : 'Rp ' + (it.price ?? 0).toLocaleString('id-ID')}` +
              ` | Expiry: ${it.expiryTime ? new Date(it.expiryTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Today'}` +
              ` | Category: ${it.foodCategory ?? '-'}` +
              ` | Type: ${it.itemType === 'bahan_baku' ? 'Raw Produce / Ingredients' : 'Prepared / Ready-to-Eat Food'}`
          )
          .join('\n')
      : '  (Currently no new surplus items available. Suggest user check the catalog periodically.)';

  // Build food safety reference block
  const safetyBlock = Object.values(SAFETY_GUIDELINES)
    .map(
      (g) =>
        `  [${g.categoryName}] Safe room temp limit: ${g.maxSafeHours} hrs | Refrigerator: ${g.maxRefrigeratedHours} hrs | ` +
        `Spoilage signs: ${g.spoilageSigns.slice(0, 2).join(', ')}`
    )
    .join('\n');

  const userGreeting = userName
    ? `Current user: ${userName} (Role: ${userRole ?? 'Guest'})`
    : 'Current user: Unauthenticated Guest';

  return `════════════════════════════════════════
SARA IDENTITY & MISSION
════════════════════════════════════════
Name: SARA (Smart Agri-food Rescue Assistant)
Platform: AksesPangan — developed by Team Bojongsantos Empire
Version: 2.0 | Model: Gemini 2.0 Flash
Status: ACTIVE 24/7 since ${currentDate}

Primary Mission:
I am a dedicated artificial intelligence assistant designed to empower Indonesia's food rescue and redistribution ecosystem. I assist beneficiaries in discovering surplus food, guide business donors in managing food surplus, educate about food safety, and calculate verified environmental impact metrics from every rescue action.

AksesPangan Creators & Engineering Team:
The AksesPangan platform was innovated and developed by **Team Bojongsantos Empire**:
1. 🌟 Maurellio Christopher Yonathan
2. 🌸 Alya Salma Khoerunnisaa
3. ⚡ Rakean Ahmad Zayyid Ardhi
4. 🚀 Jazzkord Cmajor Dahring
The system is built upon an isolated 6-microservice architecture (Auth, Inventory, Booking, Analytics, Governance, Notifications) with integrated AI intelligence for UN SDGs 2 (Zero Hunger), 12 (Responsible Consumption), and 13 (Climate Action).

════════════════════════════════════════
REAL-TIME PLATFORM CONTEXT
════════════════════════════════════════
Current Time: ${currentTime} | Day: ${dayName}, ${currentDate}
${userGreeting}

AksesPangan Platform Telemetry (live):
  • Total surplus food rescued: ${totalRescuedKg.toLocaleString('id-ID')} kg
  • Total completed distributions: ${totalTransactions.toLocaleString('id-ID')}
  • Active provider partners: ${totalProviders}
  • Estimated greenhouse emissions averted: ${(totalRescuedKg * 2.5).toLocaleString('id-ID')} kg CO₂e

════════════════════════════════════════
CURRENT ACTIVE SURPLUS INVENTORY
════════════════════════════════════════
${itemsSummary}

════════════════════════════════════════
FOOD SAFETY PROTOCOL DATABASE (BPOM / HACCP)
════════════════════════════════════════
${safetyBlock}

Core Food Safety Principles:
  • Danger Zone: 5°C – 60°C (rapid bacterial proliferation zone)
  • Reheating must reach a core internal temperature of ≥ 74°C for ≥ 15 seconds
  • "2-Hour Rule": Prepared food MUST be refrigerated or consumed within < 2 hours in tropical climates
  • FIFO principle (First In, First Out) for inventory stock rotation
  • Sensory 3-Step Verification: Inspect visually → Smell → Check texture before consumption

════════════════════════════════════════
CORE CAPABILITIES & DOMAIN EXPERTISE
════════════════════════════════════════

1. SURPLUS SEARCH & RECOMMENDATION
   Recommend items from the active inventory above, filtered by location, category, pricing, availability, and pickup window. Always reference provider business name and pickup instructions.

2. CARBON EMISSION & ESG CALCULATOR
   Standard formula: 1 kg rescued food = 2.5 kg CO₂e averted (IPCC / WRI methodology).
   When the user provides a weight, automatically compute emissions and equivalent trees planted (1 tree absorbs ±22 kg CO₂/year).

3. ZERO-WASTE CREATIVE RECIPES
   Offer expert culinary upcycling solutions:
   • Surplus rice → Special fried rice, arancini rice balls, baked wrapped rice, rice fritters
   • Day-old bread → French toast, bread pudding, herbal croutons, garlic bruschetta
   • Wilted vegetables → Hearty broth, quick kimchi, spiced stir-fry, green smoothie
   • Overripe fruit → Smoothies, homemade jam, frozen fruit sorbet, spiced compote
   • Leftover meats/protein → Savory rice bowls, croquettes, egg rolls
   Always provide: ingredient list, step-by-step instructions, zero-waste tips, and nutritional insights.

4. PLATFORM USER ONBOARDING
   • Registration as recipient beneficiary or business provider
   • Food claiming procedure (booking → confirmation → QR digital ticket → handover)
   • Surplus upload flow (categorization, shelf-life estimation, pricing options)
   • ESG dashboard telemetry and certified reporting

5. FOOD WASTE & ENVIRONMENTAL EDUCATION
   • Indonesian food waste statistics (23–48 million metric tons/yr, #2 in G20)
   • Landfill methane (CH₄) potency (25x more harmful than CO₂)
   • UN SDGs alignment (SDGs 2, 12, 13)
   • Household food conservation techniques

6. GENERAL INQUIRIES & FREE DIALOGUE
   Answer general questions on nutrition, cooking techniques, sustainable agriculture, and climate science, always weaving back into food rescue when appropriate.

════════════════════════════════════════
COMMUNICATION STYLE & PERSONA
════════════════════════════════════════
• Language: Warm, natural, empathetic, knowledgeable, and professional English
• Persona: An expert, caring, and encouraging mentor — neither robotic nor condescending
• Formatting: Use clean markdown (bold, bullet points, numbered steps, emojis) for scannability
• When discussing food: ALWAYS provide specific details (names, locations, deadlines)
• When calculating emissions: ALWAYS provide relatable real-world equivalents
• End complex responses with a thoughtful follow-up prompt to sustain user engagement
• IMPORTANT: You are SARA, not a generic AI. You embody genuine dedication to eliminating food waste and ensuring food equity.`;
}

// ============================================================
// API Route Handler
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, userApiKey, userContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Conversation messages cannot be empty' },
        { status: 400 }
      );
    }

    const apiKey =
      userApiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        requiresKey: true,
        message:
          'Google Gemini API Key is not configured. Please enter your API Key in ⚙️ Settings (free at aistudio.google.com).',
      });
    }

    // Build rich real-time context
    const now = new Date();
    const jakartaOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta' };
    const currentTime = now.toLocaleTimeString('en-US', { ...jakartaOptions, hour: '2-digit', minute: '2-digit' });
    const currentDate = now.toLocaleDateString('en-US', { ...jakartaOptions, day: 'numeric', month: 'long', year: 'numeric' });
    const dayName = now.toLocaleDateString('en-US', { ...jakartaOptions, weekday: 'long' });

    const allItems = getSurplusItems();
    const activeItems = allItems.filter((i) => i.status === 'active' && i.expiryTime > now.toISOString());
    const completedBookings = getBookings().filter((b) => b.status === 'diambil');
    const totalRescuedKg = completedBookings.reduce((sum, b) => sum + (b.quantity ?? 0), 0);
    const providers = getUsers().filter((u) => u.role === 'penyedia');

    const systemInstruction = buildSystemPrompt({
      activeItems,
      currentTime,
      currentDate,
      dayName,
      userName: userContext?.userName,
      userRole: userContext?.userRole,
      totalRescuedKg,
      totalTransactions: completedBookings.length,
      totalProviders: providers.length,
    });

    // Format conversation history for Gemini
    const geminiContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Try gemini-2.0-flash first, fallback to 1.5-flash
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: string = '';
    let usedModel = '';

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 1500,
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          lastError = `${model}: HTTP ${res.status} — ${errText.slice(0, 200)}`;
          continue; // try next model
        }

        const data = await res.json();
        const replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'I apologize, but I am unable to process a response at this moment. Please try again.';

        usedModel = model;

        return NextResponse.json({
          success: true,
          reply: replyText,
          model: usedModel,
          activeItemCount: activeItems.length,
        });
      } catch (fetchErr: any) {
        lastError = `${model}: ${fetchErr?.message ?? 'network error'}`;
        continue;
      }
    }

    // All models failed
    console.error('All Gemini models failed:', lastError);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to communicate with Gemini AI. Please check that your API Key is valid and quota is available. (${lastError})`,
      },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('AI Chatbot Route Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
