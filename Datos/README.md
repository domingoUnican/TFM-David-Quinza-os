## Datos

Esta carpeta conserva únicamente datos ligeros o datasets finales necesarios para reproducir los resultados del TFM.

No deben subirse a GitHub certificados completos, ZIPs de CT Logs ni ficheros brutos grandes. En particular, los ficheros `total_certificados*.txt`, `*.zip` y `*.bz2` quedan excluidos por `.gitignore`.

El fichero `modulos.txt` contiene 54.278 módulos RSA únicos en hexadecimal, un módulo por línea, y se usa como entrada limpia para el notebook `notebooks/batch_gcd_ctlogs.ipynb` cuando no está disponible el entorno temporal de extracción.
