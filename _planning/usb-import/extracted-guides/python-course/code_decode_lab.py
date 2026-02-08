# Code Decode Lab - Starter File
# Follow-along hands-on lab to learn encoding and decoding in Python

# --- PART 1: Multilingual Word List ---
words = [
    "Café",       # French
    "Привет",      # Russian
    "こんにちは",     # Japanese
    "مرحبا",        # Arabic
    "שלום",         # Hebrew
    "नमस्ते",        # Hindi
    "안녕하세요"       # Korean
]

print("Multilingual Words:")
for word in words:
    print("-", word)

# --- PART 2: Basic Encode/Decode ---
def encode_word(word, encoding="utf-8"):
    return word.encode(encoding)

def decode_word(byte_data, encoding="utf-8", errors="strict"):
    return byte_data.decode(encoding, errors=errors)

# Test the basic functions
print("\nTesting encoding/decoding:")
test_word = "こんにちは"
encoded = encode_word(test_word)
print("Encoded:", encoded)
decoded = decode_word(encoded)
print("Decoded:", decoded)

# --- PART 3: Interactive Menu ---
def code_decode_menu():
    print("\nCode Decode Utility")
    print("1. Encode a word")
    print("2. Decode a byte string")
    choice = input("Choose an option (1 or 2): ")

    if choice == "1":
        word = input("Enter a word to encode: ")
        encoding = input("Encoding (default utf-8): ") or "utf-8"
        print("Encoded:", encode_word(word, encoding))

    elif choice == "2":
        raw = input("Enter byte string (e.g., b'hello'): ")
        encoding = input("Encoding (default utf-8): ") or "utf-8"
        errors = input("Error handling (strict/ignore/replace): ") or "strict"
        try:
            byte_data = eval(raw)
            print("Decoded:", decode_word(byte_data, encoding, errors))
        except Exception as e:
            print("Error:", e)

# Run menu
# Uncomment the line below to test the menu live:
# code_decode_menu()

# --- CHALLENGE 1: Allow different encodings ---
# Already supported via user input in menu

# --- CHALLENGE 2: Handle decode errors ---
# Already supported with the 'errors' parameter

# --- CHALLENGE 3: Save/load encoded words to file ---
def save_encoded_to_file(word, filename, encoding="utf-8"):
    with open(filename, "wb") as f:
        f.write(encode_word(word, encoding))

def load_and_decode_from_file(filename, encoding="utf-8"):
    with open(filename, "rb") as f:
        return decode_word(f.read(), encoding)

# --- CHALLENGE 4: Batch encode/decode words ---
def batch_encode_decode(word_list, encoding="utf-8"):
    print("\nBatch Encode/Decode:")
    for word in word_list:
        encoded = encode_word(word, encoding)
        decoded = decode_word(encoded, encoding)
        print(f"{word} -> {encoded} -> {decoded}")
