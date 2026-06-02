#!/usr/bin/env python3
import sys, numpy as np
if not hasattr(np, "product"):
    np.product = np.prod
sys.path.insert(0, "/Users/davidquinza/Desktop/Máster Data Science/TFM/TFM_David_Quinzaños/codigo/binary_tree_Batch_GCD-main")
from remainder_tree_functions import remainder_tree_batch_gcd

if __name__ == "__main__":
    moduli = [int(line.strip(), 16) for line in open(sys.argv[1]) if line.strip()]
    factors = remainder_tree_batch_gcd(moduli)
    vuln = sum(1 for f in factors if f != 1)
    print(f"N={len(moduli)}, vulnerables={vuln}")
