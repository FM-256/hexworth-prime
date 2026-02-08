# encoding_module.py

def save_message(msg, filename, encoding="utf-8"):
    """
    Encodes a Unicode string into bytes and writes it to a file.

    Parameters:
        msg (str): The message to encode and save.
        filename (str): Name of the file to write to.
        encoding (str): Character encoding (default is 'utf-8').
    """
    encoded = msg.encode(encoding)
    with open(filename, "wb") as f:
        f.write(encoded)

def load_message(filename, encoding="utf-8"):
    """
    Reads bytes from a file and decodes them back into a string.

    Parameters:
        filename (str): Name of the file to read from.
        encoding (str): Character encoding used for decoding (default is 'utf-8').

    Returns:
        str: The decoded Unicode string.
    """
    with open(filename, "rb") as f:
        byte_data = f.read()
    return byte_data.decode(encoding)


# Example usage
def example():
    msg = "Café – Привет – こんにちは – مرحبا – שלום"
    file = "greeting_data.bin"

    save_message(msg, file)
    restored = load_message(file)

    print("Restored message:", restored)


if __name__ == "__main__":
    example()
