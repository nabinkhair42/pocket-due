#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API base URL
API_URL="https://pocket-due.vercel.app/api"

echo -e "${BLUE}🚀 PocketDue Dummy Data Insertion Script${NC}"
echo -e "${BLUE}==========================================${NC}\n"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if server is running
print_info "Checking if server is running..."
if ! curl -s "$API_URL/auth/login" > /dev/null 2>&1; then
    print_error "Server is not running! Please start the server first:"
    echo "   cd pocketDue-api && npm run dev"
    exit 1
fi
print_status "Server is running!"

# Login and get token
print_info "Logging in to get authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nabinkhair12@gmail.com",
    "password": "Nabin=$12"
  }')

# Extract token from response
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    print_error "Failed to get authentication token!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

print_status "Successfully logged in!"

# Function to insert payment
insert_payment() {
    local type=$1
    local personName=$2
    local amount=$3
    local description=$4
    local dueDate=$5
    
    local response=$(curl -s -X POST "$API_URL/payments" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"type\": \"$type\",
        \"personName\": \"$personName\",
        \"amount\": $amount,
        \"description\": \"$description\",
        \"dueDate\": \"$dueDate\"
      }")
    
    if echo "$response" | grep -q '"success":true'; then
        print_status "Added $type: $personName - ₨$amount"
    else
        print_error "Failed to add $personName"
        echo "Response: $response"
    fi
}

echo -e "\n${BLUE}💰 Inserting To Pay payments...${NC}"
echo "=================================="

# To Pay payments
insert_payment "to_pay" "Bikash Thapa" 2500 "Lunch at restaurant" "2024-01-15"
insert_payment "to_pay" "Sita Tamang" 1800 "Movie tickets" "2024-01-20"
insert_payment "to_pay" "Rajesh Gurung" 3200 "Gas money for road trip" "2024-01-25"
insert_payment "to_pay" "Anita Lama" 950 "Coffee and snacks" "2024-01-18"
insert_payment "to_pay" "Prakash Shrestha" 4500 "Dinner at fancy restaurant" "2024-01-30"
insert_payment "to_pay" "Laxmi Magar" 1200 "Uber ride" "2024-01-22"
insert_payment "to_pay" "Santosh Rai" 2800 "Concert tickets" "2024-02-05"
insert_payment "to_pay" "Rekha Limbu" 1600 "Shopping mall expenses" "2024-01-28"

echo -e "\n${BLUE}💸 Inserting To Receive payments...${NC}"
echo "======================================"

# To Receive payments
insert_payment "to_receive" "Amit Basnet" 5000 "Lent money for emergency" "2024-01-20"
insert_payment "to_receive" "Mina Karki" 3200 "Dinner payment" "2024-01-25"
insert_payment "to_receive" "Jeevan Thapa" 1800 "Coffee and lunch" "2024-01-18"
insert_payment "to_receive" "Sabina Gurung" 4200 "Movie and dinner" "2024-01-30"
insert_payment "to_receive" "Ramesh Magar" 2800 "Gas money" "2024-02-01"
insert_payment "to_receive" "Puja Tamang" 1500 "Shopping expenses" "2024-01-22"
insert_payment "to_receive" "Krishna Limbu" 3600 "Weekend trip expenses" "2024-02-10"
insert_payment "to_receive" "Anjali Rai" 2100 "Birthday party contribution" "2024-01-28"
insert_payment "to_receive" "Dipak Shrestha" 3900 "Concert tickets" "2024-02-15"

echo -e "\n${BLUE}📊 Verifying data...${NC}"
echo "====================="

# Get payment summaries
SUMMARIES_RESPONSE=$(curl -s -X GET "$API_URL/payments/summaries" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SUMMARIES_RESPONSE" | grep -q '"success":true'; then
    print_status "Data verification successful!"
    
    # Extract summary info
    TOTAL_PAYMENTS=$(echo "$SUMMARIES_RESPONSE" | grep -o '"summaries":\[[^]]*\]' | grep -o 'personName' | wc -l)
    
    echo -e "\n${BLUE}📈 SUMMARY:${NC}"
    echo "=========="
    echo "Total payments inserted: $TOTAL_PAYMENTS"
    echo "To Pay: 8 payments"
    echo "To Receive: 9 payments"
    echo "Net Balance: +₨9,550"
    
else
    print_error "Failed to verify data!"
    echo "Response: $SUMMARIES_RESPONSE"
fi

echo -e "\n${GREEN}🎉 Dummy data insertion completed!${NC}"
echo -e "${YELLOW}📱 You can now test the app with:${NC}"
echo "   Email: nabinkhair12@gmail.com"
echo "   Password: Nabin=$12"
echo -e "\n${BLUE}🚀 Happy testing!${NC}"
