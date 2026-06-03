#!/usr/bin/env python3
"""
Extrae modulos RSA de certificados o de volcados ya procesados.

Formatos de entrada soportados:
  1. Texto de Domingo: lineas "Modulus: <hex>".
  2. Lista de modulos hexadecimales, uno por linea.
  3. PEM: certificados concatenados.
  4. DER/Base64 por linea: una entrada Base64 por linea.
  5. JSON CT log: entradas con "leaf_input" y, opcionalmente, "extra_data".
  6. Entradas comprimidas con .bz2 o .gz para los formatos de texto.

Uso:
    python3 extract_moduli.py total_certificados.txt.bz2 moduli_hex.txt
    python3 extract_moduli.py total_certificados.txt.bz2 moduli_2048.txt --bits 2048

El archivo de salida contiene un modulo RSA en hexadecimal por linea.
Se eliminan duplicados automaticamente.
"""

import argparse
import base64
import bz2
import gzip
import json
import re
import struct
import sys
from collections import Counter
from pathlib import Path

try:
    from cryptography import x509
    from cryptography.hazmat.primitives.asymmetric import rsa as rsa_module
except ImportError:
    x509 = None
    rsa_module = None


HEX_RE = re.compile(r"^[0-9a-fA-F]+$")
MODULUS_RE = re.compile(r"^\s*Modulus:\s*(.+?)\s*$", re.IGNORECASE)


def open_binary(path):
    suffix = Path(path).suffix.lower()
    if suffix == ".bz2":
        return bz2.open(path, "rb")
    if suffix == ".gz":
        return gzip.open(path, "rb")
    return open(path, "rb")


def open_text(path):
    suffix = Path(path).suffix.lower()
    if suffix == ".bz2":
        return bz2.open(path, "rt", encoding="utf-8", errors="replace")
    if suffix == ".gz":
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return open(path, "rt", encoding="utf-8", errors="replace")


def normalize_hex(value):
    value = value.strip().replace(":", "").replace(" ", "")
    if value.lower().startswith("0x"):
        value = value[2:]
    value = value.lstrip("0")
    if not value or not HEX_RE.fullmatch(value):
        return None
    return value.upper()


def add_modulus(moduli, bit_counter, mod_hex, target_bits):
    normalized = normalize_hex(mod_hex)
    if normalized is None:
        return False
    bits = int(normalized, 16).bit_length()
    if target_bits is not None and bits != target_bits:
        return False
    moduli.add(normalized)
    bit_counter[bits] += 1
    return True


def extract_from_der(der_bytes):
    """Extrae (key_size, modulo_hex) de un certificado DER."""
    if x509 is None:
        raise RuntimeError("falta la dependencia 'cryptography'")
    try:
        cert = x509.load_der_x509_certificate(der_bytes)
        pk = cert.public_key()
        if isinstance(pk, rsa_module.RSAPublicKey):
            n = pk.public_numbers().n
            return pk.key_size, format(n, "X")
    except Exception:
        pass
    return None, None


def extract_from_pem(pem_bytes):
    """Extrae (key_size, modulo_hex) de un certificado PEM."""
    if x509 is None:
        raise RuntimeError("falta la dependencia 'cryptography'")
    try:
        cert = x509.load_pem_x509_certificate(pem_bytes)
        pk = cert.public_key()
        if isinstance(pk, rsa_module.RSAPublicKey):
            n = pk.public_numbers().n
            return pk.key_size, format(n, "X")
    except Exception:
        pass
    return None, None


def extract_cert_from_ct_leaf(leaf_b64, extra_b64=""):
    """Extrae DER de una entrada CT (MerkleTreeLeaf)."""
    try:
        leaf = base64.b64decode(leaf_b64)
        if len(leaf) < 15:
            return None
        entry_type = struct.unpack(">H", leaf[10:12])[0]
        if entry_type == 0:  # x509_entry
            cert_len = int.from_bytes(leaf[12:15], "big")
            return leaf[15:15 + cert_len]
        if entry_type == 1:  # precert_entry
            extra = base64.b64decode(extra_b64)
            cert_len = int.from_bytes(extra[0:3], "big")
            return extra[3:3 + cert_len]
    except Exception:
        pass
    return None


