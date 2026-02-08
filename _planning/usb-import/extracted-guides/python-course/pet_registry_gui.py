# Pet Registry - GUI Version
import tkinter as tk
from tkinter import simpledialog, messagebox

class Pet:
    def __init__(self, name, species, age):
        self.name = name
        self.species = species
        self.age = age

    def __str__(self):
        return f"{self.name} ({self.species}), Age: {self.age}"

registry = []

def add_pet():
    name = simpledialog.askstring("Pet Name", "Enter pet's name:")
    species = simpledialog.askstring("Species", "Enter pet's species:")
    age = simpledialog.askstring("Age", "Enter pet's age:")
    if name and species and age:
        registry.append(Pet(name, species, age))
        messagebox.showinfo("Success", "Pet added successfully.")

def view_pets():
    if registry:
        info = "\n".join(str(p) for p in registry)
    else:
        info = "No pets registered."
    messagebox.showinfo("Pet Registry", info)

root = tk.Tk()
root.title("Pet Registry")
root.geometry("300x250")

tk.Button(root, text="Add Pet", command=add_pet, width=25).pack(pady=10)
tk.Button(root, text="View Pets", command=view_pets, width=25).pack(pady=10)
tk.Button(root, text="Exit", command=root.destroy, width=25).pack(pady=10)

root.mainloop()
