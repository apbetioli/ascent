#!/usr/bin/env bash
# Simulate multiple visitors from different IPs (for testing visitor count / rate limits).
# Usage: ./scripts/simulate-visitors.sh [base_url]
# Example: ./scripts/simulate-visitors.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"

for i in {1..5}; do
  # Each "user" gets a different IP so we stay under 10 req/min per IP
  ip="192.168.1.$((100 + i))"
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Forwarded-For: $ip" "$BASE_URL/")
  echo "IP $ip -> HTTP $code"
done

echo "Done. Check your app's live visitor count."
