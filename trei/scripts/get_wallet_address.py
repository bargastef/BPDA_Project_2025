# import requests

# def get_nft_names(wallet_address):
#     # Înlocuiește cu adresa completă a API-ului
#     url = f"https://devnet-api.multiversx.com/accounts/{wallet_address}/nfts"
#     response = requests.get(url)
    
#     if response.status_code == 200:
#         nfts = response.json()
#         nft_names = [nft['name'] for nft in nfts]
#         return nft_names
#     else:
#         print(f"Eroare la preluarea NFT-urilor: {response.status_code}")
#         return None

# wallet_address = "erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5"  # Înlocuiește cu adresa corectă
# nft_names = get_nft_names(wallet_address)

# if nft_names:
#     print("NFT-uri găsite:")
#     for name in nft_names:
#         print(name)
# else:
#     print("Nu s-au găsit NFT-uri pentru acest wallet.")

import requests

DEVNET_API = "https://devnet-api.multiversx.com"

def get_collections(wallet_address):
    url = f"{DEVNET_API}/accounts/{wallet_address}/nfts"
    response = requests.get(url)
    
    if response.status_code == 200:
        nfts = response.json()
        collections = set()
        
        # Adaugă colecțiile în set pentru a elimina duplicatele
        for nft in nfts:
            collections.add(nft["collection"])
        
        return collections
    else:
        print(f"Eroare la obținerea NFT-urilor: {response.status_code}")
        return []

# Exemplu de utilizare
wallet_address = "erd1krqzqa9xw6naxpa3grwm4qeggp6d7hx26js5teslu4fx9fx6pr7qha3ep5"
collections = get_collections(wallet_address)

if collections:
    print(f"Colecțiile găsite pe wallet-ul {wallet_address}:")
    for collection in collections:
        print(f"- {collection}")
else:
    print(f"Nu s-au găsit colecții pe wallet-ul {wallet_address}.")

