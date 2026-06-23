import { SCITBDTask, SCITBDKpi, TimeBlock, PresetPrompt, GoogleChatSpace, GoogleContact } from "./types";

export const INITIAL_TASKS: SCITBDTask[] = [
  // 4.1 Marketing & Brand Division
  {
    id: 1,
    title: "Global Branding Overhaul",
    description: "Develop a unified visual identity system for SCITBD across all digital touchpoints. Deliverable: Brand Kit v2.0 (logo variants, color system, typography, social templates, pitch master).",
    division: "marketing",
    priority: "CRITICAL",
    deadline: "Rolling Monthly",
    kpi: "Complete Brand Kit v2.0",
    status: "in_progress"
  },
  {
    id: 2,
    title: "LinkedIn Authority Campaign",
    description: "Post 30 thought-leadership articles per month on LinkedIn targeting CTO, CIO, and Digital Director personas in UAE, UK, USA, and Australia.",
    division: "marketing",
    priority: "CRITICAL",
    deadline: "Rolling Monthly",
    kpi: "500+ new LinkedIn followers/month",
    status: "in_progress"
  },
  {
    id: 3,
    title: "SEO Domination Plan",
    description: "Target 200 high-intent keywords across 10 service categories. Publish optimized landing pages per country market.",
    division: "marketing",
    priority: "CRITICAL",
    deadline: "Rolling Monthly",
    kpi: "Top-5 Google ranking for 50 keywords within 90 days",
    status: "not_started"
  },
  {
    id: 4,
    title: "Video Marketing Machine",
    description: "Produce 8 short-form videos per month (TikTok/Reels/YouTube Shorts) showcasing SCITBD projects, client testimonials, and tech tutorials.",
    division: "marketing",
    priority: "HIGH",
    deadline: "Rolling Monthly",
    kpi: "10,000 views per video within 30 days",
    status: "not_started"
  },
  {
    id: 5,
    title: "Case Study Arsenal",
    description: "Document 5 new client success stories per month with quantified results (e.g., 300% traffic increase, 40% cost reduction). Publish as gated PDFs.",
    division: "marketing",
    priority: "HIGH",
    deadline: "Rolling Monthly",
    kpi: "5 new case studies per month",
    status: "completed"
  },

  // 4.2 Sales & Business Development Division
  {
    id: 6,
    title: "International Client Acquisition",
    description: "Identify and approach 50 new qualified prospects per week from target markets (UAE, UK, USA, Canada, Germany, Australia). Use LinkedIn Sales Navigator + cold outreach email flows.",
    division: "sales",
    priority: "CRITICAL",
    deadline: "Rolling Weekly",
    kpi: "50 qualified prospects approached/week",
    status: "in_progress"
  },
  {
    id: 7,
    title: "Proposal Factory",
    description: "Maintain a library of 50 customizable proposal templates covering all 10 service categories. Generate tailored proposals within 2 hours of inquiries.",
    division: "sales",
    priority: "CRITICAL",
    deadline: "Rolling Weekly",
    kpi: "Standard library updated; 2-hr response turnaround",
    status: "completed"
  },
  {
    id: 8,
    title: "Partnership Network",
    description: "Establish reseller and referral partnerships with 10 IT agencies in target countries per quarter. Offer 15% commission on referred projects.",
    division: "sales",
    priority: "HIGH",
    deadline: "Quarterly",
    kpi: "10 reseller agreements per quarter",
    status: "not_started"
  },
  {
    id: 9,
    title: "Tender & RFP Monitoring",
    description: "Monitor government procurement portals in Bangladesh, UAE, UK, and Australia daily. Submit proposals for all relevant tenders within 24 hours.",
    division: "sales",
    priority: "HIGH",
    deadline: "Rolling Weekly",
    kpi: "Daily portal sweeps; 24-hr RFP submissions",
    status: "in_progress"
  },
  {
    id: 10,
    title: "Retainer Conversion",
    description: "Convert 30% of one-time project clients into monthly retainer agreements (Digital Marketing, IT Support AMC, Cloud Management).",
    division: "sales",
    priority: "HIGH",
    deadline: "Rolling Weekly",
    kpi: "20 active retainer clients within 6 months",
    status: "not_started"
  },

  // 4.3 AI & Technology Division
  {
    id: 11,
    title: "AI Product Suite Launch",
    description: "Develop 3 proprietary AI-powered SaaS products (AI Chatbot Builder, AI Content Generator, AI Business Analytics Dashboard) branded under SCITBD.",
    division: "tech",
    priority: "HIGH",
    deadline: "Quarterly Milestones",
    kpi: "3 proprietary AI tools launched with subscription layers",
    status: "in_progress"
  },
  {
    id: 12,
    title: "Marketing Automation Stack",
    description: "Deploy an integrated stack of AI tools for autonomous lead scoring, email personalization, ad bid optimization, and social media scheduling.",
    division: "tech",
    priority: "HIGH",
    deadline: "Quarterly Milestones",
    kpi: "Reduce manual marketing effort by 70%",
    status: "in_progress"
  },
  {
    id: 13,
    title: "Client AI Pilots",
    description: "Offer free 30-day AI chatbot trials to 20 enterprise prospects per month. Convert trial users to paid clients at minimum 25% conversion rate.",
    division: "tech",
    priority: "HIGH",
    deadline: "Quarterly Milestones",
    kpi: "20 pilots/month; 25% paid conversion rate",
    status: "not_started"
  },
  {
    id: 14,
    title: "Data Analytics Dashboard",
    description: "Build a real-time CEO intelligence dashboard tracking: website traffic, ad spend ROI, lead pipeline, project delivery status, client NPS, and revenue forecast.",
    division: "tech",
    priority: "HIGH",
    deadline: "Quarterly Milestones",
    kpi: "Live dashboard tracking 6 major modules",
    status: "completed" // This application is it!
  },

  // 4.4 Client Success & Retention Division
  {
    id: 15,
    title: "NPS Program Implementation",
    description: "Implement monthly Net Promoter Score surveys for all active clients. CEO reviews every score below 50 personally within 48 hours.",
    division: "success",
    priority: "HIGH",
    deadline: "Rolling Monthly",
    kpi: "Survey completions; target NPS score of 70+",
    status: "in_progress"
  },
  {
    id: 16,
    title: "Upsell Automation",
    description: "Create automated upsell sequences for clients currently using only 1-2 services. Highlight complementary services with ROI projections.",
    division: "success",
    priority: "HIGH",
    deadline: "Rolling Monthly",
    kpi: "40% upsell acceptance rate",
    status: "not_started"
  },
  {
    id: 17,
    title: "24/7 Support Excellence",
    description: "Maintain sub-2-hour response SLA for all client support tickets. Publish monthly service uptime reports.",
    division: "success",
    priority: "HIGH",
    deadline: "Rolling Monthly",
    kpi: "Sub-2-hr SLA response; 99.9% uptime targets",
    status: "completed"
  },
  {
    id: 18,
    title: "Client Community Hub",
    description: "Launch a SCITBD client portal with knowledge base, project tracking, response channels, invoice management, and community forum.",
    division: "success",
    priority: "HIGH",
    deadline: "Rolling Monthly",
    kpi: "Deliver portal structure; complete launch in Q2 2026",
    status: "in_progress"
  },

  // 4.5 Finance & Growth Intelligence Division
  {
    id: 19,
    title: "Revenue Target Architecture",
    description: "Set and cascade quarterly revenue targets per service line. Q1 target: $250K USD. Q2 target: $400K USD. Year-end target: $1.5M USD.",
    division: "finance",
    priority: "CRITICAL",
    deadline: "Monthly Reporting",
    kpi: "Track against cascading quarterly and annual goals",
    status: "in_progress"
  },
  {
    id: 20,
    title: "Pricing Intelligence Audits",
    description: "Conduct bi-annual competitive pricing audits against top 10 competing IT firms in South Asia and target markets. Maintain value-premium tier.",
    division: "finance",
    priority: "CRITICAL",
    deadline: "Monthly Reporting",
    kpi: "Bi-annual audits; optimized service pricing matrix",
    status: "not_started"
  },
  {
    id: 21,
    title: "CAC & LTV Tracking",
    description: "Track Customer Acquisition Cost (CAC) and Lifetime Value (LTV) per market segment.",
    division: "finance",
    priority: "CRITICAL",
    deadline: "Monthly Reporting",
    kpi: "Validate LTV:CAC ratio is at least 5:1",
    status: "in_progress"
  },
  {
    id: 22,
    title: "Profitability Dashboard P&L",
    description: "Generate monthly P&L summaries per service category. Identify underperforming service lines and trigger CEO reviews for strategic pivots.",
    division: "finance",
    priority: "CRITICAL",
    deadline: "Monthly Reporting",
    kpi: "P&L report generation by first Tuesday of each month",
    status: "in_progress"
  }
];