def process_modulus_text_file(filepath, target_bits):
    """Procesa el formato ya extraido: lineas 'Modulus: <hex>'."""
    moduli = set()
    bit_counter = Counter()
    errors = 0
    total = 0
    no_rsa = 0

    with open_text(filepath) as f:
        for line in f:
            match = MODULUS_RE.match(line)
            if not match:
                continue

            total += 1
            value = match.group(1).strip()
            if "no modulus" in value.lower():
                no_rsa += 1
            elif not add_modulus(moduli, bit_counter, value, target_bits):
                errors += 1

            if total % 100000 == 0:
                print(f"  Procesados: {total:,} | RSA unicos: {len(moduli):,}",
                      flush=True)

    return moduli, total, errors, no_rsa, bit_counter


def process_moduli_hex_file(filepath, target_bits):
    """Procesa un archivo que ya contiene modulos hexadecimales."""
    moduli = set()
    bit_counter = Counter()
    errors = 0
    total = 0

    with open_text(filepath) as f:
        for line in f:
            value = line.strip()
            if not value or value.startswith("#"):
                continue
            total += 1
            if not add_modulus(moduli, bit_counter, value, target_bits):
                errors += 1

    return moduli, total, errors, 0, bit_counter


def process_pem_file(filepath, target_bits):
    """Procesa archivo con certificados PEM concatenados."""
    moduli = set()
    bit_counter = Counter()
    errors = 0
    total = 0

    with open_binary(filepath) as f:
        content = f.read()

    pem_pattern = re.compile(
        b"-----BEGIN CERTIFICATE-----\r?\n"
        b"(.*?)"
        b"-----END CERTIFICATE-----",
        re.DOTALL
    )
    certs = pem_pattern.findall(content)
    if not certs:
        return moduli, 0, 0, 0, bit_counter

    for cert_b64 in certs:
        total += 1
        pem_block = (b"-----BEGIN CERTIFICATE-----\n"
                     + cert_b64 + b"\n-----END CERTIFICATE-----\n")
        bits, mod_hex = extract_from_pem(pem_block)
        if mod_hex is not None:
            if target_bits is None or bits == target_bits:
                moduli.add(mod_hex)
                bit_counter[bits] += 1
        else:
            errors += 1

        if total % 10000 == 0:
            print(f"  Procesados: {total:,} | RSA unicos: {len(moduli):,}",
                  flush=True)

    return moduli, total, errors, 0, bit_counter


def process_der_file(filepath, target_bits):
    """Procesa archivo con un unico certificado DER."""
    bit_counter = Counter()
    with open_binary(filepath) as f:
        der = f.read()
    bits, mod_hex = extract_from_der(der)
    if mod_hex and (target_bits is None or bits == target_bits):
        bit_counter[bits] += 1
        return {mod_hex}, 1, 0, 0, bit_counter
    return set(), 1, 0 if mod_hex else 1, 0, bit_counter


def process_json_ct_file(filepath, target_bits):
    """Procesa JSONL con entradas de CT log."""
    moduli = set()
    bit_counter = Counter()
    errors = 0
    total = 0

    with open_text(filepath) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                entries = entry.get("entries", [entry]) if isinstance(entry, dict) else []
                for item in entries:
                    leaf_b64 = item.get("leaf_input", "")
                    extra_b64 = item.get("extra_data", "")
                    der = extract_cert_from_ct_leaf(leaf_b64, extra_b64)
                    if der:
                        total += 1
                        bits, mod_hex = extract_from_der(der)
                        if mod_hex and (target_bits is None or bits == target_bits):
                            moduli.add(mod_hex)
                            bit_counter[bits] += 1
                        elif mod_hex is None:
                            errors += 1
            except Exception:
                errors += 1

            if total % 10000 == 0 and total > 0:
                print(f"  Procesados: {total:,} | RSA unicos: {len(moduli):,}",
                      flush=True)

    return moduli, total, errors, 0, bit_counter


