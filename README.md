# TFM de David Quinzaños

## Objetivos

Este repositorio reúne herramientas, scripts y documentación para el análisis y factorización de claves RSA de baja entropía, siguiendo los avances presentados en los artículos más relevantes sobre vulnerabilidades de generación de claves y técnicas de factorización masiva.

## Objetivos específicos:

+ Detectar claves RSA vulnerables generadas con baja entropía.
+ Implementar algoritmos eficientes de ~GCD~ para factorizar claves a gran escala.
+ Analizar logs de transparencia de certificados para encontrar factores compartidos.
+ Atribuir el origen de claves RSA sesgadas y vulnerables.
+ Evaluar la seguridad de certificados digitales mediante análisis masivo.
+ Recolectar y romper claves a escala usando técnicas de big data.
+ Documentar los avances y técnicas más relevantes en la factorización de claves RSA.

### Referencias


+ [[https://factorable.net/][The Million-key Question]]
+ [[https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/lenstra][Biased RSA private keys: origin attribution of GCD-factorable keys]]
+ [[https://www.usenix.org/conference/usenixsecurity16/technical-sessions/presentation/heninger][Reaping and breaking keys at scale: when crypto meets big data]]
+ [[https://www.usenix.org/conference/usenixsecurity19/presentation/filardo][The mechanics of compromising low entropy RSA keys]]
+ [[https://www.usenix.org/conference/usenixsecurity14/technical-sessions/presentation/heninger][Assessing the security of certificates at scale]]
+ [[https://www.usenix.org/conference/usenixsecurity18/presentation/filardo][Finding shared RSA factors in the Certificate Transparency logs]]
+ [[https://eprint.iacr.org/2022/1038][An efficient all-to-all GCD algorithm for low entropy RSA Key Factorizacion]]
