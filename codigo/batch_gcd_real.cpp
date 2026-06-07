// =============================================================
//  Binary Tree Batch GCD (Pelofske) — Datos reales (CT Logs)
//  TFM: Vulnerabilidad de factores primos compartidos en RSA
// =============================================================

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <chrono>
#include <iomanip>
#include <cstdlib>
#include <gmpxx.h>

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

// ---------------------------------------------------------------
//  Carga modulos RSA desde archivo (hex, uno por linea)
// ---------------------------------------------------------------
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
    file.close();

    std::cout << "[Setup] " << moduli.size()
              << " modulos cargados desde " << filename << "\n";
    if (!moduli.empty()) {
        std::cout << "  Primer modulo : " << mpz_sizeinbase(moduli.front().get_mpz_t(), 2)
                  << " bits\n";
        std::cout << "  Ultimo modulo : " << mpz_sizeinbase(moduli.back().get_mpz_t(), 2)
                  << " bits\n\n";
    }
}

// ===============================================================
int main(int argc, char* argv[])
{
    if (argc < 2) {
        std::cerr << "Uso: " << argv[0] << " <archivo_modulos.txt> [max_reportados]\n";
        return 1;
    }

    std::string filename = argv[1];
    int max_reported = 0;
    if (argc >= 3) {
        max_reported = std::max(0, std::atoi(argv[2]));
    }

    std::cout << "============================================\n"
              << " Binary Tree Batch GCD — Datos Reales\n"
              << "============================================\n"
              << "Archivo          : " << filename << "\n"
              << "Threads          : " << available_threads();
#ifdef _OPENMP
    std::cout << " (OpenMP)\n";
#else
    std::cout << " (secuencial, sin OpenMP)\n";
#endif
    std::cout
              << "--------------------------------------------\n\n";

    // --- Carga de modulos ---
    std::vector<mpz_class> moduli;
    {
        auto t0 = Clock::now();
        load_moduli_from_file(filename, moduli);
        auto t1 = Clock::now();
        std::cout << "  Tiempo de carga  : " << std::fixed << std::setprecision(2)
                  << std::chrono::duration<double, std::milli>(t1 - t0).count()
                  << " ms\n\n";
    }

    if (moduli.size() < 2) {
        std::cerr << "[ERROR] Se necesitan al menos 2 modulos.\n";
        return 1;
    }

    // ==========================================================
    //  FASE 1 — Arbol de productos + GCD en linea
    //
    //  Construye el arbol binario bottom-up.  En cada nodo:
    //    1. GCD(hijo_izq, hijo_der) -> si > 1, se guarda
    //    2. Producto hijo_izq * hijo_der -> sube al padre
    //  Los hijos se liberan de inmediato para reducir Peak RAM.
    // ==========================================================
    std::vector<mpz_class> collected_gcds;
    int tree_levels = 0;

    auto t1_start = Clock::now();
    {
        std::vector<mpz_class> current(moduli.begin(), moduli.end());

        while (current.size() > 1) {
            size_t n      = current.size();
            size_t pairs  = n / 2;
            size_t next_n = (n + 1) / 2;
            std::vector<mpz_class> next(next_n);

            if (pairs >= 64) {
#ifdef _OPENMP
                int max_threads = available_threads();
                std::vector<std::vector<mpz_class>> local_gcds(max_threads);

                #pragma omp parallel for schedule(dynamic, 64)
                for (size_t i = 0; i < pairs; i++) {
                    mpz_class g;
                    mpz_gcd(g.get_mpz_t(),
                            current[2*i].get_mpz_t(),
                            current[2*i + 1].get_mpz_t());
                    if (g > 1) {
                        local_gcds[omp_get_thread_num()].push_back(std::move(g));
                    }
                    mpz_mul(next[i].get_mpz_t(),
                            current[2*i].get_mpz_t(),
                            current[2*i + 1].get_mpz_t());
                    current[2*i]     = mpz_class();
                    current[2*i + 1] = mpz_class();
                }

                for (auto& lg : local_gcds)
                    for (auto& g : lg)
                        collected_gcds.push_back(std::move(g));
#else
                for (size_t i = 0; i < pairs; i++) {
                    mpz_class g;
                    mpz_gcd(g.get_mpz_t(),
                            current[2*i].get_mpz_t(),
                            current[2*i + 1].get_mpz_t());
                    if (g > 1) {
                        collected_gcds.push_back(std::move(g));
                    }
                    mpz_mul(next[i].get_mpz_t(),
                            current[2*i].get_mpz_t(),
                            current[2*i + 1].get_mpz_t());
                    current[2*i]     = mpz_class();
                    current[2*i + 1] = mpz_class();
                }
#endif
            } else {
                for (size_t i = 0; i < pairs; i++) {
                    mpz_class g;
                    mpz_gcd(g.get_mpz_t(),
                            current[2*i].get_mpz_t(),
                            current[2*i + 1].get_mpz_t());
                    if (g > 1) {
                        collected_gcds.push_back(std::move(g));
                    }
                    mpz_mul(next[i].get_mpz_t(),
                            current[2*i].get_mpz_t(),
                            current[2*i + 1].get_mpz_t());
                    current[2*i]     = mpz_class();
                    current[2*i + 1] = mpz_class();
                }
            }

            if (n % 2 == 1) {
                next[next_n - 1] = std::move(current[n - 1]);
            }
            current = std::move(next);
            tree_levels++;
        }
    }
    auto t1_end = Clock::now();

    std::cout << "[Fase 1] Arbol de productos + GCD en linea\n"
              << "  Niveles construidos  : " << tree_levels << "\n"
              << "  GCDs no triviales    : " << collected_gcds.size() << "\n"
              << "  Tiempo transcurrido  : " << std::fixed << std::setprecision(2)
              << std::chrono::duration<double, std::milli>(t1_end - t1_start).count()
              << " ms\n\n";

    // ==========================================================
    //  FASE 2 — Agregacion de factores compartidos en B
    //
    //  Multiplica todos los GCD no triviales en una unica
    //  variable gigante B.
    // ==========================================================
    mpz_class B(1);

    auto t2_start = Clock::now();
    {
        for (auto& g : collected_gcds) {
            B *= g;
        }
        collected_gcds.clear();
        collected_gcds.shrink_to_fit();
    }
    auto t2_end = Clock::now();

    std::cout << "[Fase 2] Agregacion en variable B\n"
              << "  B bit-length         : "
              << mpz_sizeinbase(B.get_mpz_t(), 2) << " bits\n"
              << "  Tiempo transcurrido  : " << std::fixed << std::setprecision(2)
              << std::chrono::duration<double, std::milli>(t2_end - t2_start).count()
              << " ms\n\n";

    // ==========================================================
    //  FASE 3 — Enumeracion final (paralelizada con OpenMP)
    //
    //  Para cada modulo original N_i, calcula GCD(N_i, B).
    //  Si el resultado != 1, la clave es vulnerable.
    // ==========================================================
    auto t3_start = Clock::now();
    int found = 0;
    int reported = 0;

#ifdef _OPENMP
    #pragma omp parallel for schedule(dynamic, 64) reduction(+:found)
#endif
    for (size_t i = 0; i < moduli.size(); i++) {
        mpz_class g;
        mpz_gcd(g.get_mpz_t(), moduli[i].get_mpz_t(), B.get_mpz_t());

        if (g > 1) {
#ifdef _OPENMP
            #pragma omp critical
#endif
            {
                if (reported < max_reported) {
                    std::cout << "  [VULNERABLE] Key #" << std::setw(6) << i;
                    if (g != moduli[i]) {
                        mpz_class q = moduli[i] / g;
                        std::cout << " | p = " << g.get_str().substr(0, 40) << "..."
                                  << " | q = " << q.get_str().substr(0, 40) << "...";
                    } else {
                        std::cout << " | gcd(N_i, B) = N_i";
                    }
                    std::cout << "\n";
                    reported++;
                }
            }
            found++;
        }
    }
    auto t3_end = Clock::now();

    std::cout << "\n[Fase 3] Enumeracion final\n"
              << "  Claves vulnerables   : " << found << "\n"
              << "  Tiempo transcurrido  : " << std::fixed << std::setprecision(2)
              << std::chrono::duration<double, std::milli>(t3_end - t3_start).count()
              << " ms\n\n";

    // --- Resumen ---
    double total_ms = std::chrono::duration<double, std::milli>(t3_end - t1_start).count();
    std::cout << "============================================\n"
              << " Tiempo total algoritmo: " << std::fixed << std::setprecision(2)
              << total_ms << " ms\n"
              << "============================================\n";

    return 0;
}
