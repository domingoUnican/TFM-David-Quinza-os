#!/bin/bash

OUTPUT_FILE="rsa.txt"

echo "Extrayendo issuer y modulus de certificados RSA de archivos zip..."
echo ""

> "$OUTPUT_FILE"
total=0

for zipfile in *.zip; do
    [ -f "$zipfile" ] || continue
    
    echo "Procesando: $zipfile"
    
    temp_dir=$(mktemp -d)
    unzip -q "$zipfile" "issuer/*" -d "$temp_dir"
    
    for cert in "$temp_dir"/issuer/*; do
        [ -f "$cert" ] || continue
        
        issuer=$(openssl x509 -in "$cert" -inform DER -noout -issuer 2>/dev/null | sed 's/issuer=//')
        modulus=$(openssl x509 -in "$cert" -inform DER -noout -modulus 2>/dev/null | sed 's/Modulus=//')
        
        if [ -n "$issuer" ]; then
            echo "Archivo: $zipfile" >> "$OUTPUT_FILE"
            echo "Issuer: $issuer" >> "$OUTPUT_FILE"
            echo "Modulus: $modulus" >> "$OUTPUT_FILE"
            echo "---" >> "$OUTPUT_FILE"
            ((total++))
        fi
    done
    
    rm -rf "$temp_dir"
done

echo ""
echo "Completado! $total certificados procesados."
echo "Guardado en: $OUTPUT_FILE"
