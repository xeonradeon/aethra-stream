#!/bin/bash

BASE_URL="https://aethra-stream.vercel.app"
OUTPUT="endpoint.txt"

echo "================================================" > $OUTPUT
echo "  AETHRA STREAM - API TEST RESULTS (LIVE)" >> $OUTPUT
echo "  Date: $(date)" >> $OUTPUT
echo "  Base URL: $BASE_URL" >> $OUTPUT
echo "================================================" >> $OUTPUT
echo "" >> $OUTPUT

echo "Checking server connection..." | tee -a $OUTPUT
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|304"; then
  echo "✅ Server is running at $BASE_URL" | tee -a $OUTPUT
else
  echo "❌ Server is NOT responding at $BASE_URL" | tee -a $OUTPUT
  exit 1
fi
echo "" >> $OUTPUT

test_endpoint() {
  local name="$1"
  local url="$2"
  
  echo "--- $name ---" >> $OUTPUT
  echo "URL: $url" >> $OUTPUT
  
  response=$(curl -s -m 15 "$url" 2>&1)
  
  if echo "$response" | jq -e . > /dev/null 2>&1; then
    echo "Status: ✅ SUCCESS" >> $OUTPUT
    echo "Response:" >> $OUTPUT
    echo "$response" | jq '.' >> $OUTPUT
  else
    echo "Status: ❌ ERROR" >> $OUTPUT
    echo "Response (raw):" >> $OUTPUT
    echo "$response" >> $OUTPUT
  fi
  
  echo "" >> $OUTPUT
  echo "----------------------------------------" >> $OUTPUT
  echo "" >> $OUTPUT
}

test_list() {
  local name="$1"
  local url="$2"
  
  echo "--- $name ---" >> $OUTPUT
  echo "URL: $url" >> $OUTPUT
  
  response=$(curl -s -m 15 "$url" 2>&1)
  
  if echo "$response" | jq -e .data.items > /dev/null 2>&1; then
    items=$(echo "$response" | jq '.data.items | length')
    echo "Status: ✅ SUCCESS" >> $OUTPUT
    echo "Total items: $items" >> $OUTPUT
    echo "Sample items:" >> $OUTPUT
    echo "$response" | jq '.data.items | limit(3; .[]) | {title, episode}' >> $OUTPUT
  elif echo "$response" | jq -e .data > /dev/null 2>&1; then
    echo "Status: ✅ SUCCESS" >> $OUTPUT
    echo "Response data exists" >> $OUTPUT
  else
    echo "Status: ❌ ERROR" >> $OUTPUT
    echo "Response:" >> $OUTPUT
    echo "$response" | jq '.' >> $OUTPUT 2>/dev/null || echo "$response" >> $OUTPUT
  fi
  
  echo "" >> $OUTPUT
  echo "----------------------------------------" >> $OUTPUT
  echo "" >> $OUTPUT
}

echo "===== ANIME TESTS =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

test_list "Anime Home" "$BASE_URL/api/scraper?source=anime&type=home&page=1"
test_list "Anime Terbaru" "$BASE_URL/api/scraper?source=anime&type=terbaru&page=1"
test_endpoint "Anime Detail (Tomb Raider King)" "$BASE_URL/api/scraper?source=anime&type=detail&slug=tomb-raider-king"

echo "" | tee -a $OUTPUT
echo "===== ANIME TESTS COMPLETED =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

echo "===== DONGHUA TESTS =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

test_list "Donghua Home" "$BASE_URL/api/scraper?source=donghua&type=home&page=1"
test_endpoint "Donghua Detail (Throne of Seal)" "$BASE_URL/api/scraper?source=donghua&type=detail&slug=throne-of-seal"

echo "" | tee -a $OUTPUT
echo "===== DONGHUA TESTS COMPLETED =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

echo "===== MOVIE TESTS =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

test_list "Movie Home" "$BASE_URL/api/scraper?source=movie&type=home&page=1"
test_endpoint "Movie Detail (Avengers Endgame)" "$BASE_URL/api/scraper?source=movie&type=detail&slug=avengers-endgame"

echo "" | tee -a $OUTPUT
echo "===== MOVIE TESTS COMPLETED =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

echo "===== KOMIK TESTS =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

test_list "Komik Home" "$BASE_URL/api/scraper?source=komik&type=home"
test_endpoint "Komik Detail (Solo Leveling)" "$BASE_URL/api/scraper?source=komik&type=detail&slug=solo-leveling"

echo "" | tee -a $OUTPUT
echo "===== KOMIK TESTS COMPLETED =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

echo "===== STATS TEST =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

test_endpoint "Stats" "$BASE_URL/api/stats"

echo "" | tee -a $OUTPUT
echo "===== STATS TEST COMPLETED =====" | tee -a $OUTPUT
echo "" | tee -a $OUTPUT

echo "================================================" >> $OUTPUT
echo "  TEST COMPLETED AT $(date)" >> $OUTPUT
echo "================================================" >> $OUTPUT

echo ""
echo "✅ Testing complete!"
echo "📄 Results saved to: $OUTPUT"
echo ""