export const INITIAL_KPIS: SCITBDKpi[] = [
  { metric: "Monthly Revenue", baseline: "$50K USD", target6m: "$200K USD", target12m: "$500K USD", current: "$124K USD" },
  { metric: "New Leads / Month", baseline: "80 Leads", target6m: "200 Leads", target12m: "500+ Leads", current: "165 Leads" },
  { metric: "Website Organic Traffic", baseline: "12,000 / mo", target6m: "25,000 / mo", target12m: "100,000 / mo", current: "19,450 / mo" },
  { metric: "LinkedIn Followers", baseline: "2,100", target6m: "5,000", target12m: "25,000", current: "4,680" },
  { metric: "Active Retainer Clients", baseline: "6 Retainers", target6m: "20 Retainers", target12m: "60 Retainers", current: "12 Retainers" },
  { metric: "Countries with Active Projects", baseline: "18 Countries", target6m: "40+ Countries", target12m: "60+ Countries", current: "32 Countries" },
  { metric: "Client NPS Score", baseline: "55", target6m: "65+", target12m: "75+", current: "68" },
  { metric: "Google Ad ROAS", baseline: "2.4x", target6m: "4x", target12m: "8x", current: "3.7x" },
  { metric: "Proposal-to-Win Rate", baseline: "18%", target6m: "30%", target12m: "45%", current: "26%" },
  { metric: "Staff Headcount", baseline: "12", target6m: "+15 Hires", target12m: "+40 Hires", current: "19" }
];

