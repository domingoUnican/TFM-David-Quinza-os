#!/usr/bin/env python3
import sys, numpy as np
if not hasattr(np, "product"):
    np.product = np.prod
sys.path.insert(0, "/Users/davidquinza/Desktop/Máster Data Science/TFM/TFM_David_Quinzaños/codigo/binary_tree_Batch_GCD-main")
from binary_tree_batch_gcd import GCD_binary_tree
from utilities import single_run_GCD

if __name__ == "__main__":
    moduli = [int(line.strip(), 16) for line in open(sys.argv[1]) if line.strip()]
    B = GCD_binary_tree(moduli)
    factors = single_run_GCD(moduli, B)
    print(f"N={len(moduli)}, vulnerables={len(factors)}")
