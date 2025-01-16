import requests
import base64

# Wallet address și API-ul devnet
WALLET_ADDRESS = "erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5"
API_URL = f"https://devnet-api.multiversx.com/accounts/{WALLET_ADDRESS}/nfts"

# Tipurile relevante de NFT
RELEVANT_TYPES = ["piatra", "foarfeca", "hartie"]

def decode_attributes(attributes_raw):
    """Decodează atributele NFT din format Base64."""
    try:
        decoded_bytes = base64.b64decode(attributes_raw)
        decoded_attributes = decoded_bytes.decode("utf-8")
        return decoded_attributes
    except Exception as e:
        print(f"Eroare la decodarea atributelor: {attributes_raw} - {e}")
        return None

def fetch_and_check_nft_scores():
    """Preia NFT-urile și verifică scorurile pentru cele relevante."""
    print(f"Fetching NFT data from: {API_URL}")
    response = requests.get(API_URL)

    if response.status_code != 200:
        print(f"Eroare la conectarea cu API-ul: {response.status_code} - {response.text}")
        return

    nfts = response.json()
    print(f"Număr de NFT-uri găsite: {len(nfts)}")

    for nft in nfts:
        attributes_raw = nft.get("attributes", "")
        nft_name = nft.get("name", "Necunoscut")

        # Decodează atributele
        decoded_attributes = decode_attributes(attributes_raw)

        if not decoded_attributes:
            print(f"NFT '{nft_name}' nu are atribute decodabile. Sărim peste.")
            continue

        # Verifică dacă NFT-ul este unul dintre cele relevante
        if any(nft_name.lower().startswith(tip) for tip in RELEVANT_TYPES):
            print(f"NFT relevant găsit: {nft_name}")
            print(f"Atribute decodate: {decoded_attributes}")

            # Extrage scorul
            attributes_dict = dict(item.split(":") for item in decoded_attributes.split(";") if ":" in item)
            nft_type = attributes_dict.get("type", "Necunoscut")
            score = attributes_dict.get("score", "0")

            print(f"Tip: {nft_type}, Scor: {score}")
        else:
            print(f"NFT '{nft_name}' nu este relevant.")

if __name__ == "__main__":
    fetch_and_check_nft_scores()
