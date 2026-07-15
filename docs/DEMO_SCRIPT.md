# Fiber Flightcheck - Silent 3 Minute Demo

This version requires no voice-over. Record the browser at 1080p, use deliberate cursor movement, and add the supplied captions from [DEMO_CAPTIONS.srt](./DEMO_CAPTIONS.srt) in the video editor.

## Before Recording

1. Confirm http://129.151.188.227/api/health returns `ok: true`, `synced: true`, at least one open channel, and `paymentReady: true`.
2. Open http://129.151.188.227 in a private browser window.
3. Close unrelated tabs and hide bookmarks, notifications, passwords, terminal history, and all VPS credentials.
4. Keep browser zoom at 100% and record at 1920x1080.
5. Use **10 CKB** for readiness and **0.01 CKB** for Payment Proof.
6. Keep public live execution disabled.

## Recording Timeline

### 0:00-0:08 - Title

Show a simple title card:

**Fiber Flightcheck**<br>
**Know whether a Fiber payment can succeed before sending it.**

Then reveal the landing page.

### 0:08-0:25 - Product and Problem

Move slowly across the landing page, then click **Open Console**.

Do not scroll quickly. Give judges time to read the product statement and the server-gated architecture summary.

### 0:25-1:05 - Live Readiness

Keep **Live node** selected. Set:

- Amount: **10**
- Asset: **CKB**

Click **Run Flightcheck**.

Pause on the result. Show the payment-ready decision, testnet and synchronization state, maximum sendable amount, maximum receivable amount, and next action.

### 1:05-1:35 - Channel and Funding Evidence

Scroll to the channel lifecycle and funding sections.

Pause on:

- `ChannelReady`;
- sendable and receivable liquidity;
- on-chain funding status;
- peer and channel technical details.

Expand technical details briefly, but do not expose private server configuration.

### 1:35-2:05 - Live Payment Proof

Enter **0.01 CKB** in Payment Proof and click **Run Payment Proof**.

Pause on the successful dry-run status. Show that the public proof is capped and operator-gated. Do not enable live execution.

### 2:05-2:25 - Auditable Report

Click **Save PDF**. Show the formatted report in the print preview for several seconds, then cancel the dialog or save locally.

Return to the console and briefly show the Markdown and JSON export controls.

### 2:25-2:45 - Failure Diagnostics

Open **Runbook**, expand Scenario Lab, and select one blocking scenario such as insufficient outbound liquidity.

Pause on the issue code and recommended next action. The caption must state that Scenario Lab is simulated while the main readiness and proof flows are live.

### 2:45-3:00 - Close

Return to the landing page or a clean console result and display:

**Live Fiber state. One readiness decision. One next action.**<br>
**github.com/Jayrodri088/fiber-flightcheck**

Fade out.

## Editing Guidance

- Import [DEMO_CAPTIONS.srt](./DEMO_CAPTIONS.srt) and burn the captions into the video.
- Use one clean sans-serif font, white text, and a dark translucent caption background.
- Keep transitions simple: short cuts or 150-250 ms fades.
- Avoid background music unless it is quiet and properly licensed.
- Do not speed up the sections containing live results.
- Remove loading delays longer than two seconds, but do not fake or replace outputs.
- Export as MP4/H.264 at 1080p and 30 fps.

## Submission Links

- GitHub: https://github.com/Jayrodri088/fiber-flightcheck
- Hosted setup: http://129.151.188.227
- Screenshot gallery: https://github.com/Jayrodri088/fiber-flightcheck/tree/main/docs/assets
- Home screenshot: https://raw.githubusercontent.com/Jayrodri088/fiber-flightcheck/main/docs/assets/home.png
- Console screenshot: https://raw.githubusercontent.com/Jayrodri088/fiber-flightcheck/main/docs/assets/console.png
- Runbook screenshot: https://raw.githubusercontent.com/Jayrodri088/fiber-flightcheck/main/docs/assets/runbook.png

Upload the finished video to a publicly accessible or unlisted video page, verify it while signed out, and paste that URL into the Video link field.

## Final Safety Check

- The video never shows an SSH key, environment file, operator token, private RPC URL, full peer target, or raw payment hash.
- The live demo URL works in a private browser window.
- The repository is public and includes the MIT license.
- Captions remain readable on a mobile-sized video player.
- The video clearly labels live functionality and simulated failure scenarios.
