# Fotos de barbería

Una carpeta por **tema** (el tema es la identidad de cada plantilla y es único por rubro):

| Carpeta | Plantilla |
|---|---|
| `oxido/` | `barberia-oxido-v1` |
| `norte-atelier/` | `barberia-norte-v1` |
| `concreto-brutal/` | `barberia-concreto-v1` |
| `trazo-papel/` | `barberia-base-claro-v1` |
| `trazo-noche/` | `barberia-base-oscuro-v1` |
| `trazo-solar/` | `barberia-base-solar-v1` |

Hoy **todas** las imágenes son placeholders generados (llevan la etiqueta
`… · placeholder` abajo a la izquierda). Para poner una foto real con licencia,
reemplaza el archivo con el **mismo nombre** y vuelve a correr `kit:build`; el
compilador solo genera un placeholder cuando el archivo no existe.

| Archivo | Uso | Tamaño de referencia |
|---|---|---|
| `hero.jpg` | Portada | según la variante: `image-bg` 1600×1000, `split` 1000×1250, `centered-arch` 1200×900, `offset-card` 1000×800 |
| `about.jpg` | Nosotros (`text-image-offset`, `statement`) | 1000×1250 |
| `team-1.jpg` … `team-4.jpg` | Equipo, en el orden del content pack | 800×1000 |
| `gallery-01.jpg` … `gallery-08.jpg` | Galería, en el orden de los pies de foto del content pack | 1200×1200 |

El `alt` de cada foto vive en el content pack (`content/barberia.<voz>.es-MX.ts`):
si la foto real muestra otra cosa, actualiza el `alt` en el mismo commit. El
tratamiento de color (`photoTreatment` del tema) se aplica por CSS; no edites las
fotos para imitarlo.
