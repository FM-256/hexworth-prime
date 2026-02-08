# BankAccount Challenge - Solution

class BankAccount:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0

    def deposit(self, amount):
        self.balance += amount
        print(f"{self.owner} deposited ${amount}")

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            print(f"{self.owner} withdrew ${amount}")
        else:
            print("Insufficient funds.")

    def show_balance(self):
        print(f"{self.owner}'s balance: ${self.balance}")

# Example usage
alice = BankAccount("Alice")
bob = BankAccount("Bob")

alice.deposit(100)
alice.withdraw(30)
bob.deposit(200)
bob.show_balance()
