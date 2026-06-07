// =============================================================
//  Batch GCD distribuido — Producto global + chunk local
//  TFM: Vulnerabilidad de factores primos compartidos en RSA
// =============================================================
//
// Uso:
//   ./batch_gcd_global <todos_los_modulos.txt> <chunk.txt> [max_reportados]
//
// El programa carga todos los modulos RSA, calcula el producto global P y
// analiza solo el chunk asignado. Para cada modulo n del chunk calcula:
//
//   g = gcd(((P mod n^2) / n), n)
//
// Como P contiene todos los modulos, este test detecta si n comparte un
// factor primo con cualquier otro modulo del fichero global, aunque ese otro
// modulo este en otro chunk.

#include <algorithm>
#include <chrono>
#include <cstdlib>
#include <fstream>
#include <gmpxx.h>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

#ifdef _OPENMP
#include <omp.h>
#endif

using Clock = std::chrono::high_resolution_clock;

int available_threads()
{
#ifdef _OPENMP
    return omp_get_max_threads();
#else
    return 1;
#endif
}

void load_moduli_from_file(const std::string& filename,
                           std::vector<mpz_class>& moduli)
{
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "[ERROR] No se pudo abrir: " << filename << "\n";
        std::exit(1);
    }

    std::string line;
    while (std::getline(file, line)) {
        if (line.empty()) continue;
        moduli.emplace_back(line, 16);
    }
}

mpz_class product_range(const std::vector<mpz_class>& moduli, size_t begin, size_t end)
{
    const size_t count = end - begin;
    if (count == 0) return mpz_class(1);
    if (count == 1) return moduli[begin];

    if (count <= 1024) {
        mpz_class product(1);
        for (size_t i = begin; i < end; i++) {
            product *= moduli[i];
        }
        return product;
    }

    const size_t mid = begin + count / 2;
    mpz_class left = product_range(moduli, begin, mid);
    mpz_class right = product_range(moduli, mid, end);
    return left * right;
}

mpz_class product_of_moduli(const std::vector<mpz_class>& moduli)
{
    return product_range(moduli, 0, moduli.size());
}

int main(int argc, char* argv[])
{
    if (argc < 3) {
        std::cerr << "Uso: " << argv[0]
                  << " <todos_los_modulos.txt> <chunk.txt> [max_reportados]\n";
        return 1;
    }

    const std::string global_file = argv[1];
    const std::string chunk_file = argv[2];
    int max_reported = 0;
    if (argc >= 4) {
        max_reported = std::max(0, std::atoi(argv[3]));
    }

    std::cout << "============================================\n"
              << " Batch GCD distribuido — Producto global\n"
              << "============================================\n"
              << "Archivo global   : " << global_file << "\n"
              << "Archivo chunk    : " << chunk_file << "\n"
              << "Threads          : " << available_threads();
#ifdef _OPENMP
    std::cout << " (OpenMP)\n";
#else
    std::cout << " (secuencial, sin OpenMP)\n";
#endif
    std::cout << "--------------------------------------------\n\n";

    std::vector<mpz_class> all_moduli;
    std::vector<mpz_class> chunk_moduli;

    auto load_start = Clock::now();
    load_moduli_from_file(global_file, all_moduli);
    load_moduli_from_file(chunk_file, chunk_moduli);
    auto load_end = Clock::now();

    std::cout << "[Setup]\n"
              << "  Modulos globales     : " << all_moduli.size() << "\n"
              << "  Modulos del chunk    : " << chunk_moduli.size() << "\n"
              << "  Tiempo de carga      : " << std::fixed << std::setprecision(2)
              << std::chrono::duration<double, std::milli>(load_end - load_start).count()
              << " ms\n\n";

    if (all_moduli.size() < 2 || chunk_moduli.empty()) {
        std::cerr << "[ERROR] Se necesitan al menos 2 modulos globales y 1 modulo en el chunk.\n";
        return 1;
    }

    auto product_start = Clock::now();
    mpz_class P = product_of_moduli(all_moduli);
    all_moduli.clear();
    all_moduli.shrink_to_fit();
    auto product_end = Clock::now();

    std::cout << "[Fase 1] Producto global\n"
              << "  P bit-length         : " << mpz_sizeinbase(P.get_mpz_t(), 2) << " bits\n"
              << "  Tiempo transcurrido  : " << std::fixed << std::setprecision(2)
              << std::chrono::duration<double, std::milli>(product_end - product_start).count()
              << " ms\n\n";

    auto gcd_start = Clock::now();
    int found = 0;
    int reported = 0;

#ifdef _OPENMP
    #pragma omp parallel for schedule(dynamic, 16) reduction(+:found)
#endif
    for (size_t i = 0; i < chunk_moduli.size(); i++) {
        const mpz_class& n = chunk_moduli[i];
        mpz_class n2;
        mpz_mul(n2.get_mpz_t(), n.get_mpz_t(), n.get_mpz_t());

        mpz_class rem;
        mpz_mod(rem.get_mpz_t(), P.get_mpz_t(), n2.get_mpz_t());

        mpz_class quotient = rem / n;
        mpz_class g;
        mpz_gcd(g.get_mpz_t(), quotient.get_mpz_t(), n.get_mpz_t());

        if (g > 1) {
#ifdef _OPENMP
            #pragma omp critical
#endif
            {
                if (reported < max_reported) {
                    std::cout << "  [VULNERABLE] ChunkKey #" << std::setw(6) << i;
                    if (g != n) {
                        mpz_class q = n / g;
                        std::cout << " | p = " << g.get_str().substr(0, 40) << "..."
                                  << " | q = " << q.get_str().substr(0, 40) << "...";
                    } else {
                        std::cout << " | gcd = n (posible duplicado exacto)";
                    }
                    std::cout << "\n";
                    reported++;
                }
            }
            found++;
        }
    }
    auto gcd_end = Clock::now();

    std::cout << "\n[Fase 2] GCD del chunk contra producto global\n"
              << "  Claves vulnerables   : " << found << "\n"
              << "  Tiempo transcurrido  : " << std::fixed << std::setprecision(2)
              << std::chrono::duration<double, std::milli>(gcd_end - gcd_start).count()
              << " ms\n\n";

    double total_ms = std::chrono::duration<double, std::milli>(gcd_end - product_start).count();
    std::cout << "============================================\n"
              << " Tiempo total algoritmo: " << std::fixed << std::setprecision(2)
              << total_ms << " ms\n"
              << "============================================\n";

    return 0;
}
