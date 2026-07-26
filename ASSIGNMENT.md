# SDE-1 Take-Home Assignment

Build a small testimonial platform. Businesses collect testimonials from customers, review them, and show the approved ones on their own website through an embeddable widget.

This mirrors the kind of product we build every day, so treat it as a slice of the real job.

## Read this first

- **The scope is bigger than the time on purpose. We do not expect you to finish.** Pick what matters most, build that well, and submit whatever is done. What you choose to build first tells us as much as the code.
- **AI use is expected and encouraged.** Use any tool and any model you like. See the free options at the bottom — you do not need a paid subscription.
- **You must understand every line you submit.** In the follow-up call we will pick parts of your code and ask why they exist and what breaks without them. Not being able to explain your own code is disqualifying. Shipping code you don't understand is the one way to fail this assignment.
- **Time:** you have **4 calendar days** from receiving this. We expect roughly **6–10 hours** of actual work. Please don't pour a whole week into it.
- If something in this brief is unclear or unspecified, **make a sensible call and write it down in your journal**. That is part of the job.

## What to build

### P0 — the core loop (the minimum bar)

1. **Submission form.** A public page where a customer submits a testimonial: name, email, company, testimonial text, star rating, photo optional.
2. **Backend + storage.** An API that persists submissions in a real database.
3. **Moderation dashboard.** A page for the business owner listing submissions, with approve and reject actions.
4. **Public wall page.** A public page in your app showing approved testimonials. Rejected ones must never appear there.

**This is the exact flow we will test first:** submit a testimonial → see it pending in the dashboard → approve it → see it on the wall. If that works end to end, you have met the minimum bar. Build this before anything else.

### P1 — if you get through P0

- **Embeddable widget.** Show approved testimonials on a page _outside_ your app: a `<script>` tag or iframe embed (your call which), plus a plain HTML demo page in the repo that proves it works on a third-party site.
- Widget customization: at least accent color; layout if you like.
- Handling of duplicate or junk submissions.
- Pagination or lazy-loading when there are many testimonials.
- Proper empty, loading, and error states throughout.

### P2 — stretch

- One AI-powered feature inside the product, using a any model (for example: auto-tag sentiment, or summarize a long testimonial). See the free model options below.
- A live deploy on any free host, so we can click around without running it locally.

## Constraints

- **Frontend:** React.
- **Backend:** Node.js — any framework.
- **Database:** your choice. Free options that work fine: SQLite, local Postgres/MySQL, or free cloud tiers like Supabase, Neon, or MongoDB Atlas.
- **Hosting:** free tiers of Vercel or Netlify for the frontend; Render, Railway, or Fly.io for the backend.
- No design mockups are provided. **The look and feel is yours to decide**.

## Non-goals — do not build these

Time spent here is time wasted:

- Authentication or login. A hardcoded/unprotected dashboard route is fine.
- Payments or billing.
- Multi-user, multi-business, or team support. One business, one owner.
- Roles and permissions.
- Email notifications.

## How we evaluate

Roughly in this order:

1. **Working core flow** — does the P0 flow run end to end.
2. **Product judgment** — what you chose to build and cut, and how the result feels to use.
3. **Design & user experience** — your visual and interaction choices: layout, spacing, states, and whether the wall and widget look like something a real business would put on its site. No mockups is a feature, not an oversight.
4. **Code quality** — readable, consistent, sensibly structured.
5. **Agent collaboration** — how you work with coding agents (Claude Code, Codex CLI, Cursor, Cline, aider, and the like): how you split the work into tasks, what you prompt, how you review and correct what comes back. This weighs more than raw feature count.
6. **Verification** — how you made sure things actually work.
7. **Communication** — your journal and README.

## What to submit

1. **A GitHub repo** (public) containing all code.
2. **README.md** — how to run it, what is done, what is not done.
3. **JOURNAL.md** — filled in from the template we provide (`JOURNAL_TEMPLATE.md`). This is a required deliverable, not an afterthought; we read it before we read the code.
4. **Your agent setup files, committed to the repo — do not gitignore them.** Whatever you wrote to steer your tools: `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`, rules files (`.cursor/rules`, `.clinerules`, `.github/copilot-instructions.md`), custom skills, slash commands, or MCP config. We read these the way we read code — they show how you think about directing an agent. If you used none, say so in your journal.

Reply to the assignment email with the repo link before the deadline. Partial work is a valid submission — silence is not.

## Free AI tools and models

You don't need any paid plan. Some zero-cost paths:

**Free models (get an API key, use it in any tool):**

- [OpenRouter](https://openrouter.ai) — free-tier models (look for the `:free` suffix, e.g. DeepSeek, Qwen, Llama variants).
- [Google AI Studio](https://aistudio.google.com) — free Gemini API key with a generous daily quota.
- [Groq](https://groq.com) — free tier, very fast open models.
- [NVIDIA NIM](https://build.nvidia.com) — free API credits for hosted open models.

**Free coding tools (bring one of the keys above, or their own free tier):**

- GitHub Copilot free tier in VS Code.
- Cline, Roo Code, or Continue.dev — VS Code extensions that accept any API key, including the free ones above.
- aider — terminal-based pair programmer, works with any key.
- The free web chats (ChatGPT, Claude, Gemini, DeepSeek) work fine too.

Which tools you pick, and how you use them, is part of what we want to see.
