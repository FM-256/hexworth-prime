import random

# Step 1: Secret number is randomly chosen between 1 and 10
secret_number = random.randint(1, 10)

# Step 2: Ask the user to guess the number
print("I'm thinking of a number between 1 and 10.")

# Step 3: Start a loop to keep asking until they guess correctly
attempts = 6
guessed = 0

def guess():
    x = int(input("Give me ur guess!!!"))
    return x

x = guess()
while x != secret_number:
    attempts -= 1
    guessed += 1

    if x > secret_number:
        print(f'too High Foo!!! Attempts Lefts {attempts}:')
    elif x < secret_number:
        print(f"Too low... Crashing!!! Attempts Lefts: {attempts}:")
    if attempts == 0:
        print("You Suck.... u r a Failure.....")
        break
    x = guess()
if x == secret_number:
    print(f"You got it Right in this many {guessed} tries")
