# Vercel AI backend (staging only)

Production still uses the Lovable-hosted AI functions. The Vercel endpoint `api/ai/[name].ts` only runs when the frontend is built with `VITE_AI_BACKEND=vercel`.

## Vercel env vars (server-only — never prefix with VITE_)
| Name | Required | Notes |
|---|---|---|
| OPENAI_API_KEY | yes | |
| EXTERNAL_SUPABASE_URL | yes | self-hosted project URL; used to verify JWTs |
| EXTERNAL_SUPABASE_SERVICE_ROLE_KEY | yes | used for `consume_ai_use` and refunds |
| OPENAI_MODEL | no | default `gpt-4.1-mini` |
| CLARIFY_CORE_PROMPT_ID | no | saved Responses prompt for ask, jargon, eli5, symptom, wellness |
| CLARIFY_ANALYSIS_PROMPT_ID | no | saved prompt for analyze-visit and transcribe-audio |
| OPENAI_TRANSCRIBE_MODEL | no | default `gpt-4o-transcribe` |
| OPENAI_TTS_MODEL | no | default `gpt-4o-mini-tts` |

The saved prompts must not need template variables. The endpoint always sends its own `instructions` and strict JSON schema, so the response contracts don't depend on what the saved prompt says.

## Frontend env vars (Preview environment only)
- `VITE_AI_BACKEND=vercel`: sends ask, jargon-translate, eli5-rewrite, symptom-explain, wellness-plan, analyze-visit and tts-speak to `/api/ai/{name}`.
- `VITE_AI_VERCEL_EXTRA=transcribe-audio`: opt-in only. Vercel rejects request bodies over 4.5 MB, so recordings larger than about 3 MB will fail with 413.

Do not set these in Production until preview testing passes.

## Request flow
method and size check, then JWT check (401 `LOGIN_REQUIRED`), then input validation (400), then `consume_ai_use` (403 `LIMIT_REACHED`), then the OpenAI call. If OpenAI fails after the use was charged, the charge is refunded (best effort). Request and response content is never logged, only status codes. Anon and authenticated users get `permission denied` when they call `consume_ai_use`; only the service role can run it.

## Testing on a Vercel preview
1. Deploy a preview with the env vars above.
2. Run `curl -X POST https://<preview>/api/ai/ask -d '{}'` and expect `401 LOGIN_REQUIRED`.
3. Sign in on the preview as a Plus user and try each tool. Check that `ai_usage` gains exactly one row per call.
4. Test as a free user and expect a 403 that sends you to /checkout.
5. Check Article "Listen" (MP3 playback) and My Notes text analysis. Test the audio path only with VITE_AI_VERCEL_EXTRA set.

## Rollback
Unset `VITE_AI_BACKEND` and redeploy.
