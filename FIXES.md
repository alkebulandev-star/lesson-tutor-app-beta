# Lesson Teacher — Stability + Syllabus + Navigation Fixes

## 1. API stability
- `api/anthropic.ts`, `api/openai.ts`, `api/elevenlabs.ts` — 3-attempt retry with exponential backoff on transient statuses (408, 425, 429, 500, 502, 503, 504, 529)
- `api/health.ts` — diagnostic endpoint at `/api/health` reports which keys are configured (masked)
- `shell-1.js` — production detection now works on any domain (custom or `*.vercel.app`); only localhost falls into preview mode
- Real error messages bubble up to chat when both providers fail

## 2. Branding
- `index.html` — Lovable opengraph image and `@Lovable` Twitter handle removed; replaced with site favicon and Lesson Teacher metadata

## 3. Empty subjects — solved with on-demand AI generation
The original `subjectsByClass` lists 194 subjects across all classes, but the hand-written `SYLLABUS` data only covered 76. Instead of pre-writing 118 missing schemes by hand (~2,800 weekly topics), the app now generates a NERDC-aligned scheme of work on the fly when a subject is first opened.

### How it works
- Click any subject in the sidebar — including ones that previously showed nothing (Yoruba, French, Computer Studies, PHE, Civic Education, Music, Fine Arts, Insurance, Commerce, Cultural & Creative Arts, etc.)
- If pre-written content exists, it loads instantly as before
- If not, you see a "Building your [Subject] syllabus…" splash for ~10 seconds
- The AI tutor (Anthropic Claude) generates real Nigerian curriculum topics matching the level and exam (Common Entrance / BECE / WAEC)
- Result is cached in localStorage under key `lt_syllabus_v1::<subject>` — only generated once per subject per browser
- After that it loads instantly forever

### Code added
- `homework-1.js` — `generateSyllabusOnDemand(key, sidebarEl)` orchestrates the flow
- `homework-1.js` — `_parseGeneratedSyllabus(raw, meta, cls, exam)` parses AI output into the exact same shape as hand-written entries
- `homework-1.js` — `_classLabelFromKey`, `_subjectMetaFromSidebar`, `_examFromClass` derive metadata from the subject key
- `loadSubject()` now routes empty subjects to the generator instead of showing a placeholder

### What this means for users
Every subject in the sidebar now works. Empty subject pages are gone. The generated syllabi are real curriculum content because they come from the same AI tutor that teaches the lessons — and they're cached so the cost is one fast request per subject per browser.

## 4. Navigation between lessons — fixed the "loads previous lesson" bug
The bug: clicking a new lesson while one was still loading would either show the previous lesson's content, leave the loading spinner stuck, or render two responses on top of each other.

### Cause
`fetchLessonOpening()` created an `AbortController` but never passed `signal` to the actual `fetch()` call — so old requests kept running. When they completed, they overwrote the new lesson.

### Fix (homework-1.js, fetchLessonOpening)
1. The fetch call now receives the `signal` parameter — old requests are properly aborted when a new topic is selected
2. Two stale-response checks (`isStillCurrent()`) — once after the response arrives and once after JSON parsing — ensure that if the user navigated away mid-flight, we drop the response instead of rendering it
3. `AbortError` in the catch block is now silent (it's an expected, deliberate cancel — not a real error)

This applies anywhere `loadTopic` is called, so it fixes navigation across all subjects, terms and weeks.

## Diagnostic playbook

### Step 1 — `/api/health`
Visit `https://yourdomain.com/api/health`. All three keys must show `"configured": true`. If any are `false`, add the missing one in Vercel → Settings → Environment Variables and redeploy.

### Step 2 — Network tab
DevTools → Network → reproduce the issue.

| Status | Meaning | Fix |
|---|---|---|
| 200 | Working | (no issue) |
| 401 | Invalid API key | Regenerate, update in Vercel, redeploy |
| 404 | Endpoint not deployed | Make sure `api/` folder is committed |
| 429 | Rate limited (auto-retried) | Wait or upgrade plan |
| 500 with `is not configured` | Env var missing | Add to Vercel, redeploy |
| 502/504 | Upstream failure / timeout (auto-retried) | Provider issue |
| 529 | Anthropic overloaded (auto-retried) | Wait briefly, retry |

### Step 3 — Console for audio issues (Phonics page)
Click "Hear Word" → DevTools Console:
- Both `[kSpeak]` and `[ElevenLabs] fetching audio for: …` → audio request is firing; if no sound, browser autoplay policy is blocking it (check audio permissions on the site)
- Only `[kSpeak]` → `speakIt` is bailing early; the log values show why
- No logs at all → button click isn't wired

## Vercel env var checklist
- `ANTHROPIC_API_KEY` (starts with `sk-ant-`)
- `OPENAI_API_KEY` (starts with `sk-` or `sk-proj-`)
- `ELEVENLABS_API_KEY` (starts with `sk_`)

After ANY env var change → trigger a fresh deploy (Deployments → ⋯ → Redeploy). Env var changes are not retroactive.
