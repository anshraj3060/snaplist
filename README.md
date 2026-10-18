# Snaplist

**Photos in. Store-ready drafts out.** A local-first AI listing writer for solo resellers, built around the open-weight **Gemma 3** vision model and open-source **Ollama** runtime.

Snaplist turns product photos and a few seller-supplied facts into an editable title, description, and search tags. No paid inference API is required. The interface includes an explicitly labeled demo so you can explore without downloading a model.

## Run the workspace

Requires Node.js 22+ and npm.

```bash
npm ci
npm run dev
# Open http://localhost:3000
```

The server binds to `0.0.0.0` for container/preview compatibility. Demo mode works immediately. Fonts, icons, and the sample product image are served by the application, not third-party CDNs.

## Enable real local AI

1. Install [Ollama](https://github.com/ollama/ollama) on the same computer as Snaplist.
2. Download and start the vision model:

   ```bash
   ollama pull gemma3:4b
   ollama serve
   ```

   If Ollama is already running as a desktop app/service, skip `ollama serve`.
3. In Snaplist, open **Model & settings**, select **Use my local model**, and save.
4. Add 1–4 product photos, choose a marketplace and tone, provide known facts, then **Generate listing**.

The initial model download requires internet. After dependencies and model weights are installed, generation can work offline on suitable hardware. Inference speed and memory requirements depend on the model, quantization, and your machine. CPU inference may be slow. There is a 180-second server timeout.

### Change the model or host

Use another image-capable Ollama model, with a JSON-capable chat endpoint:

```bash
OLLAMA_MODEL=gemma3:12b OLLAMA_URL=http://127.0.0.1:11434 PORT=3000 npm start
```

These are server environment variables, not browser settings. The default model is `gemma3:4b`; the default Ollama address is `http://127.0.0.1:11434`. The UI connection check uses `/api/tags`. The inference adapter uses `/api/chat`, sends base64 images, and requests structured JSON.

## What works

- Upload or drag-and-drop up to four JPEG/PNG/WebP images (5 MB each).
- Etsy, eBay, and Vinted drafting preferences, with marketplace-specific title limits.
- Four writing tones and seller notes for material, dimensions, condition, and provenance.
- Real vision inference through Ollama; no silent fallback to sample text when inference fails.
- Editable title and description; removable/addable tags (up to 13).
- Copy a description or full listing; export a plain-text file.
- Save, reopen, update, and delete browser-local drafts, including a compressed cover thumbnail.
- Responsive desktop and mobile layout, keyboard controls, labeled fields, reduced-motion support.

**Demo mode is not AI.** The supplied sample tote has deterministic example copy. Uploading your own images in demo mode produces a clearly disclosed placeholder, not fabricated image analysis. Replacing the sample clears sample seller notes and previous output.

## Privacy and deployment boundaries

- In local mode, photos go from the browser to the Snaplist server, then to the configured Ollama server. They are held in memory for inference; this app does not write uploads to disk or log them.
- Fully local means **Snaplist and Ollama run on your own computer**. On a hosted preview, the server is remote; choosing local mode does not magically run a model on the visitor's laptop.
- Demo mode does not send uploaded photos to the backend. Saving a draft stores a thumbnail and text in this browser's `localStorage`, unencrypted. Clearing site data removes drafts. Download important work.
- No analytics, external font requests, accounts, payment processor, or marketplace credentials.
- This is a trusted, single-user prototype. It has a request-size limit and a single-inference concurrency guard, but **no authentication or per-user rate limiting**. Do not expose an inference-enabled instance to the public internet without authentication, HTTPS, and resource controls. Keep Ollama private.

## Accuracy and marketplace eligibility

AI output is a draft, not a product certification. The prompt forbids invented brands, authenticity, material, condition, provenance, pricing, and shipping promises. Seller facts can still be wrong, and models can hallucinate: inspect every listing before publishing. Photos do not establish dimensions or fiber composition. No price estimate is provided because Snaplist has no comparable-sales data.

Marketplace support means copy preferences, **not a listing integration or eligibility guarantee**. Etsy has specific handmade, vintage, and supply policies; an arbitrary secondhand item may not qualify. This app does not publish directly to any marketplace.

## Open innovation and the business case

The target customer is a solo secondhand seller repeatedly rewriting descriptions. A plausible paid offering is a one-time desktop package with installation support and niche listing presets, rather than a metered inference subscription. A ₹999 one-time license is a pricing hypothesis to validate, **not evidence of revenue**.

Open weights make per-listing third-party API charges unnecessary and allow the operator to choose model size, inspect prompts, or replace the model adapter. Open-source Ollama provides the runtime. This gives a seller more control than a closed API workflow, but it does not guarantee superior writing, latency, or total cost. Hardware, electricity, model maintenance, and support still cost money.

Gemma is **open-weight, not a claim of OSI-approved open-source licensing**. Its [model terms](https://github.com/google-deepmind/gemma) and acceptable-use requirements apply separately. Ollama is MIT-licensed. Application code is MIT-licensed; bundled fonts and icons retain their own licenses in their npm packages. The sample product photo is AI-generated and is for demonstration, not a real product listing.

## Tests

```bash
npm test             # input validation, model adapter, JSON parsing, runtime errors
# With npm run dev running in another terminal:
npm run test:ui      # Chromium smoke test; Linux + tar required
```

The browser test uses npm-distributed Chromium so it works without downloading from the Playwright CDN. It checks demo generation, uploads, save/edit/persistence, marketplace selection, tags, export, settings, and 390px mobile overflow. Temporary screenshots go to ignored `.arena/`.

The model adapter is tested with mocked Ollama responses. A real Gemma inference was **not** run in the hosted build environment because Ollama/model weights are not installed there. Validate real-model output quality, latency, and hardware support on your target machine before selling.

## Challenge submission

[`docs/dev-submission.md`](docs/dev-submission.md) contains a ready-to-edit DEV post with the required `devchallenge` and `hf26challenge` tags, a reproducible demo walkthrough, and honest validation status. It is a draft, not a published post. No paying customer or first-user interview has been claimed.
