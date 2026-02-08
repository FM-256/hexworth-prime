import random

def play_game():
    # Step 1: Ask user for range
    max_range = int(input("Enter the maximum number for the range (e.g., 10, 50, or 100): "))
    secret_number = random.randint(1, max_range)

    print(f"I'm thinking of a number between 1 and {max_range}. Can you guess what it is?")
    
    # Initialize variables
    guess = None
    attempts = 0

    # Step 2: Start the guessing loop
    while guess != secret_number:
        try:
            guess = int(input("Take a guess: "))  # Convert input to integer
            attempts += 1  # Increment attempts count

            if guess > secret_number:
                print("Too high!")
            elif guess < secret_number:
                print("Too low!")
            else:
                print(f"Correct! You guessed it in {attempts} attempts.")
        except ValueError:
            print("Please enter a valid number.")

# Step 3: Let the user play again
while True:
    play_game()
    play_again = input("Do you want to play again? (yes/no): ").lower()
    if play_again != "yes":
        print("Thanks for playing! Goodbye!")
        break