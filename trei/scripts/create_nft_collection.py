import subprocess
import os
from dotenv import load_dotenv

# Încarcă variabilele din fișierul .env
load_dotenv()
PEM_PATH = os.getenv("PEM_PATH")
PROXY = os.getenv("PROXY_URL")
CHAIN_ID = os.getenv("CHAIN_ID")

def create_nft_collection():
    # Hexadecimal pentru nume și ticker
    collection_name_hex = "0x4a4f432d4e4654"  # JOC-NFT
    collection_ticker_hex = "0x4a4f43"        # JOC

    print("[INFO] Sending request to create NFT collection...")
    cmd = [
        "mxpy", "contract", "call", "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
        "--pem", PEM_PATH,
        "--proxy", PROXY,
        "--chain", CHAIN_ID,
        "--recall-nonce",
        "--gas-limit", "60000000",
        "--value", "50000000000000000",  # 0.05 EGLD
        "--function", "issueNonFungible",
        "--arguments", collection_name_hex, collection_ticker_hex,
        "--send"
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("[ERROR] Failed to create NFT collection:", result.stderr)
    else:
        print("[SUCCESS] NFT collection created:", result.stdout)

if __name__ == "__main__":
    create_nft_collection()
