# Number Guessing Game - Student Starter File
# Practice with input, loops, conditionals, and feedback
# Step 1: Secret number is randomly chosen between 1 and 100

import random
secret_number = random.randint(1,100)
# Step 2: Ask the user to guess the number
print("I'm thinking of a number between 1 and 100.")
attempts = 0

while True:
    try: 
        guess=int(input("Take a Guess:"))
        attempts +=1
    
        if guess > secret_number:
            print("Too High")
        elif guess < secret_number:
            print("Too Low")
        else:
            print(f"Correct you guessed in {attempts}attempts")
            break
    except ValueError:
        print("Invalid input. Try again")

play_again=input("Do You want to play again? (yes/no):").lower()
if play_again =="yes":
     print("Restart the script to play again!")
else:
     print("Thanks for Playing")

# Step 3: Start a loop to keep asking until they guess correctly
# TODO: Use a while loop
# TODO: Convert input to an integer with int()
# TODO: Give hints if the guess is too high or too low

# Example logic to complete:
# while guess != secret_number:
#     if guess > secret_number:
#         print("Too high!")
#     elif guess < secret_number:
#         print("Too low!")
#     else:
#         print("Correct!")

# BONUS CHALLENGES:
# - Count the number of attempts
# - Let the user choose the max range (e.g. 1–50 or 1–100)
# - Offer to play again after winning
