# Informe de cierre de extracción CT Archive

Fecha de cierre: 31 de mayo de 2026.

## Alcance

Se ha completado la extracción de los logs útiles del repositorio `geomys/ct-archive` que cumplían las condiciones fijadas para el TFM: disponer de ficheros en Internet Archive y no estar marcados como demasiado grandes para Internet Archive. Se excluyeron los logs del repositorio que no contenían directorio `issuer/`, porque no permiten extraer los certificados de issuer necesarios mediante el flujo empleado.

Este informe resume la segunda tanda de extracción, correspondiente a la parte restante asignada a Domingo, y la combinación con los módulos ya unificados previamente.

## Segunda tanda de extracción

| Log | ZIPs | Procesados | Sin issuer | Fallidos | Pares módulo-issuer | Módulos únicos |
|---|---:|---:|---:|---:|---:|---:|
| `ct_letsencrypt_oak2025h1` | 60 | 60 | 0 | 0 | 319920 | 5211 |
| `ct_letsencrypt_oak2026h1` | 36 | 36 | 0 | 0 | 134856 | 3653 |
| `ct_letsencrypt_oak2026h2` | 8 | 8 | 0 | 0 | 33136 | 4070 |
| `ct_sectigo_mammoth2024h1` | 2 | 2 | 0 | 0 | 1332 | 663 |
| `ct_sectigo_mammoth2024h2` | 19 | 19 | 0 | 0 | 80123 | 4134 |
| `ct_sectigo_mammoth2025h2` | 52 | 52 | 0 | 0 | 286884 | 5415 |
| `ct_sectigo_sabre2024h1` | 12 | 12 | 0 | 0 | 21144 | 1720 |
| `ct_sectigo_sabre2024h2` | 17 | 17 | 0 | 0 | 70584 | 4071 |
| `ct_sectigo_sabre2025h2` | 73 | 73 | 0 | 0 | 415662 | 5594 |
| `ct_sectigo_elephant2025h2` | 74 | 67 | 7 | 0 | 122141 | 1727 |
| `ct_sectigo_tiger2025h2` | 75 | 66 | 9 | 0 | 59160 | 1644 |
| `ct_trustasia_log2024` | 5 | 5 | 0 | 0 | 27560 | 5425 |

Resumen de la segunda tanda:

| Magnitud | Valor |
|---|---:|
| Logs procesados | 12 |
| ZIPs listados | 433 |
| ZIPs procesados con issuer | 417 |
| ZIPs sin issuer | 16 |
| ZIPs fallidos | 0 |
| Pares módulo-issuer únicos | 35988 |
| Módulos RSA únicos | 35892 |

## Combinación global

Antes de esta tanda ya existía un conjunto unificado con 24548 módulos RSA únicos, formado por la extracción inicial, `issuers.zip`, `total_certificados` y `todos_numeros.sorted.bz2`.

La segunda tanda aporta 35892 módulos únicos. De ellos, 6162 ya estaban presentes en el conjunto previo y 29730 son nuevos.

| Conjunto | Módulos RSA únicos |
|---|---:|
| Conjunto previo unificado | 24548 |
| Segunda tanda CT Archive | 35892 |
| Solapamiento | 6162 |
| Nuevos módulos aportados | 29730 |
| Total global sin duplicados | 54278 |

## Ficheros generados

| Fichero | Contenido |
|---|---|
| `ct_archive_global/moduli_hex_domingo_restantes_repo.txt` | Módulos únicos de la segunda tanda |
| `ct_archive_global/rsa_issuers_domingo_restantes_repo.txt` | Pares módulo-issuer de la segunda tanda |
| `ct_archive_global/moduli_solapados_unificado_previo_domingo_restantes_repo.txt` | Módulos repetidos entre el conjunto previo y la segunda tanda |
| `ct_archive_global/moduli_hex_global_repo_completo.txt` | Módulos RSA únicos globales, sin duplicados |
| `ct_archive_global/rsa_issuers_global_repo_completo.txt` | Pares módulo-issuer globales disponibles |

## Fichero recomendado

Para ejecutar el ataque Batch GCD sobre todo lo disponible del repositorio y de las fuentes ya unificadas, usar:

`ct_archive_global/moduli_hex_global_repo_completo.txt`

Este fichero contiene 54278 módulos RSA únicos.