export const DAILY_OPERATIONAL_CYCLE: TimeBlock[] = [
  {
    time: "00:00 – 06:00 UTC",
    zone: "Asia / BD / ME Focus",
    task: "Publish SEO blog content, schedule social posts for LinkedIn & TikTok, generate lead nurturing emails for South Asian pipeline."
  },
  {
    time: "06:00 – 12:00 UTC",
    zone: "Europe / UK Focus",
    task: "Run Google Ads audits, analyze UK/EU campaign performance, create B2B outreach sequences for enterprise clients in Germany & France."
  },
  {
    time: "12:00 – 18:00 UTC",
    zone: "North America Focus",
    task: "Launch Facebook & LinkedIn ad campaigns targeting US/Canada SMEs, generate proposals for SaaS startups, update CRM pipeline data."
  },
  {
    time: "18:00 – 24:00 UTC",
    zone: "Oceania / Africa Focus",
    task: "Monitor campaign metrics, produce performance reports, generate content for Australian & African markets, refine ad targeting algorithms."
  }
];

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: "mkt1",
    category: "marketing",
    title: "LinkedIn Healthcare UAE Authority",
    prompt: "As SCITBD CEO, write a LinkedIn post that positions our AI & Data Solutions service as the top choice for healthcare companies in the UAE. Include a specific pain point (compliance/efficiency), our custom solution, a success outcome, and an authoritative CTA. Tone: Visionary, data-driven executive authority."
  },
  {
    id: "mkt2",
    category: "marketing",
    title: "UK EdTech LMS Drip Sequence",
    prompt: "Generate a 7-email drip campaign targeting EdTech startups in the UK who need our robust, interactive E-Learning & LMS custom solution. Each email should have an engaging subject line, high-converting body text with 1 clear CRM demo CTA, and a P.S. highlighting regional case studies. Ramp up intensity and value from mail 1 to 7."
  },
  {
    id: "mkt3",
    category: "marketing",
    title: "Australia Cybersecurity Ads",
    prompt: "Write 5 high-converting Google Search Ad copies for our expert Cybersecurity & IT Support service targeting small-to-medium businesses in Australia. Include rich target keywords, Headlines (max 30 characters), and Descriptions (max 90 characters)."
  },
  {
    id: "bd1",
    category: "bd",
    title: "Germany Logistics ERP Outreach",
    prompt: "As SCITBD CEO, write a high-precision B2B cold outreach message for an enterprise German logistics company that needs our custom ERP and custom systems. Reference their bottlenecks (tracking, route optimization), our global track record in 30+ countries, security standards, and offer a free consultancy briefing. Keep it concise, professional, and under 150 words."
  },
  {
    id: "bd2",
    category: "bd",
    title: "Apex Strategic Competitor Audit",
    prompt: "Generate a strategic competitive analysis pitting SCITBD against the top 3 digital agency firms in South Asia. Contrast our unique strengths, technology focus (AI agents, custom hospital portals), cost advantages, global delivery networks, and lay out actionable market-differentiation techniques for SCITBD."
  },
  {
    id: "ops1",
    category: "operations",
    title: "Head of Marketing Onboarding",
    prompt: "Create an intensive 30-60-90 day onboarding plan for a new Head of B2B Marketing at SCITBD. Include weekly sprint milestones, SaaS tools to master, campaign pipelines to launch, and first quarter performance KPI targets."
  },
  {
    id: "ops2",
    category: "operations",
    title: "Sales OKR Architecture",
    prompt: "As SCITBD CEO, draft a quarterly OKR (Objectives & Key Results) document for the Sales & BD Division featuring 3 strategic revenue/pipeline objectives and 4 quantitative key results each, fully aligned with achieving our target of $500K USD revenue in 6 months."
  }
];

