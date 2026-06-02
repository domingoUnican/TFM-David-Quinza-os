#!/usr/bin/env python3
"""
Benchmark: Reproduccion del articulo de Pelofske con extension C++/GMP.
Ejecutar en Altamira via SLURM o directamente con:
    python3 benchmark_pelofske.py

Reproduce la parrilla completa del articulo:
  - 1024 bits (primos 512): N = 5000, 10000, ..., 120000
  - 2048 bits (primos 1024): N = 5000, 10000, ..., 75000
  - WEAK = 2, 100, 1000

Compara tres algoritmos:
  1. Remainder Tree Batch GCD (Python, repositorio Pelofske)
  2. Binary Tree Batch GCD   (Python, repositorio Pelofske)
  3. Binary Tree Batch GCD   (C++17/GMP/OpenMP, implementacion propia)

Resultados se guardan incrementalmente en CSV.
"""

import ast
import importlib.util
import math
import os
import random
import re
import subprocess
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------
#  Dependencias
# ---------------------------------------------------------------
REQUIRED = {"psutil": "psutil", "numpy": "numpy", "pandas": "pandas",
            "Crypto": "pycryptodome"}
missing = []
for imp, pkg in REQUIRED.items():
    if importlib.util.find_spec(imp) is None:
        missing.append(pkg)
if missing:
    print("ERROR: faltan dependencias Python:", ", ".join(missing))
    print("Cargarlas con module si existen o instalarlas en el entorno de usuario antes de lanzar el benchmark.")
    sys.exit(1)

import psutil
import numpy as np
import pandas as pd
from Crypto.Util import number as crypto_number

# Compatibilidad NumPy >= 2.0 (el repositorio usa np.product)
if not hasattr(np, "product"):
    np.product = np.prod

# ---------------------------------------------------------------
#  Rutas
# ---------------------------------------------------------------
BASE_DIR    = Path(__file__).resolve().parent
REPO_DIR    = BASE_DIR / "binary_tree_Batch_GCD-main"
CPP_BIN     = BASE_DIR / "batch_gcd_real"
DATA_DIR    = BASE_DIR / "benchmark_data"
RESULTS_DIR = BASE_DIR / "benchmark_results"
PRIMES_DIR  = REPO_DIR / "primes"
RESULTS_CSV = RESULTS_DIR / "benchmark_results.csv"
SUMMARY_CSV = RESULTS_DIR / "benchmark_summary.csv"

DATA_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)
PRIMES_DIR.mkdir(exist_ok=True)
sys.path.insert(0, str(REPO_DIR.resolve()))

# ---------------------------------------------------------------
#  Configuracion experimental (parrilla del articulo)
# ---------------------------------------------------------------
BITLENGTHS_CONFIG = {
    512:  list(range(5000, 120001, 5000)),   # 1024-bit moduli
    1024: list(range(5000,  75001, 5000)),   # 2048-bit moduli
}

WEAK_VALUES = [2, 100, 1000]
TIMEOUT     = 86400   # 24 h (suficiente para Remainder Tree en N grandes)
SHUFFLE_SEED = 0
RESUME      = True
RERUN_TIMEOUTS = False

# ---------------------------------------------------------------
#  Funciones auxiliares
# ---------------------------------------------------------------
def required_prime_count(max_n, weak_values, margin=10):
    """Numero de primos necesarios para generate_weak_keys()."""
    return max(2 * max_n - w for w in weak_values) + 1 + margin


def ensure_primes(n_primes, bitlength):
    """Genera archivos primes/i_bitlength.txt que falten."""
    missing = [i for i in range(n_primes)
               if not (PRIMES_DIR / f"{i}_{bitlength}.txt").exists()]
    if not missing:
        print(f"  Primos de {bitlength} bits: {n_primes} disponibles.")
        return
    print(f"  Primos de {bitlength} bits: generando {len(missing)}...", flush=True)
    for i in missing:
        p = crypto_number.getPrime(bitlength)
        (PRIMES_DIR / f"{i}_{bitlength}.txt").write_text(str(p))
    print(f"  Generados {len(missing)} primos de {bitlength} bits.")


def generate_weak_keys(total, weak, bitlength):
    """Wrapper de utilities.generate_weak_keys con chdir al repo."""
    old_cwd = os.getcwd()
    try:
        os.chdir(REPO_DIR)
        from utilities import generate_weak_keys as _gen
        tracking, unique_shared = _gen(total, weak, bitlength)
    finally:
        os.chdir(old_cwd)
    return tracking, unique_shared


