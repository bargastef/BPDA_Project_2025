import subprocess
import requests
import base64

# Configurare
API_URL = "https://devnet-api.multiversx.com/accounts"
WALLET_ADDRESS = "erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5"
NFT_TYPE = "Piatra"  # Poate fi piatra, foarfeca, hartie
NEW_SCORE = 8  # Scorul cu care vrei să actualizezi
COLLECTION_IDENTIFIER = "47414d454b592d363836346339"  # ID-ul colecției

def get_nonce_and_current_score():
    """Obține nonce-ul și scorul curent pentru un NFT specific."""
    print(f"Fetching NFT data for wallet: {WALLET_ADDRESS}")
    response = requests.get(f"{API_URL}/{WALLET_ADDRESS}/nfts")
    response.raise_for_status()

    nfts = response.json()
    for nft in nfts:
        if nft["name"].startswith(f"{NFT_TYPE}-{WALLET_ADDRESS}"):
            attributes = nft.get("attributes", "")
            nonce = nft["nonce"]
            try:
                decoded_attributes = base64.b64decode(attributes).decode("utf-8")
                print(f"Atribute decodate: {decoded_attributes}")
                attr_dict = dict(item.split(":") for item in decoded_attributes.split(";"))
                current_score = int(attr_dict.get("score", 0))
                return nonce, current_score
            except Exception as e:
                print(f"Eroare la decodarea atributelor: {attributes} - {e}")
                return nonce, 0
    raise ValueError("NFT-ul specific nu a fost găsit.")

def update_nft(nonce, new_score):
    """Actualizează scorul NFT-ului."""
    attributes = f"type:{NFT_TYPE};score:{new_score}"
    command = [
        "mxpy", "tx", "new",
        "--receiver", WALLET_ADDRESS,
        "--pem", "new_wallet.pem",
        "--gas-limit", "10000000",
        "--data", f"ESDTNFTUpdateAttributes@{COLLECTION_IDENTIFIER}@{nonce:02x}@{attributes.encode('utf-8').hex()}",
        "--recall-nonce",
        "--proxy", "https://devnet-gateway.multiversx.com",
        "--chain", "D",
        "--send"
    ]
    print(f"Running command: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode == 0:
        print("Update reușit:", result.stdout)
    else:
        print("Eroare la update:", result.stderr)

if __name__ == "__main__":
    nonce, current_score = get_nonce_and_current_score()
    print(f"Nonce: {nonce}, Scor curent: {current_score}")
    update_nft(nonce, NEW_SCORE)