export const SANDBOX_SPACES: GoogleChatSpace[] = [
  { name: "spaces/mock1", displayName: "📣 scitbd-marketing-growth", type: "SPACE" },
  { name: "spaces/mock2", displayName: "💼 scitbd-bd-leads-deals", type: "SPACE" },
  { name: "spaces/mock3", displayName: "🤖 scitbd-ai-tech-pilots", type: "SPACE" },
  { name: "spaces/mock4", displayName: "❤️ scitbd-success-retainment", type: "SPACE" },
  { name: "spaces/mock5", displayName: "📈 scitbd-finance-intelligence", type: "SPACE" }
];

export const SANDBOX_CONTACTS: GoogleContact[] = [
  { id: "people/c1", name: "Ahmed Al-Mansoori", email: "ahmed.mansoori@healthuae.ae", phone: "+971 50 123 4567" },
  { id: "people/c2", name: "Dr. Sarah Jenkins", email: "sarah.j@london-edtech.co.uk", phone: "+44 20 7946 0192" },
  { id: "people/c3", name: "Markus Schneider", email: "schneider@hamburg-logistik.de", phone: "+49 40 456789" },
  { id: "people/c4", name: "Lachlan O'Connor", email: "l.oconnor@sydney-retail.com.au", phone: "+61 2 9876 5432" },
  { id: "people/c5", name: "Kabir Hossain", email: "kabir@scitbd.com", phone: "+880 1711223344" }
];