# ---- Wrappers para ejecutar algoritmos como subproceso ----
def _write_wrapper(path, code):
    path.write_text(code)

repo_abs = str(REPO_DIR.resolve())

WRAPPER_RT = BASE_DIR / "_wrapper_remainder_tree.py"
_write_wrapper(WRAPPER_RT, f"""#!/usr/bin/env python3
import sys, numpy as np
if not hasattr(np, "product"):
    np.product = np.prod
sys.path.insert(0, "{repo_abs}")
from remainder_tree_functions import remainder_tree_batch_gcd

if __name__ == "__main__":
    moduli = [int(line.strip(), 16) for line in open(sys.argv[1]) if line.strip()]
    factors = remainder_tree_batch_gcd(moduli)
    vuln = sum(1 for f in factors if f != 1)
    print(f"N={{len(moduli)}}, vulnerables={{vuln}}")
""")

WRAPPER_BT = BASE_DIR / "_wrapper_binary_tree.py"
_write_wrapper(WRAPPER_BT, f"""#!/usr/bin/env python3
import sys, numpy as np
if not hasattr(np, "product"):
    np.product = np.prod
sys.path.insert(0, "{repo_abs}")
from binary_tree_batch_gcd import GCD_binary_tree
from utilities import single_run_GCD

if __name__ == "__main__":
    moduli = [int(line.strip(), 16) for line in open(sys.argv[1]) if line.strip()]
    B = GCD_binary_tree(moduli)
    factors = single_run_GCD(moduli, B)
    print(f"N={{len(moduli)}}, vulnerables={{len(factors)}}")
""")


def measure_execution(cmd, timeout=TIMEOUT, poll_interval=0.1):
    """Ejecuta comando, mide wall-clock y pico RSS."""
    t_start = time.monotonic()
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    peak_rss = 0
    timed_out = False

    try:
        ps = psutil.Process(proc.pid)
        while proc.poll() is None:
            try:
                rss = ps.memory_info().rss
                for child in ps.children(recursive=True):
                    try:
                        rss += child.memory_info().rss
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
                peak_rss = max(peak_rss, rss)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
            if (time.monotonic() - t_start) > timeout:
                proc.kill()
                proc.wait()
                timed_out = True
                break
            time.sleep(poll_interval)
    except psutil.NoSuchProcess:
        pass

    stdout, stderr = proc.communicate()
    return {
        "time_s": round(time.monotonic() - t_start, 3),
        "peak_ram_mb": round(peak_rss / (1024**2), 2),
        "returncode": proc.returncode,
        "timeout": timed_out,
        "stdout": stdout.decode(errors="replace"),
        "stderr": stderr.decode(errors="replace"),
    }


def parse_vulnerables(stdout):
    for pat in [r"vulnerables=(\d+)", r"Claves vulnerables\s*:\s*(\d+)"]:
        m = re.search(pat, stdout)
        if m:
            return int(m.group(1))
    return None


# ---- CSV incremental ----
def load_records():
    if RESUME and RESULTS_CSV.exists():
        df = pd.read_csv(RESULTS_CSV)
        print(f"Reanudando: {len(df)} registros existentes en {RESULTS_CSV.name}")
        return df.to_dict("records")
    return []


def should_skip(records, bits, weak, n, algo):
    if not RESUME or not records:
        return False
    df = pd.DataFrame(records)
    mask = ((df["Bits"] == bits) & (df["WEAK"] == weak) &
            (df["N"] == n) & (df["Algoritmo"] == algo))
    if not mask.any():
        return False
    row = df[mask].iloc[-1]
    if RERUN_TIMEOUTS and bool(row.get("Timeout", False)):
        return False
    return True


def upsert_record(records, record):
    records = [r for r in records if not (
        r["Bits"] == record["Bits"] and r["WEAK"] == record["WEAK"] and
        r["N"] == record["N"] and r["Algoritmo"] == record["Algoritmo"])]
    records.append(record)
    pd.DataFrame(records).sort_values(
        ["Bits", "WEAK", "N", "Algoritmo"]).to_csv(RESULTS_CSV, index=False)
    return records


