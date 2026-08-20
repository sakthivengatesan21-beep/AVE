# ProofStay — Evidence-Based Rental Damage Attribution System

ProofStay is a renter-focused web application designed to determine whether property condition changes at move-out are:
- Pre-existing
- Newly appeared
- Normal wear-and-tear
- Potentially maintenance-related
- Potentially tenant-related
- Inconclusive

## Key Concept

> **Compare the property's condition over time and connect visual evidence with maintenance events to produce an evidence-based damage attribution report.**

ProofStay never claims legal liability or assigns direct blame. All AI conclusions use objective non-accusatory language backed by physical photographs, timestamps, and building incident logs.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Database**: Supabase PostgreSQL / LocalStorage Fallback
- **AI Vision & Temporal Reasoning**: OpenAI GPT-4o-mini (Vision API) with structured JSON output and Demo Fallback Mode
- **UI Components**: Lazarev property inspection design system

---

## Getting Started

### Prerequisites

- Node.js 18+ and `npm`

### Setup & Run

1. Clone repo and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Build production bundle:
   ```bash
   npm run build
   ```

---

## Demo Mode

ProofStay runs out-of-the-box with **pre-loaded demo data** for **Greenwood Apartment 204** without requiring an OpenAI API key or Supabase credentials.

Pre-loaded Scenarios:
1. **Pre-existing Crack (Kitchen)**: Hairline crack recorded at move-in and unchanged at move-out.
2. **Maintenance-Related Stain (Kitchen Ceiling)**: Clean ceiling at move-in + Oct 12 water leak report → Move-out yellow stain ring.
3. **New / Unexplained Scratch (Bedroom)**: Clean drywall at move-in + Move-out 15cm abrasion with no corresponding maintenance event.

To enable live OpenAI Vision analysis, set `OPENAI_API_KEY` in your environment variables.

---

## Database Schema

Database tables are located in `database/schema.sql`:
- `properties`
- `rooms`
- `evidence`
- `maintenance_events`
- `damage_analyses`
- `reports`

---

## Important Legal Disclaimer

This report is an evidence organization and temporal visual analysis tool. It does not determine legal liability, contractual responsibility, or entitlement to a security deposit refund. Final decisions should be made by relevant parties or qualified professionals.
