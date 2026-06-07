from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


PROJECT_DIR = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
POSTER_DIR = Path(__file__).resolve().parent
ASSETS_DIR = POSTER_DIR / "assets"
BENCHMARK_DIR = PROJECT_DIR / "resultados" / "benchmark"


COLORS = {
    "Remainder Tree (Python)": "#7a7a7a",
    "Binary Tree (Python)": "#d2872c",
    "Binary Tree (C++/GMP)": "#1f5a7a",
}


def save_cpp_scalability() -> None:
    df = pd.read_csv(WORKSPACE_ROOT / "benchmark_results" / "benchmark_results.csv")
    df = df[df["Algoritmo"] == "Binary Tree (C++/GMP)"].copy()

    fig, ax = plt.subplots(figsize=(9.2, 5.0))
    for bits, group in df.groupby("Bits"):
        group = group.sort_values("N")
        ax.plot(
            group["N"],
            group["Tiempo (s)"],
            marker="o",
            linewidth=2.8,
            markersize=6,
            label=f"RSA-{bits}",
        )

    ax.set_title("C++/GMP Binary Tree Batch GCD scalability", fontsize=16, weight="bold")
    ax.set_xlabel("Number of synthetic RSA moduli (N)", fontsize=12)
    ax.set_ylabel("Execution time (s)", fontsize=12)
    ax.grid(True, which="major", linestyle="--", linewidth=0.6, alpha=0.45)
    ax.legend(title="Modulus size", frameon=False)
    fig.tight_layout()
    fig.savefig(ASSETS_DIR / "scalability_batch_gcd_en.pdf", bbox_inches="tight")
    plt.close(fig)


def save_benchmark_grid() -> None:
    df = pd.read_csv(BENCHMARK_DIR / "benchmark_pelofske_extendido_results.csv")
    bits_values = [1024, 2048]
    weak_values = [2, 100, 1000]
    algorithms = [
        "Remainder Tree (Python)",
        "Binary Tree (Python)",
        "Binary Tree (C++/GMP)",
    ]

    fig, axes = plt.subplots(2, 3, figsize=(15.6, 8.2), sharex=True, sharey=True)

    for row, bits in enumerate(bits_values):
        for col, weak in enumerate(weak_values):
            ax = axes[row, col]
            subset = df[(df["Bits"] == bits) & (df["WEAK"] == weak)]
            for algorithm in algorithms:
                series = subset[subset["Algoritmo"] == algorithm].sort_values("N")
                ax.plot(
                    series["N"],
                    series["Tiempo (s)"],
                    marker="o",
                    linewidth=2.2,
                    markersize=4.5,
                    color=COLORS[algorithm],
                    label=algorithm,
                )

            ax.set_yscale("log")
            ax.set_title(f"RSA-{bits}, WEAK = {weak}", fontsize=12, weight="bold")
            ax.grid(True, which="both", linestyle="--", linewidth=0.45, alpha=0.38)
            if row == 1:
                ax.set_xlabel("Number of moduli (N)", fontsize=10)
            if col == 0:
                ax.set_ylabel("Time (s, log scale)", fontsize=10)

    handles, labels = axes[0, 0].get_legend_handles_labels()
    fig.legend(handles, labels, loc="lower center", ncol=3, frameon=False, fontsize=11)
    fig.suptitle("Benchmark against Pelofske's Python implementations", fontsize=17, weight="bold")
    fig.tight_layout(rect=(0, 0.06, 1, 0.95))
    fig.savefig(ASSETS_DIR / "pelofske_time_en.pdf", bbox_inches="tight")
    plt.close(fig)


def main() -> None:
    save_cpp_scalability()
    save_benchmark_grid()


if __name__ == "__main__":
    main()
