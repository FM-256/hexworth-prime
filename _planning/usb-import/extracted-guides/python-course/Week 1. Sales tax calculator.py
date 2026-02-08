
from datetime import date

STATE_TAX_RATE = 0.05
COUNTY_TAX_RATE = 0.025

print("Class Assignment")
print("Name: Robert Dedes")
print("Course: Programming for Technology Professionals")
print("Instructor: Professor F. Mora")
print("Assignment: Week 1 Assignment / Sales Tax Calculator")
print("Date:", date.today().strftime("%B %d, %Y"))
print("-" * 50)

amount = 89.99

state_tax = amount * STATE_TAX_RATE
county_tax = amount * COUNTY_TAX_RATE
total_tax = state_tax + county_tax
total_sale = amount + total_tax

print("\nSales Summary:")
print(f"Amount of Purchase:    ${amount:.2f}")
print(f"State Sales Tax (5%):  ${state_tax:.2f}")
print(f"County Sales Tax (2.5%): ${county_tax:.2f}")
print(f"Total Sales Tax:       ${total_tax:.2f}")
print(f"Total Sale:            ${total_sale:.2f}")