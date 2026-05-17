## Legal & compliance infrastructure

Build out the full legal scaffold as specified. Existing `/privacy`, `/terms`, `/disclaimer` pages will be replaced/augmented and moved under `/legal/*` with redirects from old URLs preserved.

### 1. New / rewritten pages (under `/legal/*`)

- `/legal/privacy` — full CCPA/CPRA + GDPR + COPPA policy with all required sections. Replaces existing `PrivacyPage`.
- `/legal/terms` — full ToS: eligibility, AI disclaimer (medical/legal/financial), as-is, limitation of liability, indemnification, IP license, arbitration + class-action waiver, governing law `[STATE]`. Replaces existing `TermsPage`.
- `/legal/ai-disclaimer` — prominent AI / acceptable-use warning. Replaces existing `DisclaimerPage`.
- `/legal/cookies` — cookie & local-storage policy with opt-out instructions.
- `/legal/do-not-sell` — CCPA "Do Not Sell or Share" page (states we don't sell, provides opt-out request form anyway).

Old routes (`/privacy`, `/terms`, `/disclaimer`) → `<Navigate>` redirects to new `/legal/*` paths so existing links and sitemap stay valid.

All pages: "Last Updated: [EFFECTIVE DATE]" header, placeholders `[COMPANY NAME]`, `[CONTACT EMAIL]`, `[STATE]`, `[EFFECTIVE DATE]`, plain language, crawlable (no auth).

### 2. UI/UX compliance elements

- **CookieConsentBanner** component — fixed bottom banner on first visit, Accept / Reject / Customize. Stores choice in `localStorage` (`clarify_cookie_consent`). Mounted in `App.tsx`. Gates any future analytics.
- **Signup flow** (`SignupPage`):
  - Unchecked "I agree to the Terms of Service and Privacy Policy" checkbox (with links), required to submit.
  - Unchecked "I confirm I am 18 or older" checkbox, required.
  - Submit disabled until both checked.
- **AIInputNotice** component — small inline warning shown above AI input on `/ask`, `/translate`, `/symptoms`, `/wellness-plan`, `/my-notes` (visit recorder): "Do not input information you're not authorized to share. AI outputs are not professional advice."
- **AccountSettingsPage** at `/account` (auth-gated):
  - Update email, update password.
  - Download my data (JSON export of profile + notes via Supabase queries client-side).
  - Delete my account (confirms what's deleted: profile, notes, recordings; calls a `delete-account` edge function that purges user rows + auth user).
  - Link from Header user menu / `MyNotesPage`.
- **Footer** — add legal column links to new `/legal/*` paths, plus "Do Not Sell or Share My Personal Information" link.

### 3. Backend

- Edge function `delete-account` — auth-required; deletes user's notes/recordings/profile and calls `auth.admin.deleteUser`. Uses service role.

### 4. Sitemap & SEO

- Update `scripts/generate-sitemap.ts`: add `/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/ai-disclaimer`, `/legal/do-not-sell`, `/account`. Regenerate `public/sitemap.xml`.

### 5. Out of scope (called out to user)

- Picking a state, real privacy email, listing actual subprocessors with accurate names, HIPAA decisions, lawyer review, business entity — left as placeholders / mentioned in closing message.

### Files

**New:** `src/pages/legal/PrivacyPage.tsx`, `TermsPage.tsx`, `CookiesPage.tsx`, `AIDisclaimerPage.tsx`, `DoNotSellPage.tsx`, `src/pages/AccountSettingsPage.tsx`, `src/components/CookieConsentBanner.tsx`, `src/components/AIInputNotice.tsx`, `supabase/functions/delete-account/index.ts`.

**Edited:** `src/App.tsx` (routes + redirects + banner mount), `src/components/Footer.tsx` (legal links + Do Not Sell), `src/pages/SignupPage.tsx` (checkboxes), `src/pages/AskPage.tsx`, `src/pages/JargonTranslatorPage.tsx`, `src/pages/SymptomExplainerPage.tsx`, `src/pages/WellnessPlanPage.tsx`, `src/components/notes/VisitRecorder.tsx` (AI notices), `scripts/generate-sitemap.ts`, `public/sitemap.xml`.

**Deleted:** `src/pages/PrivacyPage.tsx`, `TermsPage.tsx`, `DisclaimerPage.tsx` (replaced by `/legal/*` versions; routes redirect).
