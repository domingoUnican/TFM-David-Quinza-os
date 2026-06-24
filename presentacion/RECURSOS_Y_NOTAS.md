# Presentación de defensa — TFM David Quinzaños Saiz

Entregables en `presentacion/`:

- `Presentacion_TFM_Quinzanos.pptx` — presentación editable (16 diapositivas + divisor + 6 de backup), con **notas de presentador** (~20 min) en cada diapositiva.
- `Presentacion_TFM_Quinzanos.pdf` — versión PDF.
- `assets/` — figuras usadas (recompiladas desde el TFM o copiadas de `resultados/`).
- `build_pptx.js` — script reproducible que genera el `.pptx`.

> Las notas de presentador se ven en PowerPoint en **Vista del moderador** (Presenter View). Cada nota empieza con el tiempo asignado, p. ej. `(1:35)`.

---

## Recursos usados en cada diapositiva

| # | Diapositiva | Recurso de la carpeta |
|---|-------------|------------------------|
| 1 | Portada | `figuras/uc-logo.png`; datos de `main.tex` (título, autor, codirectores, fecha) |
| 2 | Motivación: confianza en la Web | `figuras/Handshake_TLS_of_two_version.png` (Fig. 3 de la memoria) |
| 3 | RSA y los primos | Fig. 5 TikZ (`memoria/capitulo2.tex`) recompilada → `fig_rsa_keygen.png`; fórmulas de cap. 2 |
| 4 | Vulnerabilidad: factores compartidos | Fig. 6 TikZ (`capitulo2.tex`) → `fig_gcd_compartido.png` |
| 5 | Problema de escala | Cifra `M(M−1)/2` y `1.472.860.675` (cap. 5, conjunto de 54.275) |
| 6 | Tesis de Våge | Cifras de `capitulo3.tex` (159.377.664 claves; 8 vulnerables; 355 de >700.000) |
| 7 | Método clásico | Fig. 9 TikZ (`capitulo4.tex`) → `fig_clasico_tree.png` |
| 8 | Limitaciones del clásico | Cifras de Våge en `capitulo3.tex` (13 lotes, ~180 GB, ~1 TB, ~88 h, 30 núcleos) |
| 9 | Encaje Våge–Pelofske–TFM | Síntesis de cap. 3 (diagrama de elaboración propia) |
| 10 | Binary Tree Batch GCD | Fig. 11 TikZ (`capitulo4.tex`) → `fig_binary_tree.png`; `B=∏gⱼ`, `2M−1` |
| 11 | Objetivos | `capitulo1.tex` (objetivos y alcance) |
| 12 | Implementación | Herramientas de `capitulo4.tex` (C++17, GMP, OpenMP, Python, OpenSSL, ct-archive) |
| 13 | Flujo CT-archive | Fig. 13 TikZ (`capitulo4.tex`) → `fig_pipeline_ct.png`; 54.278 / 54.275 |
| 14 | Experimentos sintéticos | Configuración de `capitulo5.tex` (bits, WEAK, N, 3 algoritmos) |
| 15 | Resultados: validación, tiempo, memoria | `figuras/comparativa_tiempo_pelofske_extendida.pdf` → `chart_tiempo.png`; cifras 6,1× / 116,5× / 275,3× / 57,9 MB (cap. 5) |
| 16 | Datos reales y conclusiones | `resultados/ctlogs/tabla_resultados_finales.csv` (54.278 / 54.275 / 0 / 0 / 23,8 s); cap. 6 |
| 17 | Divisor "Material de apoyo" | — |
| B1 | Clásico vs Binary Tree | Síntesis de cap. 4 |
| B2 | "0 vulnerabilidades" es un resultado | cap. 5/6; `figuras/diagrama.pdf` → `diag_global.png` |
| B3 | Algoritmo vs C++/GMP | `resultados/benchmark/benchmark_speedup_cpp.png`; cifras cap. 5 |
| B4 | "Módulo plausible" | `resultados/ctlogs/distribucion_bits_modulos.png` + .csv; cap. 5 |
| B5 | Escalar a más CT logs | `figuras/escalabilidad_batch_gcd.pdf` → `chart_escalabilidad.png`; cap. 6 |
| B6 | Tabla completa de resultados | `resultados/benchmark/benchmark_pelofske_extendido_summary.csv` (18 filas) |

Las figuras TikZ de la memoria se **recompilaron de forma aislada** (clase `standalone`) para conservar exactamente su estética. Las gráficas y tablas proceden de `resultados/` y `figuras/`. **Ninguna cifra es inventada**: todas salen del TFM o de los archivos de resultados.

---

## Advertencias: datos que NO se han podido verificar de forma independiente

1. **Especificaciones de hardware (diap. no mostrada; entorno del cap. 5).** La memoria indica «Apple **M5 Pro** de **18 núcleos** y **24 GB**». Es una combinación poco habitual (los chips *Pro* suelen tener 12–14 núcleos). Se ha tomado **textualmente del TFM**, pero conviene que confirmes el modelo/núcleos/RAM exactos por si el tribunal pregunta. *(No aparece como cifra en las diapositivas; sí en las notas no.)*

2. **Versiones de software (cap. 5):** macOS 26.5, Apple Clang 21.0.0, GMP 6.3.0, OpenMP LLVM 22.1.6, etc. Son posteriores a mi fecha de conocimiento y no las he podido verificar; se reproducen tal cual constan en el TFM (no se muestran en las diapositivas).

3. **«~6× de mejora media» de Pelofske:** la memoria lo cita como «mejora práctica media aproximada de seis veces». No se ha verificado contra el artículo original; no aparece como dato duro en las diapositivas (solo en notas/contexto).

4. **Cifras de la tesis de Våge** (159.377.664 claves; 8 vulnerables; 355 de >700.000; 13 lotes / 180 GB / 1 TB / 88 h / 30 núcleos): proceden de los capítulos 3 y 5 del TFM, que a su vez citan a Våge (2022). Son fieles al TFM, pero su exactitud última depende de la fuente citada en la memoria.

5. **PDF generado con LibreOffice.** Tipografías: **Cambria** (títulos) y **Calibri** (cuerpo), ambas estándar de Office; en tu PowerPoint se verán como están diseñadas. Si abres el `.pptx` en un equipo sin esas fuentes, podría sustituirlas.
