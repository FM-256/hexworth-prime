
import tkinter as tk
from tkinter import messagebox
import json
import os

# BankAccount class with history and JSON support
# Represents a user's bank account with balance and transaction history.
class BankAccount:
    def __init__(self, owner):
        self.owner = owner
        self.balance = 0
        self.history = []

    # Adds money to the account and logs the transaction.
    def deposit(self, amount):
        self.balance += amount
        self.history.append(f"Deposited ${amount}")
        return f"{self.owner} deposited ${amount}"

    # Withdraws money if sufficient funds exist; logs the action.
    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            self.history.append(f"Withdrew ${amount}")
            return f"{self.owner} withdrew ${amount}"
        else:
            return "Insufficient funds."

    # Transfers money to another account, with transaction records on both sides.
    def transfer_to(self, target, amount):
        if self.balance >= amount:
            self.balance -= amount
            target.balance += amount
            self.history.append(f"Transferred ${amount} to {target.owner}")
            target.history.append(f"Received ${amount} from {self.owner}")
            return f"Transferred ${amount} to {target.owner}"
        else:
            return "Transfer failed: Insufficient funds."

    # Displays the current balance of the logged-in user.
    def show_balance(self):
        return f"{self.owner}'s balance: ${self.balance}"

    # Serializes the account data for saving to JSON.
    def to_dict(self):
        return {
            "owner": self.owner,
            "balance": self.balance,
            "history": self.history
        }

    @staticmethod
    # Deserializes JSON data into a BankAccount object.
    def from_dict(data):
        account = BankAccount(data["owner"])
        account.balance = data["balance"]
        account.history = data["history"]
        return account


# Main GUI application class that handles user interaction and logic.
class BankApp:
    def __init__(self, root):
        self.accounts = {}
        self.current_user = None
        self.load_data()

        root.title("Advanced Bank System")
        root.geometry("460x550")
        root.configure(bg="#e6ecf3")

        # Login/Create Account
        tk.Label(root, text="🏦 Welcome to Our Bank", font=("Helvetica", 16, "bold"),
                 fg="#1e2d40", bg="#e6ecf3").pack(pady=10)
        tk.Label(root, text="Username:", bg="#e6ecf3", fg="#1e2d40").pack()
        self.username_entry = tk.Entry(root)
        self.username_entry.pack()
        tk.Button(root, text="Login / Create", bg="#3b82f6", fg="white", command=self.login).pack(pady=5)

        tk.Label(root, text="Account Type:", bg="#e6ecf3", fg="#1e2d40").pack()
        tk.Button(root, text="Checking", bg="#3b82f6", fg="white", command=lambda: self.switch_account("Checking")).pack(pady=2)
        tk.Button(root, text="Savings", bg="#3b82f6", fg="white", command=lambda: self.switch_account("Savings")).pack(pady=2)
        tk.Button(root, text="Credit Card", bg="#3b82f6", fg="white", command=lambda: self.switch_account("Credit Card")).pack(pady=2)

        # Amount
        tk.Label(root, text="Amount:", bg="#e6ecf3", fg="#1e2d40").pack()
        self.amount_entry = tk.Entry(root)
        self.amount_entry.pack()

        # Transactions
        tk.Button(root, text="Deposit", bg="#3b82f6", fg="white", command=self.deposit).pack(pady=2)
        tk.Button(root, text="Withdraw", bg="#3b82f6", fg="white", command=self.withdraw).pack(pady=2)

        # Transfer
        tk.Label(root, text="Transfer To:", bg="#e6ecf3", fg="#1e2d40").pack()
        self.transfer_entry = tk.Entry(root)
        self.transfer_entry.pack()
        tk.Button(root, text="Transfer", bg="#3b82f6", fg="white", command=self.transfer).pack(pady=5)

        # Show Balance and History
        tk.Button(root, text="Show Balance", bg="#3b82f6", fg="white", command=self.show_balance).pack(pady=5)
        tk.Button(root, text="Show History", bg="#3b82f6", fg="white", command=self.show_history).pack(pady=5)
        tk.Button(root, text="Save Accounts", bg="#3b82f6", fg="white", command=self.save_data).pack(pady=5)

        self.output_label = tk.Label(root, text="", fg="#1e2d40", bg="#e6ecf3", wraplength=400, justify="left")
        self.output_label.pack(pady=10)

    # Logs in the user or creates a new account if it doesn't exist.
    def login(self):
        username = self.username_entry.get().strip()
        if not username:
            messagebox.showwarning("Missing Username", "Please enter a username.")
            return
        if username not in self.accounts:
            self.accounts[username] = BankAccount(username)
        self.current_user = self.accounts[username]
        self.output_label.config(text=f"Logged in as {username}")

    # Adds money to the account and logs the transaction.
    def deposit(self):
        if not self.current_user:
            return messagebox.showerror("Not Logged In", "Log in to an account first.")
        try:
            amount = float(self.amount_entry.get())
            msg = self.current_user.deposit(amount)
            self.output_label.config(text=msg)
        except ValueError:
            messagebox.showerror("Invalid Amount", "Enter a valid number.")

    # Withdraws money if sufficient funds exist; logs the action.
    def withdraw(self):
        if not self.current_user:
            return messagebox.showerror("Not Logged In", "Log in to an account first.")
        try:
            amount = float(self.amount_entry.get())
            msg = self.current_user.withdraw(amount)
            self.output_label.config(text=msg)
        except ValueError:
            messagebox.showerror("Invalid Amount", "Enter a valid number.")

    # Transfers money from the logged-in account to another user.
    def transfer(self):
        if not self.current_user:
            return messagebox.showerror("Not Logged In", "Log in to an account first.")
        target_name = self.transfer_entry.get().strip()
        if not target_name or target_name == self.current_user.owner:
            return messagebox.showerror("Invalid Target", "Enter a valid recipient username.")
        if target_name not in self.accounts:
            self.accounts[target_name] = BankAccount(target_name)
        try:
            amount = float(self.amount_entry.get())
            msg = self.current_user.transfer_to(self.accounts[target_name], amount)
            self.output_label.config(text=msg)
        except ValueError:
            messagebox.showerror("Invalid Amount", "Enter a valid number.")

    # Displays the current balance of the logged-in user.
    def show_balance(self):
        if self.current_user:
            self.output_label.config(text=self.current_user.show_balance())

    # Shows recent transaction history for the user.
    def show_history(self):
        if self.current_user:
            history = "\n".join(self.current_user.history[-10:]) or "No history yet."
            self.output_label.config(text=f"""Recent Transactions:\n{history}""")

    # Saves all account data to a JSON file.
    def save_data(self):
        data = {name: acc.to_dict() for name, acc in self.accounts.items()}
        with open("bank_data.json", "w") as f:
            json.dump(data, f)
        self.output_label.config(text="Accounts saved successfully.")

    # Loads all account data from a JSON file if it exists.
    def load_data(self):
        if os.path.exists("bank_data.json" ):
            with open("bank_data.json") as f:
                data = json.load(f)
                for name, acc_data in data.items():
                    self.accounts[name] = BankAccount.from_dict(acc_data)

if __name__ == "__main__":
    root = tk.Tk()
    app = BankApp(root)
    root.mainloop()
