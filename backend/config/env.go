package config

import (
	"bufio"
	"log"
	"os"
	"strings"
)

// LoadEnv loads environment variables from a .env file
func LoadEnv(filePath string) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("INFO: Tidak dapat membuka file %s (%v). Menggunakan env system jika ada.", filePath, err)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		line = strings.TrimSpace(line)
		
		// Lewati baris kosong atau baris komentar
		if len(line) == 0 || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])

		// Hapus tanda kutip penutup jika ada
		if (strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"")) ||
			(strings.HasPrefix(val, "'") && strings.HasSuffix(val, "'")) {
			val = val[1 : len(val)-1]
		}

		// Set environment variable jika key valid
		if key != "" {
			os.Setenv(key, val)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("ERROR: Gagal memproses file %s: %v", filePath, err)
	} else {
		log.Printf("SUCCESS: Berhasil meload environment variable dari %s", filePath)
	}
}
