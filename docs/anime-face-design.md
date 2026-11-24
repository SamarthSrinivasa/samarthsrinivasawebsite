# Anime Face — Design

A project page (`projects/anime-face.html`). You upload one photo and it redraws the face in a generic anime / cel-shaded style. It reuses Face Merge's approach: MediaPipe landmarks, triangle warping, and no build step.

## Brainstorm: approaches

| Option | How | Pros | Cons |
| --- | --- | --- | --- |
| A. GAN in the browser (AnimeGAN-style ONNX via onnxruntime-web) | Image-to-image network | Most "painted" look | 8–30 MB model download. Weights have unclear or non-commercial licenses, and many are trained to copy specific studios' styles. Slow on phones. Black box. |
| B. Cloud API (diffusion img2img) | Upload the photo to a server | Best quality | Breaks the site's "photos never leave your browser" promise. Needs an API key and costs money. |
| **C. Procedural, landmark-driven (chosen)** | Warp to anime proportions, cel-shade, draw line art and stylized eyes from the 478 landmarks | Fully client-side, private and fast (~150 ms). Every step can be explained in "how it works". Reuses Face Merge code. Sliders give the user control. | Less painterly. Quality depends on the photo being front-facing. |

C fits the site best: it's private, explainable and tweakable, and it continues Face Merge.

## What makes a face read as "anime"

1. **Proportions**: very large, tall eyes; a tiny nose; a small mouth; a short, V-shaped chin; a slightly taller forehead.
2. **Eyes**: a white sclera, a tall iris with a dark-to-light gradient, a pupil, two white highlights, a thick upper lash line with an outer flick, a thin lower line and a lid crease.
3. **Flat color**: skin in 2–3 flat tones with hard steps between them (cel shading), brighter and more saturated than a photo.
4. **Line art**: dark outlines on edges (jaw, hair, nose and mouth shapes) and none in flat areas.
5. **Extras**: blush with hatch strokes, and a clean drawn background in place of the room behind.

## Pipeline

1. **Detect and align.** As in Face Merge: eyes go to fixed spots in a 512×512 frame (framed a bit wider for hair). Point set = 478 landmarks + 16 frame points + an outer face ring.
2. **Segment (optional).** MediaPipe selfie segmenter on the aligned frame gives a person mask, used for background swaps. If it fails to load, background swaps are turned off.
3. **Anime shape.** `animeShape(pts, prop, eye)`:
   - Gaussian-falloff local scaling: eyes scaled anisotropically (taller more than wider), nose ×(1−0.5·prop), mouth ×(1−0.3·prop)
   - lower face compressed, with narrowing that grows toward the chin (V chin)
   - forehead slightly taller
4. **Warp.** Delaunay triangulation and a per-triangle affine warp (Face Merge's `warpInto`) for the photo and the mask.
5. **Background.** Composite the warped person over a procedural background (sky with clouds, sunset, dreamy bokeh, plain, or the original).
6. **Cel shade.**
   - 2 passes of a separable bilateral filter (edge-preserving flattening)
   - luma quantized into N bands with a narrow smoothstep between them
   - brightness lift and a saturation boost (color is kept by scaling RGB by the luma ratio)
7. **Line art.** XDoG on the smoothed luma, with sigma and strength set by the "line weight" slider. The lines are multiplied in as a dark warm brown.
8. **Anime eyes.** Clip to each eye opening (lid landmarks), then draw the sclera, iris gradient, pupil, lid shadow and highlights. Then draw the lash shape, flick, lower line and crease.
   - Closed or squinting eyes (opening height under 12% of eye width) get only a lash curve.
   - The iris color is sampled from the real iris (ignoring pupil and glare), pushed to anime saturation, or picked from presets.
9. **Blush.** Soft pink ellipses on the cheeks plus three short hatch strokes.

## Controls

- Photo: drop, click or paste. HEIC is supported. A new photo replaces the old one.
- Sliders:
  - proportions (0–100)
  - eye size (0–100)
  - line weight (0–100)
  - color bands (2–6)
- Eye color select: auto, brown, blue, green, violet, red, gold.
- Background select: sky, sunset, dreamy, plain, original.
- Checkboxes: anime eyes, blush.
- Buttons: download png.

Sliders render a 256 px preview while dragging and the full 512 px on release.

## Privacy and honesty

Everything runs in the browser and nothing is uploaded. The copy says it's a stylized filter, not AI art. No named studio or show styles.

## Testing

- `?f=path` debug loader; `window.animeFace` hooks.
- Run on the user photos in git-ignored `.face-test/` and on London Set samples: front neutral, smiling and 3/4. Save result strips at several slider settings.
- Check: closed or smiling eyes, glasses if present, the no-face error, mobile layout, timing, and the console.

# Plan

1. Write this doc.
2. Build `projects/anime-face.html`:
   - copy Face Merge's head, topbar, theme script and panel CSS
   - layout: original | anime side by side, controls below
3. JS module:
   - model + segmenter init, intake (reuse `blobToCanvas`, HEIC), `alignFace`, `warpInto`
   - `animeShape`, `drawBackground`, `celShade` (bilateral + quantize + XDoG), `drawEyes`, `drawBlush`
   - `render(size)` with scheduling, download, debug params
4. Add an entry to the Projects list in `index.html`.
5. Test with photos, tune the constants, show results. Commit only when asked.

---

# Update: anime eye template

The first version painted anime parts inside the *real* eye outline. Real eyes are narrow almond shapes, so the result looked uncanny. Two fixes:

**The real eye is no longer used as the outline.** The real eye and lids are covered with sampled cheek skin. A fixed anime eye template is drawn in their place, sized from the distance between the eyes: width 0.55–0.72 of that distance, and height 0.62–0.87 of the eye's width, both set by the eye size slider. Each eye is positioned at the real eye center, tilted along the eye line, and mirrored for the left eye.

The template:
- a high arched upper lid and a shallow lower lid
- a lash band that thickens toward the outer corner and ends in a wing and a spike
- a lower-lash line and two tick lashes on the outer part, plus a faint crease
- a tall iris tucked under the lid with:
  - a deep → base → light gradient, a lower glow and fine streaks
  - a pupil, a lid shadow and a rim
  - three highlights, lit from the same side on both eyes
- the real gaze kept as a small iris offset; closed eyes become a "happy" arc

**Eye picture datasets / training.** I looked for anime eye picture sets and decided against them:
- The eye-specific sets (Roboflow "anime_eye", CC BY 4.0) are small detection sets.
- The big anime face sets (Danbooru crops, Getchu faces) are scraped fan and commercial art. Their dataset licenses don't cover the artwork itself. One was taken down over copyright.
- `huggan/anime-faces` is labeled CC0, but it's the same kind of scraped art.
- Training a generator on these would copy specific artists' work and add a large model download.

Instead, the template follows common anime eye construction (lid shape, lash weight, iris layering, highlights) and doesn't copy any image.
