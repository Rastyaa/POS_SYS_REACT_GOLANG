package middleware

import (
	"net/http"
	"sync"
	"time"

	"pos-backend/utils"
)

// visitor defines the rate limiting properties for an IP
type visitor struct {
	lastSeen time.Time
	count    int
}

var (
	visitors = make(map[string]*visitor)
	mtx      sync.Mutex
)

// Run a background goroutine to clean up old visitors every minute
func init() {
	go cleanupVisitors()
}

func cleanupVisitors() {
	for {
		time.Sleep(time.Minute)
		mtx.Lock()
		for ip, v := range visitors {
			if time.Since(v.lastSeen) > 3*time.Minute {
				delete(visitors, ip)
			}
		}
		mtx.Unlock()
	}
}

// RateLimit is a simple IP-based rate limiter middleware
func RateLimit(limit int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			// Basic IP extraction
			if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
				ip = forwarded
			}

			mtx.Lock()
			v, exists := visitors[ip]
			if !exists {
				visitors[ip] = &visitor{lastSeen: time.Now(), count: 1}
			} else {
				// Reset count if window has passed
				if time.Since(v.lastSeen) > window {
					v.count = 0
				}
				v.count++
				v.lastSeen = time.Now()

				if v.count > limit {
					mtx.Unlock()
					utils.WriteJSON(w, http.StatusTooManyRequests, false, "Terlalu banyak permintaan. Silakan coba lagi nanti.", nil)
					return
				}
			}
			mtx.Unlock()

			next.ServeHTTP(w, r)
		})
	}
}
