# Product Requirements Document
## CX Audit Scanner (working title)

**Version:** 1.0  
**Author:** David Beath  
**Date:** February 2026  
**Status:** Draft for Review

---

### 1. Overview

**What it is:** A web-based tool that generates an automated customer experience audit of a financial institution's public-facing digital properties. Point it at a bank or insurer, and it produces a scored assessment with specific findings and actionable recommendations.

**Why it exists:** To demonstrate David's ability to build useful BD tools with AI, and to show how he would walk into a first meeting with something valuable — an informed perspective on a prospect's digital experience — rather than just a pitch deck.

**Who it's for:** 
- Primary: TELUS Digital interviewers and hiring managers (to evaluate David's approach)
- Secondary: David himself, as a tool for preparing for prospect conversations

**Where it lives:** `xxxxx.thisisluminary.co` (publicly accessible, reasonably polished)

---

### 2. User Stories

**As a viewer (interviewer/hiring manager), I want to:**
- Enter a company name or URL and see an automated CX audit generated
- See the 20 target companies from PRD #1 pre-loaded as quick-select options
- Understand how the audit methodology works
- See specific, credible findings — not vague generalities
- Be impressed that David built this without being asked to

**As David, I want to:**
- Generate a CX audit for any financial services company before a meeting
- Have talking points grounded in actual observations, not assumptions
- Share a link to the tool or a specific audit with prospects
- Use this as a conversation starter: "I took a look at your digital experience..."

---

### 3. What Gets Audited

**Digital Properties Scanned:**

| Property | What We Assess | Data Source |
|----------|----------------|-------------|
| **Public Website** | Homepage clarity, navigation, value proposition, accessibility basics, mobile responsiveness, page load performance | Web fetch + Lighthouse/PageSpeed API |
| **Mobile App (iOS)** | App store rating, recent review sentiment, update frequency, feature completeness signals | Apple App Store (public listing + RSS reviews) |
| **Mobile App (Android)** | App store rating, recent review sentiment, update frequency | Google Play Store (public listing) |
| **Chatbot/Virtual Assistant** | Presence, discoverability, initial interaction quality | Manual or scripted check of website |
| **Login/Onboarding Flow** | Friction assessment based on public-facing signup pages (not actual account creation) | Web fetch of public pages |

**What We Don't Audit (Out of Scope):**
- Authenticated experiences (inside the app/online banking)
- Internal systems or employee-facing tools
- Backend performance or security
- Compliance or regulatory adherence
- Anything requiring account creation or login

---

### 4. Audit Output Structure

**Overall Score:** 0-100 composite score with tier label (Strong / Adequate / Needs Work)

**Category Scores:**

| Category | Weight | What It Measures |
|----------|--------|------------------|
| **AI Readiness** | 25% | Chatbot/virtual assistant presence and sophistication, AI-powered features in app/website, AI mentions in recent updates or marketing |
| **Mobile App Quality** | 25% | App store ratings, review sentiment, update cadence, feature signals |
| **Customer Sentiment** | 20% | What customers are actually saying in reviews |
| **Web Experience** | 15% | Site clarity, performance, mobile responsiveness |
| **Digital Accessibility** | 15% | Basic WCAG indicators, screen reader compatibility signals |

**Findings Section:**
- 3-5 specific observations per category
- Each finding includes: what was observed, why it matters, evidence/source
- Tone: Objective, specific, not preachy

**Recommendations Section:**
- 3-5 actionable opportunities based on findings
- Framed as "opportunities to improve" — not "here's what you're doing wrong"
- Generic enough to not name a specific vendor, but specific enough to be useful
- Example: "Mobile app reviews cite slow load times and frequent crashes. Investing in app performance optimization could significantly improve customer sentiment."

**Methodology Section:**
- Transparent explanation of what was scanned and how
- Limitations clearly stated
- "This is an outside-in assessment based on publicly available information"

---

### 5. Information Architecture

**Landing Page:**
- Brief explanation of what the tool does
- Input field: Company name or URL
- Quick-select grid: 20 pre-loaded financial institutions from PRD #1
- "Generate Audit" button

**Audit Loading State:**
- Progress indicator showing what's being scanned
- Estimated time: 30-60 seconds (may need to manage expectations)

**Audit Results Page:**
- Company header (name, logo, sector)
- Overall score with tier badge
- Category score breakdown (visual — bar chart or radar)
- Findings panels (expandable by category)
- Recommendations panel
- Methodology disclosure
- "Last Generated" timestamp
- Share link / permalink

**About Page:**
- Brief context: "I built this to prepare for business development conversations in financial services"
- Link to David's LinkedIn
- Link to GitHub repo

---

### 6. Technical Approach

**Frontend:**
- React single-page application
- Tailwind CSS (following frontend-design skill guidelines)
- Hosted at `xxxxx.thisisluminary.co`
- Responsive but optimized for desktop
- No authentication required

**Audit Generation Pipeline:**

1. **Input Parsing & Confirmation**
   - Accept company name or URL
   - If ambiguous, show confirmation step: "Did you mean ATB Financial (Alberta)?" with Yes/No
   - Once confirmed: resolve to primary website URL
   - Identify iOS/Android app store listings (lookup table for pre-loaded; search for ad-hoc)

2. **Web Experience Scan**
   - Fetch homepage and 2-3 key pages (about, contact, products)
   - Run through Claude to assess: clarity, navigation, value proposition, mobile-friendliness indicators
   - Optional: Call Google PageSpeed Insights API for performance metrics (free, 25K queries/day)

3. **Mobile App Scan**
   - **iOS:** Fetch app store listing page, pull rating, review count, last update date
   - **iOS Reviews:** Use Apple RSS feed to get recent reviews, run through Claude for sentiment
   - **Android:** Fetch Google Play listing page, pull rating, review count, last update date
   - Note: Google Play reviews harder to access without auth — may rely on listing page data only

4. **AI Readiness Scan**
   - Check homepage and key pages for chatbot/virtual assistant presence (Intercom, Drift, custom implementations)
   - Scan app store descriptions for AI-related keywords ("AI-powered", "smart", "personalized", "intelligent", "machine learning", "virtual assistant")
   - Check recent press releases or news for AI announcements
   - Assess chatbot sophistication if present (is it just FAQ, or does it handle complex queries?)

5. **Synthesis & Scoring**
   - Send all collected data to Claude API
   - Prompt to generate: category scores, findings, recommendations
   - Apply weighting to produce overall score
   - Return structured JSON

6. **Caching**
   - Cache audit results for 7 days per company
   - Show "Generated on [date]" and option to regenerate

**API Dependencies:**

| Service | Purpose | Cost |
|---------|---------|------|
| Claude API | Analysis, synthesis, scoring | ~$0.10-0.50 per audit |
| Google PageSpeed Insights | Web performance metrics | Free (25K/day) |
| Apple App Store (RSS) | iOS app reviews | Free |
| Web fetch | Homepage and key pages | Free |

**Hardening Requirements:**
- Graceful handling if any data source fails (partial audit is OK)
- Clear error states if company can't be found
- Timeout handling for slow fetches
- Rate limiting to prevent abuse (10 audits/hour per IP?)
- No console errors in production

---

### 7. Pre-loaded Companies

The 20 companies from PRD #1 are pre-loaded with:
- Verified website URL
- iOS App Store ID
- Google Play Store ID
- Logo URL

| Company | Website | iOS App | Android App |
|---------|---------|---------|-------------|
| JPMorgan Chase | chase.com | ✓ | ✓ |
| Bank of America | bankofamerica.com | ✓ | ✓ |
| Wells Fargo | wellsfargo.com | ✓ | ✓ |
| Citigroup | citi.com | ✓ | ✓ |
| Goldman Sachs | goldmansachs.com | ✓ (Marcus) | ✓ |
| Royal Bank of Canada | rbc.com | ✓ | ✓ |
| TD Bank | td.com | ✓ | ✓ |
| BMO | bmo.com | ✓ | ✓ |
| U.S. Bancorp | usbank.com | ✓ | ✓ |
| PNC Financial | pnc.com | ✓ | ✓ |
| Truist | truist.com | ✓ | ✓ |
| Capital One | capitalone.com | ✓ | ✓ |
| UnitedHealth Group | uhc.com | ✓ | ✓ |
| Elevance Health | anthem.com | ✓ | ✓ |
| Cigna | cigna.com | ✓ | ✓ |
| Humana | humana.com | ✓ | ✓ |
| Manulife | manulife.com | ✓ | ✓ |
| Sun Life | sunlife.com | ✓ | ✓ |
| MetLife | metlife.com | ✓ | ✓ |
| Prudential | prudential.com | ✓ | ✓ |

*App IDs to be populated during build.*

---

### 8. Design Direction

**Aesthetic:** Clean, professional, report-like. Should feel like a legitimate audit document, not a gimmicky tool.

**Tone:** "This is a credible, objective assessment."

**Key Principles:**
- Audit results should feel substantial and worth reading
- Scores should be visually clear at a glance
- Findings should be scannable but with depth available on expansion
- Recommendations should feel actionable, not generic

**Technical:**
- Tailwind CSS
- Follow frontend-design skill guidelines
- Neutral branding (no company logos beyond the audited company)
- Dark mode default to match PRD #1 aesthetic

**Visual Elements:**
- Score gauges or progress bars for category scores
- Expandable/collapsible finding cards
- Clear visual hierarchy between scores → findings → recommendations
- Subtle loading animations during audit generation

---

### 9. Out of Scope (v1)

- PDF export of audit
- Comparison between multiple companies
- Historical audit tracking (how has score changed over time)
- Deep chatbot interaction testing
- Authenticated experience auditing
- Security or compliance assessment
- Competitor benchmarking within the tool
- Custom audit criteria

---

### 10. Success Criteria

**For the Interview Context:**
- Viewer can generate an audit for any pre-loaded company in under 60 seconds
- Audit output feels credible and specific, not generic
- Viewer thinks "I could actually use this in a sales conversation"
- No errors or broken states during normal use

**For David's Ongoing Use:**
- Actually useful for prepping for prospect meetings
- Generates talking points he'd be comfortable using
- Easy to run ad-hoc for companies not in the pre-loaded list

---

### 11. Open Questions

| Question | Resolution |
|----------|------------|
| Ad-hoc company handling | Attempt auto-find with confirmation step ("Did you mean ATB Financial Alberta?") |
| Audit generation time | 60 seconds acceptable with progress indicators |
| Tone calibration | Current tone (moderately critical, constructive) is good |
| Category weights | AI Readiness 25%, Mobile App 25%, Customer Sentiment 20%, Web 15%, Accessibility 15% |

**Still Open:**

1. **Caching strategy:** Cache for 7 days? Allow manual regeneration? Show "stale" indicator?

2. **Rate limiting:** What's reasonable to prevent abuse? 10/hour? 50/day?

3. **App store search for ad-hoc:** What's the best way to find app store IDs for companies not in the pre-loaded list? Search by company name? Accept that it might miss some?

---

### 12. Connection to Account Scorer

These two tools work together:

- **Account Scorer** answers: "Are they likely to buy?" (High score = high priority)
- **CX Audit Scanner** answers: "Do they need help?" (Low score = more opportunity)

**Important framing:** A low CX Audit score is not a criticism — it's an indicator of opportunity. The audit should make this explicit.

**Integration points:**

1. **In the CX Audit results page:**
   - If company is in the Account Scorer list, show: "Account Readiness Score: 78/100"
   - Show combined "Opportunity Score" with explanation
   - Link to full Account Scorer profile

2. **Opportunity Score calculation:**
   ```
   Opportunity Score = (Account Readiness Score × 0.6) + ((100 - CX Audit Score) × 0.4)
   ```
   - Weights readiness-to-buy slightly higher (60%) than room-for-improvement (40%)
   - Higher Opportunity Score = better target for outreach

3. **Framing in the UI:**
   - Don't just show "64/100 — Adequate"
   - Add context: "This score indicates meaningful opportunities for digital experience improvement"
   - For companies with high Account Readiness + low CX Score: highlight as "High Opportunity"

4. **For ad-hoc companies (not in Account Scorer):**
   - Show CX Audit score only
   - Note: "Account Readiness data not available for this company"
   - Optionally: "Add to Account Scorer watchlist" for future tracking

---

### 13. Backlog Ideas (Future Versions)

- PDF export with professional formatting
- Side-by-side comparison of two companies
- Historical tracking ("Your score improved from 62 to 71 since last month")
- Deeper chatbot testing (multi-turn conversation assessment)
- Integration with Account Scorer (show CX audit alongside buy signals)
- Authenticated experience audit (with user permission/credentials)
- Accessibility deep-dive using axe-core or similar
- Social media presence assessment

---

### 14. Example Audit Output (Illustrative)

**Company:** Wells Fargo  
**Overall Score:** 64/100 (Adequate)  
**Generated:** February 5, 2026

**Category Scores:**
- AI Readiness: 68/100
- Mobile App Quality: 58/100
- Customer Sentiment: 55/100
- Web Experience: 72/100
- Digital Accessibility: 61/100

**Key Findings:**

*AI Readiness*
- Virtual assistant "Fargo" is present on website and mobile app — handles basic queries but escalates quickly to human support
- App store description mentions "smart alerts" and "personalized insights" but reviews suggest these features are basic
- Recent earnings call mentioned "continued investment in AI-powered fraud detection" but customer-facing AI features lag competitors

*Mobile App Quality*
- iOS app rating of 4.7 is strong, but Android rating of 3.9 suggests platform disparity
- Recent reviews (last 30 days) cite "frequent logout issues" and "slow transfers" — 23% of recent 1-star reviews mention session timeouts
- App last updated 3 weeks ago; update frequency is healthy

*Customer Sentiment*
- Review sentiment is mixed: customers praise branch integration but criticize mobile deposit reliability
- Common complaint pattern: "works fine until it doesn't" suggests intermittent reliability issues

*Web Experience*
- Homepage loads in 2.1 seconds (acceptable but not best-in-class)
- Mobile responsiveness is adequate; some interactive elements require pinch-to-zoom
- Value proposition is clear but buried below promotional content

**Recommendations:**

1. **Enhance virtual assistant capabilities** — "Fargo" handles basic tasks but competitors like Bank of America's "Erica" offer more sophisticated AI interactions. Expanding conversational AI capabilities could differentiate the digital experience.

2. **Address Android app parity** — The gap between iOS (4.7) and Android (3.9) ratings suggests platform-specific issues worth investigating. Improving Android performance could lift overall mobile sentiment.

3. **Investigate session timeout complaints** — Multiple recent reviews cite unexpected logouts. A session management review could reduce friction and improve app store ratings.

4. **Surface AI-powered features more prominently** — If personalization and smart alerts exist, customers aren't noticing them. Better feature discovery could improve perception of digital sophistication.

---

### 15. Next Steps

1. David reviews PRD and confirms/adjusts:
   - Audit categories and weights
   - Output tone and format
   - Open questions

2. Build prototype with 1 pre-loaded company (static/mock data) to validate UI

3. Build audit generation pipeline for web experience scan

4. Add mobile app scanning

5. Add synthesis and scoring logic

6. Expand to all 20 pre-loaded companies

7. Add ad-hoc company support

8. Polish, test, deploy

---

*End of PRD*
