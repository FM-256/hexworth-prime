User="Danger Doug"
Course_name="Programming in Python"
Instructor="Frank"
Assignment_Date="10April2025"
Todays_Date="10April2025"

Sales_Tax_Rate=0.05
County_Tax_Rate=0.025
purchase_amount=float(input("Amount:"))
sales_tax=purchase_amount*Sales_Tax_Rate
county_tax=purchase_amount*County_Tax_Rate
total_Tax=sales_tax+county_tax
total_sale=purchase_amount+total_Tax

print("Amount of purchase: $", format(purchase_amount,".2F"))
print("Sales tax: $",format(sales_tax,".2F"))
print("County tax: $",format(county_tax,".2F"))
print("Total Tax: $",format(total_Tax,".2F"))
print("total sale: $", format(total_sale,".2f"))
