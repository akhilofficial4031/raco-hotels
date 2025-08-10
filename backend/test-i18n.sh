#!/bin/bash

# i18n Testing Script for Raco Hotels API
# This script tests the internationalization features

API_BASE="http://localhost:8787"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}🌍 Testing Raco Hotels API Internationalization${NC}\n"

# Function to test endpoint with different languages
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    echo -e "${BLUE}Testing endpoint: ${BOLD}$method $endpoint${NC}"
    
    # Test English
    echo -e "${GREEN}🇺🇸 English:${NC}"
    if [ "$method" = "POST" ]; then
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "Accept-Language: en" \
            -d "$data" \
            "$API_BASE$endpoint" | jq '.data.message // .error.message' 2>/dev/null || echo "No message field"
    else
        curl -s -H "Accept-Language: en" \
            "$API_BASE$endpoint" | jq '.data.message // .error.message' 2>/dev/null || echo "No message field"
    fi
    
    # Test Spanish
    echo -e "${GREEN}🇪🇸 Spanish:${NC}"
    if [ "$method" = "POST" ]; then
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "Accept-Language: es" \
            -d "$data" \
            "$API_BASE$endpoint" | jq '.data.message // .error.message' 2>/dev/null || echo "No message field"
    else
        curl -s -H "Accept-Language: es" \
            "$API_BASE$endpoint" | jq '.data.message // .error.message' 2>/dev/null || echo "No message field"
    fi
    
    # Test French
    echo -e "${GREEN}🇫🇷 French:${NC}"
    if [ "$method" = "POST" ]; then
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -H "Accept-Language: fr" \
            -d "$data" \
            "$API_BASE$endpoint" | jq '.data.message // .error.message' 2>/dev/null || echo "No message field"
    else
        curl -s -H "Accept-Language: fr" \
            "$API_BASE$endpoint" | jq '.data.message // .error.message' 2>/dev/null || echo "No message field"
    fi
    
    echo ""
}

# Check if API is running
echo -e "${BLUE}Checking if API is running...${NC}"
if ! curl -s "$API_BASE/health" > /dev/null; then
    echo -e "${RED}❌ API is not running at $API_BASE${NC}"
    echo -e "Please start the API with: ${BOLD}yarn dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ API is running${NC}\n"

# Test 1: Health Check
echo -e "${BOLD}🔍 Test 1: Health Check${NC}"
test_endpoint "/health"

# Test 2: User Not Found (404)
echo -e "${BOLD}🔍 Test 2: User Not Found${NC}"
test_endpoint "/api/users/99999"

# Test 3: Invalid Password Creation
echo -e "${BOLD}🔍 Test 3: Password Validation Error${NC}"
test_endpoint "/api/users" "POST" '{"email":"test@example.com","password":"weak"}'

# Test 4: Invalid Login
echo -e "${BOLD}🔍 Test 4: Invalid Login Credentials${NC}"
test_endpoint "/api/users/login" "POST" '{"email":"nonexistent@example.com","password":"wrongpass"}'

# Test 5: 404 Endpoint
echo -e "${BOLD}🔍 Test 5: 404 Not Found${NC}"
test_endpoint "/api/nonexistent"

# Test 6: User Creation Success (if no existing user)
echo -e "${BOLD}🔍 Test 6: User Creation (may fail if user exists)${NC}"
test_endpoint "/api/users" "POST" '{"email":"i18ntest@example.com","password":"SecurePass123!","fullName":"i18n Test User"}'

echo -e "${BOLD}🎉 i18n Testing Complete!${NC}"
echo -e "Check the responses above to verify different languages are working correctly."
echo -e "\n${BLUE}Expected behavior:${NC}"
echo -e "- English messages should be in English"
echo -e "- Spanish messages should be in Spanish"  
echo -e "- French messages should be in French"
echo -e "- Error codes should remain the same across languages"
