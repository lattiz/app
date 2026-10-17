---
format: 1920x1080
fps: 30
duration: 35s
message: "Tu sitio web ya está construido: elige, personaliza, publica — desde MX$449 al mes."
arc: PAS with BAB steps — hook → pain → product intro → step 1 → step 2 → step 3 → proof (precio) → CTA
audience: "Dueños de barberías, cafés, restaurantes, clínicas y boutiques en México sin sitio web ni diseñador"
mode: collaborative
music: "uplifting modern electronic pop-tech, 110-120 BPM, warm, light synth plucks and soft kick, builds at brand reveal and final CTA"
---

## Video direction

Premium, warm, confident. Alternating grounds: navy (hook, cost, brand, CTA) and lavender→white (steps, plans).
Geist throughout; one keyword per headline in royal blue. Nothing fully stops: every frame ends in a float/breathe.
Entrances snap with back-overshoot, UI cards spring, counters ease out (cubic), camera moves ease in-out, exits are quick.
Signature transitions are built inside frames: the particle shatter→gather (2), the logo vortex (3), the push-in
match-cuts into device screens (4→5), the stepper-to-publish swap (6). Captions own the bottom 17 %; all content sits above y≈900.
Registry borrow: the deterministic canvas particle law from `particle-text-dissolve` (seeded LCG, time-pure painter).

## Frame 1 — Gancho: tu negocio existe

- type: hook
- blueprint: kinetic-type-beats
- duration: 8.2s
- poster: 5.2s
- transition_in: cut
- scene: Navy field; "Tu negocio existe." word-by-word, "Tu sitio web, también debería." slams in ("también" in royal blue); a generic search bar types "barberías cerca de mí", pins drop, radial counter fills to "7 de 10".
- voiceover: "Tu negocio existe. Tu sitio web, también debería. Siete de cada diez mexicanos buscan en internet antes de comprar."
- asset_candidates: assets/logo.png — not shown here; kept so staging has a real entry
- sfx: soft whoosh, keyboard typing, pop
- src: compositions/frames/01-gancho.html
- shot: Scene 1 (0.0–3.6s): navy field, slow push-in; "Tu negocio existe." word-by-word on the VO, line 2 slams in with back-overshoot at 1.7s, the "también" pill pops at 2.7s. → Scene 2 (3.6–4.3s): headline lifts and shrinks away; mini headline + white search bar spring in. → Scene 3 (4.2–8.2s): "barberías cerca de mí" types letter by letter; map card tilts up, three pins drop with bounce and pulse; result chips pop; radial ring fills to 70 % while "7" counts up, "mexicanos" lands on the VO; gentle breathing idle.
- status: animated

Cold open on direct address. Line 1 lands calm; line 2 overshoots in as the turn. The 7-de-10
stat is the evidence for the hook: a neutral search bar (no search-engine branding) types the
query, a result card and three map pins drop with bounce and pulse, and a radial ring fills to
70% with "7 de 10" counting up. Slow camera push-in throughout. Ends in a gentle idle: pins
pulse, ring breathes.

## Frame 2 — El costo de una agencia

- type: pain_point
- blueprint: dataviz-countup
- duration: 4.7s
- poster: 2.6s
- transition_in: cut
- scene: "$6,000 – $80,000" odometer-rolls up, a padlock snaps on with "Sin poder editar" (micro-shake), then the whole stack shatters into particles that reveal "Todo incluido" on a lavender field.
- voiceover: "Una agencia cobra hasta ochenta mil pesos. Con Lattiz, todo incluido."
- asset_candidates: assets/logo.png — not shown here; kept so staging has a real entry
- sfx: tick, padlock click, glass shatter whoosh
- src: compositions/frames/02-costo.html
- shot: Scene 1 (0.0–2.7s): eyebrow tracks in; odometer counts $0→$6,000 then $6,000→$80,000 landing on "mil"; padlock drops and clicks shut with a micro-shake; "Sin poder editar" chip pops. → Scene 2 (2.7–3.95s): the stack shatters into ~1,700 seeded particles while a lavender circle wipes out from center; particles re-gather onto the glyphs of "Todo incluido". → Scene 3 (3.8–4.7s): crisp "Todo incluido" resolves ("incluido" in royal blue), sparks pop and drift.
- status: animated

The pain in one number. Ground drifts navy → lavender as the stack dissolves: the visual turn
from "agency" to "Lattiz". "Todo incluido" is the first lavender/white moment of the film and
hands its particle cloud to Frame 3.

## Frame 3 — Esto es Lattiz

