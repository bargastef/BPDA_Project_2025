import requests
import base64

# Configurare
WALLET_ADDRESS = "erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5"
NFT_TYPES = ["Piatra", "Foarfeca", "Hartie"]  # Tipurile de NFT-uri
API_URL = f"https://devnet-api.multiversx.com/accounts/{WALLET_ADDRESS}/nfts"

def decode_attributes(attributes_raw):
    """Decodează atributele NFT din format Base64."""
    try:
        decoded_bytes = base64.b64decode(attributes_raw)
        decoded_attributes = decoded_bytes.decode("utf-8")
        return decoded_attributes
    except Exception as e:
        print(f"Eroare la decodarea atributelor: {attributes_raw} - {e}")
        return None

def fetch_nfts():
    """Caută și afișează detaliile NFT-urilor pentru fiecare tip specificat."""
    print(f"Fetching NFT data from: {API_URL}")
    response = requests.get(API_URL)

    if response.status_code != 200:
        print(f"Eroare la conectarea cu API-ul: {response.status_code} - {response.text}")
        return

    nfts = response.json()
    for nft_type in NFT_TYPES:
        found = False
        for nft in nfts:
            nft_name = nft.get("name", "Necunoscut")
            if nft_name.startswith(f"{nft_type}-{WALLET_ADDRESS}"):
                found = True
                print(f"\nNFT găsit: {nft_name}")
                attributes_raw = nft.get("attributes", "")
                decoded_attributes = decode_attributes(attributes_raw)
                print(f"Atribute decodate: {decoded_attributes}")
        if not found:
            print(f"\nNu s-a găsit niciun NFT pentru tipul: {nft_type}")

if __name__ == "__main__":
    fetch_nfts()
