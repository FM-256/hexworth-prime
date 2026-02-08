import random

def play_game():
    # BONUS: Let the user choose the maximum range for guessing.
    while True:
        try:
            user_input = input("Enter the maximum number for the guessing range (press Enter for default 100): ").strip()
            max_range = int(user_input) if user_input else 100
            if max_range < 1:
                print("Please enter a positive number greater than 0.")
                continue
            break
        except ValueError:
            print("Invalid input. Please enter a valid whole number.")
    
    # Step 1: Secret number is randomly chosen between 1 and max_range
    secret_number = random.randint(1, max_range)
    print(f"\nI'm thinking of a number between 1 and {max_range}.")
    
    attempts = 0
    guess = None
    
    # Step 3: Loop until the guess matches the secret number
    while guess != secret_number:
        try:
            guess = int(input("Take a guess: "))
        except ValueError:
            print("Invalid input. Please enter an integer.")
            continue
        
        attempts += 1
        
        if guess > secret_number:
            print("Too high!")
        elif guess < secret_number:
            print("Too low!")
    
    print(f"Correct! You guessed the number in {attempts} attempt{'s' if attempts > 1 else ''}.\n")

# Main loop to offer replay after winning
while True:
    play_game()
    again = input("Do you want to play again? (y/n): ").strip().lower()
    if again not in ("y", "yes"):
        print("Thanks for playing!")
        break
