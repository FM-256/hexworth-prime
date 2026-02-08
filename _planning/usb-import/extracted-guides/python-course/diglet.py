# Number Guessing Game - Play Again Feature Added
# Practice with input, loops, conditionals, and feedback

import random

play_again = "yes"

while play_again.lower() in ["yes", "y"]:
    # Step 1: Secret number is randomly chosen between 1 and 10
    secret_number = random.randint(1, 10)

    # Step 2: Ask the user to guess the number
    print("\nI'm thinking of a number between 1 and 10.")

    # Step 3: Start a loop to keep asking until they guess correctly
    guess = 0  # Initial guess value

    while guess != secret_number:
        guess = int(input("Take a guess: "))

        if guess > secret_number:
            print("Too high!")
        elif guess < secret_number:
            print("Too low!")
        else:
            print("Correct! You guessed the number.")
    
    # Ask if they want to play again immediately after a correct guess
    play_again = input("Do you want to play again? (yes/no): ")

print("Thank you for playing - Love Bean!")