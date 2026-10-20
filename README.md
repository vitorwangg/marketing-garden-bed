# Teste novo layout

Este é o momento divisor de águas. Para o **Lovable** (que utiliza React, Tailwind CSS e integração com Supabase) construir não apenas uma casca, mas um ecossistema funcional com a alma da **GT Flow**, o prompt precisa ser uma peça de **Arquitetura de Software e Design System**.

Aqui está o **Master Prompt de Engenharia PhD** para o Lovable. Copie do início ao fim.

---

# MASTER PROMPT: GT FLOW HUB – PHASE 1: CORE ARCHITECTURE & UI/UX

**Role:** Senior Full-Stack Engineer & Lead UI/UX Designer.
**Objective:** Build a high-end MaaS (Marketing as a Service) platform named "GT FLOW HUB" using React, Tailwind CSS, Lucide Icons, and Framer Motion. The platform must follow the "Pastel Bento & Playful UI" design system.

## 1. DESIGN SYSTEM & AESTHETICS (GLOBAL)

* **Visual Language:** Pastel Bento Grid. No borders, use depth and shadows.
* **Palette:** - Background: Warm Off-White `#FDFBF7`.
* Cards: Pure White `#FFFFFF`.
* Accents: Pastel Peach-to-Pink gradient, Soft Lilac, Mint Green.


* **Geometry:** Extreme rounded corners (32px Squircles).
* **Shadows:** Volumetric, large, soft diffuse shadows (`shadow-[0_20px_50px_rgba(0,0,0,0.05)]`).
* **Typography:** Modern geometric sans-serif (Outfit or Inter).
* **Navigation:** Universal Floating Pill (Bottom Navigation) with `backdrop-blur-md` and 70% opacity.

## 2. USER STATE & AUTH LOGIC (MOCKUP DATA)

Implement a mock authentication system for demonstration:

* **João (Enterprise):** `joao@gtflow.com` | Access: All modules unlocked, 4 brands in Brand DNA, Dim Neutron active.
* **Vitor (Starter):** `vitor@gtflow.com` | Access: 1 brand, Ads Intel restricted, Dim Neutron locked (Frosted Glass overlay).
* **Maria (New Client):** `maria@gtflow.com` | Access: Direct redirect to "Ver Planos" (Pricing).

## 3. PAGE ARCHITECTURE (8 MODULES)

### A. LOGIN (IMMERSIVE GATEWAY)

* Full-screen centered card.
* Inputs for Email/Password with focus ring pastel glow.
* "Entrar" button with vibrant peach gradient.
* Row of 3 quick-access profile pills: João, Vitor, Maria.

### B. DASHBOARD (THE CONSOLE)

* Asymmetric Bento Grid.
* **KPI Cards:** "Total Investido" (R$ 15.430) with sparkline; "Leads" (842) with +12% badge.
* **Action Tiles:** Large tile for "Fábrica de Conteúdo" with AI icon.

### C. BRAND DNA (THE MAESTRO)

* **Top Carousel:** Horizontal brand selection (João sees 4, Vitor sees 1).
* **Grid Tiles:** - "Identidade Visual" (Logo dropzone + 5 color pickers).
* "Tom de Voz" (Multi-select chips: Criativo, Luxo, Amigável).
* "Público-Alvo" (Textarea with auto-save).
* "Palavras Proibidas" (Red-tinted tag input).



### D. FÁBRICA DE CONTEÚDO (AI ENGINE)

* **Workflow Tabs:** Criação, Aprovação, Histórico.
* **Trends_Accelerator Tile:** Search bar + Pastel chips (🔥 Dia das Mães, SEO, Trends).
* **Chat Input:** Bottom bar with "/" commands and "Sparkle" button.
* **Preview Card:** Real-time social media post mockup with "Aprovar e Publicar" button.

### E. CONCIERGE SDR (CRM)

* **Lead Table:** Columns: Lead, WhatsApp, Localidade, Status (No Robô, Venda, Humano).
* **Detail Drawer:** Slide-out right panel showing `Live_Transcript` (AI vs Lead chat history).
* **Handover Toggle:** "Assumir Controle" switch to pause AI.

### F. ADS INTELLIGENCE (META REPORTS)

* Top KPI row: ROI Real (4.2x), CPL (R$ 18,30).
* **Accordion List:** Campaign rows that expand with a Chevron to show CTR (2.1%), CPC (R$ 0,45), and Frequency.

### G. DIM NEUTRON (AUDIT & UPSELL)

* If `user_plan != 'enterprise'`: Render a heavy `backdrop-blur-xl` (Frosted Glass) over the data.
* **Overlay Card:** Neon padlock icon, text "Acesso Restrito: Dim Neutron", and "Upgrade to Enterprise" gradient button.
* If unlocked: Show "Data Health Score" donut chart and "Recuperação de Lucros" metric.

### H. VER PLANOS (PRICING)

* Three vertical cards.
* **Center Card (Enterprise - R$ 15.000):** 10% larger, peach glow, listing "Dim Neutron Access".
* **Starter (R$ 4.900):** Mint green theme.
* Functional "Assinar" buttons that update the user state.

## 4. TECHNICAL REQUIREMENTS

* Use `framer-motion` for page transitions and hover effects on cards (Y-axis translation).
* Implement `Lucide React` for all icons.
* Use `shadcn/ui` components customized to squircle 32px.
* Responsive design: Mobile-friendly Bento stacking.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://marketing-garden-bed.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d4de136e-2460-4f2c-b9db-9008fd65280c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
