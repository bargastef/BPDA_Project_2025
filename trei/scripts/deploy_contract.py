import requests

# Configurații
WASM_FILE = "./contracts/nft/output/nft.wasm"
PEM_FILE = "new_wallet.pem"
PROXY = "https://devnet-gateway.multiversx.com"
CHAIN_ID = "D"

def deploy_contract(wasm_file, pem_file, proxy):
    url = f"{proxy}/transaction/send"
    headers = {"Content-Type": "application/json"}
    payload = {
        "wasm": wasm_file,
        "pem": pem_file,
        "gasLimit": 60000000,
        "chainID": CHAIN_ID
    }
    response = requests.post(url, headers=headers, json=payload)
    print("[RESPONSE]:", response.json())

deploy_contract(WASM_FILE, PEM_FILE, PROXY)
