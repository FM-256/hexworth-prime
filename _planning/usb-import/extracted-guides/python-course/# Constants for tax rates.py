# Constants for tax rates
STATE_SALES_TAX_RATE = 0.05
COUNTY_SALES_TAX_RATE = 0.025

def calculate_taxes(amount_of_purchase):
   
    state_sales_tax = amount_of_purchase * STATE_SALES_TAX_RATE
    county_sales_tax = amount_of_purchase * COUNTY_SALES_TAX_RATE
    total_sales_tax = state_sales_tax + county_sales_tax
    total_sale = amount_of_purchase + total_sales_tax

    #Purchase: ${amount_of_purchase:.2f}")
    print(f"State sales tax: ${state_sales_tax:.2f}")
    print(f"County sales tax: ${county_sales_tax:.2f}")
    print(f"Total sales tax: ${total_sales_tax:.2f}")
    print(f"Total sale: ${total_sale:.2f}")


amount_of_purchase = float(input("Enter the amount of purchase: "))
calculate_taxes(amount_of_purchase)
