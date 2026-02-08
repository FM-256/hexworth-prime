#Python 3.10.5 (tags/v3.10.5:f377153, Jun  6 2022, 16:14:13) [MSC v.1929 64 bit (AMD64)] on win32
#Type "help", "copyright", "credits" or "license()" for more information.
user = {
    "name": "Jheleen Navarro",
    "age": 20,
    "items": ["Prof. Frank Mora", "Week One Assignment", "4/10/2025"]
}
print(user["name"])
#Jheleen Navarro
print(user["items"])
['Prof. Frank Mora', 'Week One Assignment', '4/10/2025']
# Constants for the tax rates
STATE_TAX_RATE = 0.05  # 5% state tax
COUNTY_TAX_RATE = 0.025  # 2.5% county tax

# Function to calculate sales tax and total sale
def calculate_sales_tax(amount_of_purchase):
    # Calculate the state tax, county tax, and total sales tax
    state_sales_tax = amount_of_purchase * STATE_TAX_RATE
    county_sales_tax = amount_of_purchase * COUNTY_TAX_RATE
    total_sales_tax = state_sales_tax + county_sales_tax
    total_sale = amount_of_purchase + total_sales_tax
    
    # Return the calculated values
    return state_sales_tax, county_sales_tax, total_sales_tax, total_sale

# Main program
def main():
    # Input: Amount of purchase
    amount_of_purchase = float(input("Enter the amount of the purchase: $"))
    
    # Call the function to calculate taxes
    state_tax, county_tax, total_tax, total_sale = calculate_sales_tax(amount_of_purchase)
    
    # Output: Display the results formatted to 2 decimal places
    print("\nAmount of Purchase: ${:.2f}".format(amount_of_purchase))
    print("State Sales Tax: ${:.2f}".format(state_tax))
    print("County Sales Tax: ${:.2f}".format(county_tax))
    print("Total Sales Tax: ${:.2f}".format(total_tax))
    print("Total Sale (Including Tax): ${:.2f}".format(total_sale))

# Run the program
if __name__ == "__main__":
    main()

#SyntaxError: multiple statements found while compiling a single statement