- type: product_intro
- blueprint: logo-assemble-lockup
- duration: 4.9s
- poster: 3.0s
- transition_in: cut
- scene: Particles swirl in a vortex and assemble into the Lattiz logo (supplied PNG), wordmark "Lattiz" and tagline "Tu sitio ya está construido. Solo lánzalo."; glass chips orbit: Plantillas, Editor sin código, Dominio incluido, WhatsApp, Analíticas.
- voiceover: "Esto es Lattiz. Tu sitio ya está construido: solo lánzalo."
- asset_candidates: assets/logo.png — official logo, used as supplied
- sfx: low riser, soft impact on logo landing, chip pops
- src: compositions/frames/03-marca.html
- shot: Scene 1 (0.0–1.0s): particle vortex spirals in and assembles the supplied logo from its own pixels. → Scene 2 (0.9–2.0s): logo lands with overshoot, halo bloom, light sweep; "Lattiz" letters flip up on the VO. → Scene 3 (1.35–4.9s): five glass chips fly out of the center and orbit with slow rotation; tagline resolves at 2.05s, "Solo lánzalo." pops on the VO at 3.65s; logo floats.
- status: animated

Royal-blue gradient ground. Swirl/vortex carries Frame 2's particles into the mark (the shader
moment of the film). Logo settles with overshoot + one light sweep; wordmark and tagline in
Geist. Five glass chips orbit with parallax and slow rotation; the "WhatsApp" chip uses a
generic green chat-bubble icon, never the real mark.

## Frame 4 — Paso 1: elige tu plantilla

- type: feature_showcase
- blueprint: device-surface-showcase
- duration: 2.5s
- poster: 2.4s
- transition_in: zoom-through
- scene: Step badge "1 · Elige tu plantilla"; silver laptop on lavender with the Plantillas gallery; camera pushes into the grid, rings pulse on the Básico and Pro badges, cursor clicks "Usar plantilla" (press + ripple); real template thumbnails float around the laptop with depth blur.
- voiceover: "Elige tu plantilla."
- asset_candidates: assets/ui-plantillas-clean.png — real dashboard gallery; assets/vista-previa-de-la-plantilla-la-nota-azu.jpg — floating thumb; assets/vista-previa-de-la-plantilla-margen-caf.jpg — floating thumb; assets/hero-6.jpg — floating thumb
- sfx: whoosh, ui click
- src: compositions/frames/04-plantilla.html
- shot: Scene 1 (0.0–0.65s): step badge spins in; silver laptop rises from a tilt; real template thumbnails spring in around it with depth blur. → Scene 2 (0.25–1.25s): camera pushes from the whole gallery into the first two cards, then keeps dollying. → Scene 3 (0.8–2.5s): rings pop on Básico and Pro; magnetic cursor glides to "Usar plantilla", clicks (press flash + ripple); thumbnails float.
- status: animated

First real product evidence. Short VO, so the image works hard: push-in to the first two cards
so the Básico/Pro badges read, magnetic cursor to "Usar plantilla", click. Thumbnails float in
depth around the laptop.

## Frame 5 — Paso 2: personaliza con tu marca

- type: feature_showcase
- blueprint: panel-edit-live-sync
- duration: 3.7s
- poster: 3.4s
- transition_in: cut
- scene: Step badge "2 · Personaliza"; match-cut zoom into the Trigo editor headline "Pan de masa madre" re-typed live with an accent-color swap and a pulsing Estilos panel; an iPhone springs in from the right with the mobile editor ("Cauce"), badge "100% responsive" and a glowing blue arc linking phone and laptop.
- voiceover: "Personalízala con tu marca, hasta desde tu celular."
- asset_candidates: assets/ui-editor-trigo.png — desktop editor, Trigo hero; assets/ui-editor-movil-screen.png — phone-screen crop of the mobile editor
- sfx: typing, whoosh on phone slide-in
- src: compositions/frames/05-personaliza.html
- shot: Scene 1 (0.0–1.15s): open close on the Trigo hero headline; "masa madre" deletes and retypes, color swaps to terracotta; Color field pulses, swatch picker pops and its ring slides to terracotta. → Scene 2 (1.15–1.75s): camera pulls back to the whole editor. → Scene 3 (1.72–3.7s): on "hasta desde tu celular" the iPhone springs in from the right with the real mobile editor; blue arc draws, "100% responsive" badge pops; devices float.
- status: animated

"Personalízala con tu marca" = the live edit on desktop (rebuild only the headline that types).
"hasta desde tu celular" = the phone arrives on exactly those words. Phone status bar is drawn
(9:41), Dynamic Island, titanium frame, no brand marks.

