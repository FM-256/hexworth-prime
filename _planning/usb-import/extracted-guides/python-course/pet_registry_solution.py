# Pet Registry - Solution

class Pet:
    def __init__(self, name, species, age):
        self.name = name
        self.species = species
        self.age = age

    def __str__(self):
        return f"{self.name} ({self.species}), Age: {self.age}"

registry = []

def add_pet():
    name = input("Pet name: ")
    species = input("Species: ")
    age = input("Age: ")
    registry.append(Pet(name, species, age))

def view_pets():
    print("\nPet Registry:")
    for pet in registry:
        print("-", pet)

while True:
    print("\n1. Add Pet\n2. View Pets\n3. Exit")
    choice = input("Choose: ")
    if choice == "1":
        add_pet()
    elif choice == "2":
        view_pets()
    elif choice == "3":
        break
    else:
        print("Invalid choice.")
