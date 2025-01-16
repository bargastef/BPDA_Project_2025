#!/usr/bin/env python3

import requests
import subprocess
import json
import base64
import os
import sys

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

PEM_PATH = os.getenv("PEM_PATH")
WALLET_ADDRESS = os.getenv("WALLET_ADDRESS")
PROXY_URL = os.getenv("PROXY_URL")
CHAIN_ID = os.getenv("CHAIN_ID")
WASM_FILE = "./output/nft.wasm"
CONTRACT_FN = "checkNfts"


def run_cmd(cmd_list):
    print(f"[CMD] {' '.join(cmd_list)}")
    result = subprocess.run(cmd_list, capture_output=True, text=True)
    print("[STDOUT]:", result.stdout)
    print("[STDERR]:", result.stderr)
    print("[RETURN CODE]:", result.returncode)
    return result.stdout, result.stderr, result.returncode


def deploy_contract():
    print("=== Deploy contract on Devnet ===")
    cmd = [
        "mxpy", "contract", "deploy",
        "--bytecode", WASM_FILE,
        "--recall-nonce",
        "--pem", PEM_PATH,
        "--gas-limit", "60000000",
        "--proxy", PROXY_URL,
        "--chain", CHAIN_ID,
        "--send",
        "--outfile", "deploy.json",
    ]
    stdout, stderr, code = run_cmd(cmd)
    if code != 0:
        print("[ERROR] Deploy failed:", stderr)
        sys.exit(1)

    print("[Deploy output]:", stdout)
    if not os.path.exists("deploy.json"):
        print("[ERROR] No deploy.json found")
        sys.exit(1)

    with open("deploy.json", "r") as f:
        data = json.load(f)
    contract_address = data.get("contractAddress")
    if not contract_address:
        print("[ERROR] contractAddress not found in deploy.json")
        sys.exit(1)

    print(f"[OK] Deployed at: {contract_address}\n")
    return contract_address


def get_nfts_for_wallet(wallet: str) -> list[str]:
    url = f"{PROXY_URL}/accounts/{wallet}/nfts"
    print(f"[GET] Fetching NFTs for wallet: {wallet}")
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    print("[NFT API Response]:", data)
    nft_names = [item.get("name", "") for item in data]
    return nft_names


def call_check_nfts(contract_addr: str, nft_names: list[str]) -> str:
    print("=== Call 'checkNfts' with these names:", nft_names)
    args = [str(len(nft_names))] + [("str:" + nm) for nm in nft_names]

    cmd = [
        "mxpy", "contract", "call",
        contract_addr,
        "--function", CONTRACT_FN,
        "--gas-limit", "60000000",
        "--pem", PEM_PATH,
        "--proxy", PROXY_URL,
        "--chain", CHAIN_ID,
        "--recall-nonce",
        "--send",
        "--outfile", "call.json",
        "--arguments",
    ] + args

    stdout, stderr, code = run_cmd(cmd)
    if code != 0:
        print("[ERROR] Call failed:", stderr)
        return ""

    if not os.path.exists("call.json"):
        print("[WARN] No call.json found")
        return ""

    with open("call.json", "r") as f:
        call_result = json.load(f)

    print("[Call Result JSON]:", call_result)
    return call_result.get("emittedTransactionHash")


def fetch_results(tx_hash: str):
    if not tx_hash:
        print("[WARN] No transaction hash to fetch results.")
        return

    print(f"=== Fetch return data for txHash: {tx_hash} ===")
    url = f"{PROXY_URL}/transaction/{tx_hash}?withResults=true"
    response = requests.get(url)
    if response.status_code != 200:
        print("[ERROR] Failed to fetch transaction data")
        return

    data = response.json()
    print("[Transaction Data]:", json.dumps(data, indent=4))
    return data


def main():
    print("=== Starting Full Flow ===")
    contract_address = deploy_contract()
    nft_names = get_nfts_for_wallet(WALLET_ADDRESS)
    print("NFTs:", nft_names)

    tx_hash = call_check_nfts(contract_address, nft_names)
    fetch_results(tx_hash)


if __name__ == "__main__":
    main()
