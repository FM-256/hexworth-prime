# Code Decode Lab - Starter File
# Follow-along hands-on lab to learn encoding and decoding in Python

# --- Step 1: Create your multilingual word list ---
words = [
    # Example: "Café", "こんにちは", "مرحبا", "שלום"
]

print("Multilingual Words:")
for word in words:
    print("-", word)

# --- Step 2: Write a function to encode a word ---
def encode_word(word, encoding="utf-8"):
    # TODO: Convert the word to bytes using the specified encoding
    pass

# --- Step 3: Write a function to decode bytes ---
def decode_word(byte_data, encoding="utf-8", errors="strict"):
    # TODO: Convert bytes back to a string using the specified encoding
    pass

# --- Step 4: Try encoding and decoding one of your words ---
test_word = ""
# TODO: Use your encode_word and decode_word functions here
# print("Original:", test_word)
# print("Encoded:", encoded)
# print("Decoded:", decoded)

# --- BONUS: Build an interactive menu for Encode/Decode (Optional) ---
# def code_decode_menu():
#     # TODO: Prompt user for input and show encoded/decoded results
#     pass