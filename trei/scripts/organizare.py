import requests
import base64
import json

# Adresa API și wallet-ul utilizatorului
DEVNET_API = "https://devnet-api.multiversx.com"
wallet_address = "erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5"

# Endpoint-ul pentru NFT-uri
url = f"{DEVNET_API}/accounts/{wallet_address}/nfts"

# Obține răspunsul
response = requests.get(url)

if response.status_code == 200:
    nfts = response.json()
    for nft in nfts:
        identifier = nft.get("identifier")
        collection = nft.get("collection")
        name = nft.get("name")
        attributes_base64 = nft.get("attributes", "")
        attributes_decoded = base64.b64decode(attributes_base64).decode() if attributes_base64 else "N/A"
        royalties = nft.get("royalties")
        uris = nft.get("uris", [])
        uris_decoded = [base64.b64decode(uri).decode() for uri in uris]
        
        print(f"NFT Identifier: {identifier}")
        print(f"  Collection: {collection}")
        print(f"  Name: {name}")
        print(f"  Attributes: {attributes_decoded}")
        print(f"  Royalties: {royalties / 100:.2f}%")
        print(f"  URIs: {', '.join(uris_decoded)}")
        print("-" * 40)
else:
    print("Eroare la obținerea NFT-urilor:", response.status_code)