# ---------------------------------------------------------------
#  Ejecucion principal
# ---------------------------------------------------------------
def main():
    print("=" * 72)
    print(" Benchmark Pelofske — Parrilla completa del articulo")
    print("=" * 72)
    print(f"  BITLENGTHS: {list(BITLENGTHS_CONFIG.keys())}")
    print(f"  WEAK:       {WEAK_VALUES}")
    print(f"  Timeout:    {TIMEOUT} s")
    print(f"  Binario:    {CPP_BIN}")
    print()

    if not CPP_BIN.exists():
        print(f"ERROR: No se encuentra {CPP_BIN}. Ejecuta setup.sh primero.")
        sys.exit(1)

    ALGORITHMS = [
        ("Remainder Tree (Python)",
         lambda df: [sys.executable, str(WRAPPER_RT), df]),
        ("Binary Tree (Python)",
         lambda df: [sys.executable, str(WRAPPER_BT), df]),
        ("Binary Tree (C++/GMP)",
         lambda df: [str(CPP_BIN), df]),
    ]

    records = load_records()

    for bitlength, sizes in BITLENGTHS_CONFIG.items():
        moduli_bits = bitlength * 2
        print(f"\n{'+'*72}")
        print(f" Modulos RSA de {moduli_bits} bits (primos de {bitlength} bits)")
        print(f"{'+'*72}")

        n_primes = required_prime_count(max(sizes), WEAK_VALUES)
        ensure_primes(n_primes, bitlength)

        for weak in WEAK_VALUES:
            print(f"\n{'-'*72}")
            print(f" WEAK = {weak}")
            print(f"{'-'*72}")

            for n in sizes:
                if weak >= n:
                    print(f"\n  N={n}, WEAK={weak}: omitido (WEAK >= N)")
                    continue

                print(f"\n  N = {n}, WEAK = {weak}, modulos = {moduli_bits} bits")

                # Generar datos
                hex_file = DATA_DIR / f"moduli_N{n}_weak{weak}_{moduli_bits}bit.txt"
                if not hex_file.exists():
                    random.seed(SHUFFLE_SEED)
                    tracking, _ = generate_weak_keys(n, weak, bitlength)
                    moduli = list(tracking.keys())
                    random.shuffle(moduli)
                    with open(hex_file, "w") as f:
                        for m in moduli:
                            f.write(f"{m:x}\n")
                    print(f"    Datos generados: {hex_file.name}")
                else:
                    print(f"    Datos existentes: {hex_file.name}")

                datafile = str(hex_file)

                for idx, (algo_name, cmd_builder) in enumerate(ALGORITHMS, 1):
                    if should_skip(records, moduli_bits, weak, n, algo_name):
                        print(f"    [{idx}/3] {algo_name}... omitido (ya existe)")
                        continue

                    print(f"    [{idx}/3] {algo_name}...", end=" ", flush=True)
                    result = measure_execution(cmd_builder(datafile), timeout=TIMEOUT)

                    if result["timeout"]:
                        tag = "TIMEOUT"
                    elif result["returncode"] != 0:
                        tag = f"ERROR (rc={result['returncode']})"
                        print(f"\n      stderr: {result['stderr'][:200]}")
                    else:
                        tag = f"{result['time_s']:.1f}s"

                    print(f"{tag} | RAM: {result['peak_ram_mb']:.0f} MB")

                    record = {
                        "Bits": moduli_bits,
                        "Bitlength primo": bitlength,
                        "WEAK": weak,
                        "N": n,
                        "Algoritmo": algo_name,
                        "Tiempo (s)": None if result["timeout"] else result["time_s"],
                        "RAM pico (MB)": result["peak_ram_mb"],
                        "Timeout": result["timeout"],
                        "Vulnerables": parse_vulnerables(result["stdout"]),
                    }
                    records = upsert_record(records, record)

    # ---- Resumen final ----
    print("\n" + "=" * 72)
    print(" Resumen")
    print("=" * 72)
    df = pd.DataFrame(records).sort_values(["Bits", "WEAK", "N", "Algoritmo"])
    df.to_csv(RESULTS_CSV, index=False)

    pivot = df.pivot_table(index=["Bits", "WEAK", "N"],
                           columns="Algoritmo", values="Tiempo (s)")
    ref = "Remainder Tree (Python)"
    for algo in pivot.columns:
        if algo != ref:
            pivot[f"Speedup {algo}"] = (pivot[ref] / pivot[algo]).round(1)
    pivot.to_csv(SUMMARY_CSV)

    print(f"Resultados: {RESULTS_CSV}")
    print(f"Resumen:    {SUMMARY_CSV}")
    print(df.to_string(index=False))


if __name__ == "__main__":
    main()