## Frame 6 — Paso 3: dominio y publicar

- type: feature_showcase
- blueprint: cursor-ui-demo
- duration: 4.9s
- poster: 4.6s
- transition_in: cut
- scene: Step badge "3 · Dominio y publica"; domain screen: "panaderiaartesanal" types, results slide in with green "Incluido en tu plan" chips, .com.mx stays greyed "No disponible", cursor picks .com, stepper fills Buscar → En vivo; "Publicar sitio 🚀" press → rocket arc with particle burst and soft confetti → the finished Trigo site in a browser at "panaderiaartesanal.com" reflows across laptop, tablet and phone.
- voiceover: "Escoge tu dominio, incluido en tu plan, y publica con un clic."
- asset_candidates: assets/ui-dominio-crop.png — domain search screen (sharp, no sidebar); assets/ui-publicar.png — publish button; assets/hero-8.jpg — finished Trigo site (desktop); assets/vista-previa-de-la-plantilla-trigo-y-bra.jpg — finished Trigo site alt
- sfx: typing, ui click, whoosh, soft pop
- src: compositions/frames/06-dominio.html
- shot: Scene 1 (0.0–1.0s): dark domain panel rises; "panaderiaartesanal" types; Buscar press. → Scene 2 (1.0–2.85s): result rows slide in, green "Incluido en tu plan" chips pop on the VO, .com.mx stays grey; cursor picks .com (selection ring); stepper fills Buscar→En vivo. → Scene 3 (2.85–3.8s): "Publicar sitio" pops, is pressed on "publica", rocket arcs off with a trail and a seeded confetti burst. → Scene 4 (3.55–4.9s): laptop, tablet and phone spring in showing the live Trigo site at panaderiaartesanal.com; "En vivo" pill with pulse; gentle float.
- status: animated

Two beats in one frame, paced to "incluido en tu plan" (green chips land) and "publica con un
clic" (the press). Domain search uses the screenshot as base and rebuilds only the typed field
and the stepper progress line. The device trio ends in a gentle float.

## Frame 7 — Plan Básico

- type: benefit_highlight
- blueprint: grid-card-assemble
- duration: 3.8s
- poster: 3.2s
- transition_in: cut
- scene: Lavender field; two frosted-glass plan cards rise: Básico "MX$449 / mes" (count-up) with ticks Sitio web profesional, Dominio incluido, SSL incluido, Botón de WhatsApp; Pro "MX$699 / mes" with badge "Más popular" and ticks Todo lo del Básico, SEO avanzado, Secciones premium, Analíticas y métricas; chip "Anual: ahorra 2 meses".
- voiceover: "Plan Básico: cuatrocientos cuarenta y nueve pesos al mes."
- asset_candidates: assets/logo.png — not shown here; kept so staging has a real entry
- sfx: ticks on count-up, gentle pops on ticks
- src: compositions/frames/07-plan.html
- shot: Scene 1 (0.0–1.0s): Básico and Pro glass cards rise with a spring tilt. → Scene 2 (0.45–2.7s): Pro counts to 699 and gets its "Más popular" badge, ticks pop one by one; Básico counts to 449 landing on "pesos". → Scene 3 (2.6–3.8s): Básico price flashes with a blue glow, Pro lifts and glows, "Anual: ahorra 2 meses" chip pops.
- status: animated

The VO names only Básico; the Básico card is the hero (count-up lands on the word "pesos");
the Pro card sits beside it, lifted with its "Más popular" badge, so both real prices read.

## Frame 8 — Prueba gratis

- type: cta
- blueprint: logo-assemble-lockup
- duration: 4.6s
- poster: 3.6s
- transition_in: cut
- scene: Royal-blue → navy gradient; logo, "Prueba gratis 3 días" pill button with magnetic pulse, "lattiz.app", small "Cancela cuando quieras"; light sweep; settles into a breathing ambient idle for the final second.
- voiceover: "Prueba Lattiz gratis tres días, en lattiz punto app."
- asset_candidates: assets/logo.png — official logo, used as supplied
- sfx: soft impact, shimmer
- src: compositions/frames/08-cta.html
- shot: Scene 1 (0.0–0.8s): logo spins in with halo; CTA pill rises. → Scene 2 (1.0–2.3s): magnetic pulse on "gratis", light sweep across the button. → Scene 3 (2.3–4.6s): "lattiz.app" letters rise on the VO, "Cancela cuando quieras" fades in, second pulse; the logo breathes into a calm final hold.
- status: animated

One action. The URL is the last thing read and the last thing heard. Final frame is deliberate:
logo + CTA + URL held, particles drifting, logo breathing.
