---
title: "Snaplist: a seller's sidekick, powered by open-weight local AI"
published: false
description: "A local-first photo-to-listing workspace for solo sellers, built with Gemma 3 and Ollama."
tags: devchallenge, hf26challenge, ai, opensource
---

<!-- Submission draft. Add your own running demo URL or recording before publishing.
The original challenge template was not supplied; the sections below cover the requested information.
Verify the official template and all challenge eligibility requirements before submission. -->

## What I built

**Snaplist** is a small workspace for the person who likes finding great secondhand products but doesn't love writing the listings.

Add up to four photos, choose Etsy, eBay, or Vinted, add the facts a camera can't know, and pick a tone. A local vision model produces an editable title, description, and search tags. Review the words, save a draft, then copy or download the listing.

The goal isn't to run someone's entire shop. It's to make one repetitive task feel lighter.

Marketplace-specific copy does not mean that an item is eligible to sell there. Sellers still need to check platform rules—especially Etsy's restrictions on secondhand products.

## Who would pay for it?

My initial customer hypothesis is a solo reseller who lists a handful of products every week. The product would be a one-time desktop package with local setup assistance and niche presets, rather than another monthly AI subscription.

A possible starting point is **₹999 one-time**, but that is a hypothesis, not a validated price. Before adding billing, I would ask sellers to bring five real items, watch them draft listings, and measure the time spent editing compared with their existing workflow.

Useful questions: Which details did the model get wrong? Would the seller use it again? Would they pay for help setting up local inference? Is their laptop actually fast enough?

## Demo

Repository: [anshraj3060/snaplist](https://github.com/anshraj3060/snaplist)

Run it:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

### A quick tour, without a model

1. Start with the sample canvas tote. It is an AI-generated demonstration photo, not a real item for sale.
2. Choose a marketplace and a tone, then generate a **demo** listing.
3. Edit the description, add a tag, and save the draft.
4. Open **My listings** to continue editing. Export a text file or copy the listing.

Demo mode is deterministic sample copy, **not image analysis**. Uploading your own photos in this mode produces an explicitly labeled placeholder, not a guess about your product.

### The real AI path

Install Ollama and run:

```bash
ollama pull gemma3:4b
ollama serve
```

If Ollama is already running, don't start a second server. In Snaplist's **Model & settings**, choose **Use my local model**. The server sends the photos, selected tone, marketplace, and seller notes to Ollama's vision chat endpoint. The model returns structured JSON that becomes the editable draft.

Important: when the app is hosted remotely, inference happens on that host. For laptop-local privacy, run **both** Snaplist and Ollama on your laptop. Download the dependencies and model first; after setup, the workflow can run without an internet connection on suitable hardware.

## Why open innovation matters

The core AI is **Gemma 3**, an open-weight vision model. The inference runtime is **Ollama**, which is open source. These aren't a decorative add-on: the real photo-to-listing path depends on them.

This approach changes what the product can offer:

- **Control over photos.** Self-hosting means a seller doesn't have to send product images or private notes to a third-party AI provider. Browser drafts remain on their own device.
- **No per-listing AI API bill.** That makes a one-time local product a plausible business model. It is not literally free: hardware, electricity, maintenance, and support remain real costs.
- **Replaceable models.** An environment variable selects another compatible vision model. A more capable machine can use a larger model; a constrained machine can try a smaller compatible one.
- **Inspectable behavior.** The inference adapter and prompt are small enough to read. Sellers or developers can change the writing rules without depending on a provider's hidden assistant behavior.

Compared with a closed hosted API design, the concrete advantage here is **deployment and cost control**, not a claim of better prose. I haven't benchmarked listing quality or speed against closed models. Local inference also introduces friction: installation, memory requirements, and slower responses on some laptops.

Gemma's open weights have their own license and use terms. I don't describe Gemma as OSI-approved open-source software. Ollama and the application have separate software licenses.

## A few intentional boundaries

Snaplist asks the model not to invent brand, authenticity, measurements, material, condition, price, or shipping promises. But a prompt is not a guarantee. The seller has to verify every claim.

There are no invented price estimates: I don't have comparable-sales data. There is no automatic publishing: the seller reviews and moves the draft to their marketplace. Drafts use unencrypted browser storage, and important ones should be exported.

The current server is a trusted single-user prototype, not a public multi-tenant inference service. A production hosted version needs authentication, resource controls, and a clear data policy.

## What I've validated—and what I haven't

Automated checks cover input validation, structured output parsing, the Ollama adapter with mocked responses, and honest unavailable-model errors. A browser smoke test covers uploads, demo generation, marketplace preferences, editable tags, saving/reopening drafts, export, mode settings, and mobile overflow.

I have **not** run real Gemma inference in the hosted build environment, where Ollama and its weights aren't installed. Real-product accuracy, generation latency, and laptop hardware support still need testing on the target installation.

I have **not landed a first user or paying customer yet**. The next milestone is a hands-on session with an actual reseller—not an invented testimonial. If the seller spends more time correcting the draft than writing it, that is the problem to solve before charging.

## What's next

First: validate the real-model path on representative seller hardware. Then: get the prototype in front of a seller, observe five listings, and choose the next feature based on that session. Batch listing and niche presets are possibilities, not promises.

Small tools can make good side hustles when they save a specific person a little time, over and over. Open models let this one aim for that without handing away the seller's workflow.
