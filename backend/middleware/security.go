package middleware

import (
	"net/http"
)

// SecurityHeaders injects standard HTTP security headers
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Prevent browsers from MIME-sniffing a response away from the declared content-type
		w.Header().Set("X-Content-Type-Options", "nosniff")
		
		// Ensure the site is not embedded into a frame (prevent clickjacking)
		w.Header().Set("X-Frame-Options", "DENY")
		
		// Enable cross-site scripting (XSS) filter
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		
		// Prevent HTTP connections, enforce HTTPS (if applicable in production)
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		
		// Define content security policy to restrict resources
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*")

		next.ServeHTTP(w, r)
	})
}
