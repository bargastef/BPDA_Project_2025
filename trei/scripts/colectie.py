import subprocess

def create_collection(wallet_address, collection_name):
    # Convertim numele colecției și ticker-ul în hex
    name_hex = collection_name.encode("utf-8").hex()  # Exemplu: "KYSGAME"
    ticker_hex = collection_name[:4].encode("utf-8").hex()  # Exemplu: "KYS"
    
    # Comanda pentru a emite colecția (NFT-ul)
    cmd = [
        "mxpy", "contract", "call",
        "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",  # Adresa contractului pentru emiterea NFT
        "--pem", "./new_wallet.pem",  # Calea către fișierul PEM pentru wallet
        "--proxy", "https://devnet-api.multiversx.com",  # Proxy pentru devnet
        "--chain", "D",  # Devnet
        "--recall-nonce",  # Încearcă să recall nonce-ul pentru a evita conflictele
        "--gas-limit", "60000000",  # Gas limit pentru tranzacție
        "--value", "50000000000000000",  # Cantitatea de EGLD
        "--function", "issueNonFungible",  # Funcția de emitere NFT
        "--arguments", f"0x{name_hex} 0x{ticker_hex}",  # Parametrii hex pentru nume și ticker
        "--send"  # Trimite tranzacția
    ]
    subprocess.run(cmd)
    print(f"Colecția '{collection_name}' a fost creată.")

# Exemplu de creare a colecției KYSGAME
create_collection("erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5", "KYSGAME")
