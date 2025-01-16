from multiversx_sdk import Address

def test_wallet_address(wallet_address):
    """Testarea adresei wallet-ului pentru a vedea ce returnează."""
    try:
        # Crează un obiect Address folosind adresa Bech32
        address = Address.from_bech32(wallet_address)

        # Afișează adresa în format Hexadec
        print(address.hex())

        # Verifică dacă este validă
        if address.is_valid():
            print("Adresa este validă.")
        else:
            print("Adresa nu este validă.")
    
    except Exception as e:
        print(f"Eroare la procesarea adresei: {e}")

# Înlocuiește această adresă cu adresa wallet-ului tău Bech32
wallet_address = "erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5"
test_wallet_address(wallet_address)
