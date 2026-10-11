# web-wow

Skill para Claude Code (y agentes compatibles) que enseña el método usado para construir tres prototipos de sitios web que "parecen de 10 mil dólares": primero se define la marca, luego se piden varias direcciones de arte en paralelo, la persona elige o combina, y solo después se construye y se revisa en el teléfono.

[Español](#español) · [English](#english)

---

## Español

### Qué es

`web-wow` es una skill (instrucciones para un agente de IA) con un flujo de trabajo y una biblioteca de técnicas. No es una plantilla de sitio web: es el método. Incluye:

- Un flujo de nueve pasos (0 a 8): `DESIGN.md` primero, tres direcciones en paralelo (un sub-agente por dirección, carpetas aisladas), elección o combinación, construcción, ciclo de QA en el teléfono, auditoría y enlace de vista previa con `noindex`.
- Seis briefs reutilizables con marcadores (`{BRAND}`, `{PALETTE}`, `{FONTS}`, `{LOGO_SVG}`, `{HEADLINE}`, `{SERVICES}`, `{CTA}`): 3D inmersivo, experiencia tipo sistema operativo, tipografía editorial gigante, gradiente líquido con shader, caso de estudio narrado con scroll y producto como héroe.
- Patrones de movimiento con código que respeta `prefers-reduced-motion`: partículas a partir de un logo SVG, tipografía ajustada al ancho, barrido a pantalla completa, sección horizontal fijada, ventanas arrastrables, terminal simulada, entre otros.
- Guía de librerías (GSAP, Lenis, React Bits, Three.js) con versiones, licencias explicadas en palabras simples, la advertencia sobre el paquete falso `react-bits` en npm y la sincronización Lenis con ScrollTrigger.
- Principios, anti-patrones y lista de sitios de referencia.
- Lista de verificación de QA móvil, comandos de Playwright CLI y un script de barrido.

### Resultados

El método produjo tres prototipos para una misma marca, comparables entre sí porque comparten el mismo `DESIGN.md`:

| Opción | Idea |
|---|---|
| A: la sala de máquinas | Monograma hecho de miles de partículas muestreadas del SVG, que reaccionan al puntero; al hacer scroll la cámara atraviesa el logo y las partículas forman una red de nodos |
| B: el sistema operativo | Secuencia de arranque, escritorio con ventanas arrastrables, terminal escribible, monitor simulado, dock; en el teléfono se rediseña como tarjetas y un selector de apps |
| C: editorial gigante | Tipografía que llena el ancho, barrido de color a pantalla completa, servicios horizontales fijados, botón magnético |

Demostración en vivo: https://rafchn-propuestas.vercel.app (los botones de contacto aún no están conectados; los datos dinámicos son simulaciones). Más detalles en [`examples/README.md`](examples/README.md).

### Instalación

Copia la carpeta `skills/web-wow/` donde tu agente busque skills.

Alcance de usuario (todos tus proyectos):

```bash
mkdir -p ~/.claude/skills
cp -r skills/web-wow ~/.claude/skills/
```

En Windows con PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
Copy-Item -Recurse skills\web-wow "$HOME\.claude\skills\"
```

Alcance de proyecto (solo ese repositorio):

```bash
mkdir -p .claude/skills
cp -r skills/web-wow .claude/skills/
```

Alternativa con el CLI de skills, que funciona con repositorios de skills:

```bash
npx skills add RafChn/web-wow
```

Revisa el contenido antes de instalar y no uses `-y` (así el CLI te pregunta antes de escribir en tu configuración). Esto aplica a esta skill y a cualquier otra.

### Uso

Pídele a tu agente algo como:

- "Quiero una web de 10 mil dólares para mi marca. Dame tres opciones."
- "Make me a wow website for my portfolio. Show me 3 directions first."
- "Quiero que mi landing impresione: usa la dirección C (editorial gigante) con mi paleta."

El agente debería: preguntar solo lo que falte (marca, oferta, paleta, tipografías, logo en SVG, llamada a la acción), escribir `DESIGN.md`, llenar tres briefs, construir los prototipos, pedirte que elijas, construir el elegido, repetir el QA en el teléfono hasta que esté limpio y entregar un enlace `noindex`.

Nota: "10 mil dólares" ("$10K") es una señal de mercado sobre el nivel de calidad que se busca, no una promesa de precio ni de resultado.

Ejemplo de la marca de ejemplo incluida en la plantilla de `DESIGN.md`: fondo #121010, acento coral #FF6B3D, Geist (marca de Rafael Chacón, solo como ilustración).

### Dependencias opcionales (no se incluyen aquí)

Esta skill no copia código de terceros. Funciona sola, pero rinde más con estas skills y herramientas. Cada una tiene su propia licencia y sus propios autores:

| Herramienta | Para qué | Enlace | Instalación |
|---|---|---|---|
| Taste Skill (MIT): `design-taste-frontend`, `high-end-visual-design`, `redesign-existing-projects`, entre otras | Dirección de arte que evita el aspecto de plantilla | https://github.com/Leonxlnx/taste-skill | `npx skills add https://github.com/Leonxlnx/taste-skill` o una sola: `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` |
| Vercel agent-skills (MIT): `web-design-guidelines` | Auditoría de UI contra guías de interfaz | https://github.com/vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills` |
| Playwright CLI | Capturas, viewport móvil, reduced motion, consola | https://github.com/microsoft/playwright-cli | `npm i -g @playwright/cli@latest` y luego `playwright-cli install --skills` |
| Thermos / deslop (opcional) | Revisión de diffs para detectar código "slop" | https://github.com/cursor/plugins/tree/main/thermos | Sigue el README del repositorio |
| anti-slop (opcional) | Reglas de lint contra código de baja evidencia en TypeScript y JavaScript | https://github.com/dmmulroy/anti-slop | Sigue el README del repositorio |

Notas de seguridad:

- Lee cualquier skill de terceros antes de instalarla: es texto que tu agente seguirá como instrucciones, y puede pedirle ejecutar comandos.
- `web-design-guidelines` de Vercel descarga sus reglas de forma remota en tiempo de ejecución. Revisa lo que descarga y considera fijar una versión.
- Fija versiones exactas de librerías (GSAP, Lenis, Three.js), guarda el lockfile y revisa los cambios de dependencias.
- React Bits no tiene paquete en npm. El paquete `react-bits` de npm es otra librería distinta: no lo instales (detalles en `skills/web-wow/references/libraries.md`).

### Estructura

```
web-wow/
├── README.md
├── LICENSE
├── skills/web-wow/
│   ├── SKILL.md
│   └── references/
│       ├── workflow.md          flujo de 8 pasos y prompts para sub-agentes
│       ├── concept-briefs.md    6 briefs con marcadores
│       ├── design-md-template.md
│       ├── motion-patterns.md   código de movimiento e interacción
│       ├── libraries.md         GSAP, Lenis, React Bits, Three.js
│       ├── principles.md        principios, anti-patrones, referencias
│       └── mobile-qa.md         lista de QA y script de barrido
└── examples/README.md           los tres prototipos y la demo en vivo
```

### Créditos

- Método y prototipos: Rafael Chacón (@rafchn en Instagram).
- Librerías mencionadas: GSAP (GreenSock/Webflow), Lenis (Darkroom Engineering), React Bits (DavidHDev), Three.js (mrdoob y colaboradores).
- Skills y herramientas recomendadas: Taste Skill (Leonxlnx), agent-skills (Vercel Labs), Playwright CLI (Microsoft), Thermos/deslop (Cursor), anti-slop (dmmulroy).
- Las observaciones de sitios de referencia son juicios del autor sobre páginas públicas, del 2026-10-11; los sitios cambian.

### Licencia

MIT. Ver [`LICENSE`](LICENSE). Las herramientas y librerías de terceros mantienen sus propias licencias.

---

## English

### What it is

`web-wow` is a skill (instructions for an AI agent) with a workflow and a library of techniques for building websites that feel expensive. It is a method, not a site template:

- A nine-step workflow (steps 0 to 8): `DESIGN.md` first, three art directions in parallel (one sub-agent each, isolated folders), the user picks or combines, build, mobile QA loop, audit, and a `noindex` preview link.
- Six reusable briefs with placeholders (`{BRAND}`, `{PALETTE}`, `{FONTS}`, `{LOGO_SVG}`, `{HEADLINE}`, `{SERVICES}`, `{CTA}`): immersive 3D, OS experience, editorial giant type, liquid shader gradient, scroll-told case study, product as hero.
- Reduced-motion-safe motion patterns: particles sampled from an SVG logo, fitted type, full-screen wipe, pinned horizontal section, draggable windows, a simulated terminal, and more.
- A libraries guide (GSAP, Lenis, React Bits, Three.js): versions as of 2026-10-11, licenses in plain words (including the React Bits Commons Clause and GSAP's terms), the `react-bits` npm typosquat warning, and the Lenis and ScrollTrigger sync.
- Principles, anti-patterns and a reference sites list; a mobile QA checklist, Playwright CLI commands and a sweep script.

### Results

The method produced three prototypes for one brand, comparable because they share one `DESIGN.md`: A (particle monogram that flies into a node network), B (an operating system with draggable windows, a typeable terminal and a simulated monitor), C (viewport-filling editorial type with a full-bleed accent wipe).
Live demo: https://rafchn-propuestas.vercel.app (contact buttons are placeholders; dynamic panels are labeled simulations). Details in [`examples/README.md`](examples/README.md).

### Install

Copy `skills/web-wow/` into `~/.claude/skills/` (user scope) or `<project>/.claude/skills/` (project scope), as in the commands above.
`npx skills add RafChn/web-wow` also works for skills repositories, but review the contents first and avoid `-y` so the CLI asks before changing your setup.

### Usage

Ask your agent for a "wow website", a "$10K website", a "landing that impresses", "Awwwards-level" work, or "three options for my site". It should gather brand inputs, write `DESIGN.md`, build three prototypes in parallel, let you choose, build the chosen one, run the mobile QA loop and share a `noindex` link.

Note: "$10K" is a market signal of the quality level to aim for, not a price promise or a guarantee of results.

### Optional dependencies (not vendored)

| Tool | Purpose | Link | Install |
|---|---|---|---|
| Taste Skill (MIT) | Anti-template art direction (`design-taste-frontend`, `high-end-visual-design`, `redesign-existing-projects`...) | https://github.com/Leonxlnx/taste-skill | `npx skills add https://github.com/Leonxlnx/taste-skill` |
| Vercel agent-skills (MIT) | UI audit with `web-design-guidelines` | https://github.com/vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills` |
| Playwright CLI | Screenshots, mobile viewport, reduced motion, console | https://github.com/microsoft/playwright-cli | `npm i -g @playwright/cli@latest`, then `playwright-cli install --skills` |
| Thermos / deslop (optional) | Diff review for AI slop | https://github.com/cursor/plugins/tree/main/thermos | See the repo README |
| anti-slop (optional) | Lint rules against low-evidence TS/JS | https://github.com/dmmulroy/anti-slop | See the repo README |

Security: read any third-party skill before installing it (it is instructions your agent will follow). Vercel's `web-design-guidelines` fetches its rules remotely at runtime, so review what it fetches and consider pinning. Pin exact library versions and review dependency diffs. React Bits is not on npm; the npm package `react-bits` is an unrelated library.

### Credits

Method and prototypes by Rafael Chacón (@rafchn on Instagram). Libraries: GSAP (GreenSock/Webflow), Lenis (Darkroom Engineering), React Bits (DavidHDev), Three.js (mrdoob and contributors). Recommended skills and tools: Taste Skill (Leonxlnx), agent-skills (Vercel Labs), Playwright CLI (Microsoft), Thermos/deslop (Cursor), anti-slop (dmmulroy). Reference-site notes are the author's opinions on public pages as of 2026-10-11.

### License

MIT, see [`LICENSE`](LICENSE). Third-party tools and libraries keep their own licenses.
