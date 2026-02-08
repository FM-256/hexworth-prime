def main():
    # Assignment information

    print("Week 1 Assignment")
    print("Name: William Duran")
    print("Course: Programming for Technology Professionals") 
    print("Instructor: Frank Mora")
    print("Assignment: Python Programming Basics")
    print("Date: 04/11/2025")

    # Prompt for the amount purchase

    STATE_SALES_TAX = 0.05
    COUNTY_SALES_TAX = 0.025
    amount_of_purchase = float(input("Enter the amount of purchase: "))

    # Calculate sales taxes
    State_sales_tax_purchase = amount_of_purchase * STATE_SALES_TAX
    County_sales_tax_purchase = amount_of_purchase * COUNTY_SALES_TAX
    Total_sales_tax = State_sales_tax_purchase + County_sales_tax_purchase
    Total_sales = amount_of_purchase + Total_sales_tax
    
    #Results
    print(f"Amount of Purchase: ${amount_of_purchase:.2f}")
    print(f"State Sales Tax Purchase: ${State_sales_tax_purchase:.2f}")
    print(f"County Sales Tax Purchase: ${County_sales_tax_purchase:.2f}")
    print(f"Total Sales Tax: ${Total_sales_tax:.2f}")
    print(f"Total Sales: ${Total_sales:.2f}")

#Main function
    #Had so many issues with indentation, I had to rewrite the entire code a couple of times. Love VSCode, it helps alot to see Errors realtime.
if __name__ == "__main__":
    main()
# End of program1