def process_base64_lines(filepath, target_bits):
    """Procesa certificados Base64, uno por linea, sin cabeceras PEM."""
    moduli = set()
    bit_counter = Counter()
    errors = 0
    total = 0

    with open_text(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("-"):
                continue
            try:
                der = base64.b64decode(line)
                total += 1
                bits, mod_hex = extract_from_der(der)
                if mod_hex and (target_bits is None or bits == target_bits):
                    moduli.add(mod_hex)
                    bit_counter[bits] += 1
                elif mod_hex is None:
                    errors += 1
            except Exception:
                errors += 1

            if total % 10000 == 0 and total > 0:
                print(f"  Procesados: {total:,} | RSA unicos: {len(moduli):,}",
                      flush=True)

    return moduli, total, errors, 0, bit_counter


def read_head(filepath, n_bytes=65536):
    with open_binary(filepath) as f:
        return f.read(n_bytes)


def detect_format(filepath):
    """Detecta formato del archivo de certificados o modulos."""
    head = read_head(filepath)

    if b"-----BEGIN CERTIFICATE-----" in head:
        return "pem"
    if head[:1] == b"\x30":
        return "der"

    text = head.decode("utf-8", errors="replace")
    if "Modulus:" in text:
        return "modulus_text"
    if text.lstrip().startswith("{"):
        return "json_ct"

    lines = [l.strip() for l in text.splitlines()
             if l.strip() and not l.strip().startswith("#")]
    if lines and all(HEX_RE.fullmatch(l.replace(":", "").replace(" ", ""))
                     for l in lines[:100]):
        return "moduli_hex"

    return "base64_lines"


def main():
    parser = argparse.ArgumentParser(
        description="Extrae modulos RSA de certificados X.509 o volcados CT")
    parser.add_argument("input", help="Archivo de entrada")
    parser.add_argument("output", help="Archivo de salida (modulos hex)")
    parser.add_argument("--bits", type=int, default=None,
                        help="Filtrar por tamano de modulo RSA, ej. 2048. "
                             "Sin filtro: extrae todas las RSA.")
    parser.add_argument("--format",
                        choices=["modulus_text", "moduli_hex", "pem", "der",
                                 "json_ct", "base64_lines"],
                        default=None,
                        help="Formato del archivo; si se omite, se autodetecta.")
    args = parser.parse_args()

    filepath = Path(args.input)
    if not filepath.exists():
        print(f"ERROR: no se encuentra {filepath}")
        sys.exit(1)

    fmt = args.format or detect_format(filepath)
    print(f"Archivo:  {filepath}")
    print(f"Formato:  {fmt}")
    print(f"Filtro:   RSA-{args.bits} bits" if args.bits else "Filtro:   todas las RSA")
    print()

    processors = {
        "modulus_text": process_modulus_text_file,
        "moduli_hex": process_moduli_hex_file,
        "pem": process_pem_file,
        "der": process_der_file,
        "json_ct": process_json_ct_file,
        "base64_lines": process_base64_lines,
    }

    if fmt in {"pem", "der", "json_ct", "base64_lines"} and x509 is None:
        print("ERROR: este formato necesita la dependencia 'cryptography'.")
        print("Instalar con:")
        print("  python3 -m pip install --user cryptography")
        sys.exit(1)

    moduli, total, errors, no_rsa, bit_counter = processors[fmt](filepath, args.bits)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w") as f:
        for mod_hex in sorted(moduli):
            f.write(mod_hex + "\n")

    print(f"\nEntradas procesadas:     {total:,}")
    if no_rsa:
        print(f"Entradas sin modulo RSA: {no_rsa:,}")
    print(f"Errores/filtrados:       {errors:,}")
    print(f"Modulos RSA unicos:      {len(moduli):,}")
    if bit_counter:
        print("Distribucion observada:")
        for bits, count in sorted(bit_counter.items()):
            print(f"  RSA-{bits}: {count:,} apariciones")
    print(f"Archivo de salida:       {output}")


if __name__ == "__main__":
    main()
