from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
import subprocess
import requests
import os
from multiversx_sdk import Address
import shutil


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DEVNET_API = "https://devnet-api.multiversx.com"
PEM_PATH = "../new_wallet.pem"  # Default PEM path
CHAIN_ID = "D"

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

def extract_wallet_address(pem_path):
    """Extrage adresa din fișierul PEM."""
    try:
        with open(pem_path, 'r') as file:
            data = file.read()
            lines = data.splitlines()
            for line in lines:
                if "for erd1" in line:
                    address = line.split("for ")[1].strip()
                    # Elimină orice caractere nedorite (precum '-----')
                    clean_address = address.replace("-----", "").strip()
                    return clean_address
    except Exception as e:
        print(f"Eroare la extragerea adresei din PEM: {e}")
        return None

@app.route("/api/connect-wallet", methods=["POST"])
def connect_wallet():
    try:
        print("Cerere primită pentru conectarea wallet-ului.")
        pem_content = request.json.get("pem")
        if not pem_content:
            print("Eroare: Fișierul PEM este gol.")
            return jsonify({"status": "error", "message": "Fișierul .pem este gol."}), 400

        # Salvează fișierul PEM
        pem_path = "uploaded_wallet.pem"
        with open(pem_path, "w") as pem_file:
            pem_file.write(pem_content)
        print(f"Fișierul PEM salvat la: {pem_path}")

        # Extrage adresa din PEM
        wallet_address = extract_wallet_address(pem_path)
        if not wallet_address:
            print("Eroare la extragerea adresei din PEM.")
            return jsonify({"status": "error", "message": "Eroare la preluarea adresei wallet-ului."}), 500
        print(f"Adresa wallet-ului extrasă: {wallet_address}")

        return jsonify({"status": "success", "walletAddress": wallet_address})
    except Exception as e:
        print(f"Eroare internă în connect_wallet: {e}")
        return jsonify({"status": "error", "message": f"Eroare internă: {e}"}), 500



    # Hardcode pentru identificatorul colecției și roluri
    collection_identifier = "47414d454b592d363836346339"  # GAMEKY-6864c9 în hex
    create_role = "45534454526f6c654e4654437265617465"  # Rol de creare NFT
    update_role = "45534454526f6c654e465455706461746541747472696275746573"  # Rol de update atribute
    burn_role = "45534454526f6c654e46544275726e"

    # Rulează comanda pentru atribuirea rolurilor
    try:
        command = [
            "mxpy", "tx", "new",
            "--receiver", "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
            "--pem", PEM_PATH,
            "--gas-limit", "60000000",
            "--data", f"setSpecialRole@{collection_identifier}@{wallet_hex}@{create_role}@{update_role}",
            "--recall-nonce",
            "--proxy", "https://devnet-gateway.multiversx.com",
            "--chain", "D",
            "--send"
        ]
        subprocess.run(command, check=True)
        role_status = "Roluri atribuite cu succes."
    except subprocess.CalledProcessError as e:
        role_status = f"Eroare la atribuirea rolurilor: {e.stderr}"

    return jsonify({"status": "success", "message": "Wallet conectat cu succes.", "walletAddress": wallet_address, "roleStatus": role_status})

@app.route("/api/verify-nft", methods=["GET"])
def verify_nft():
    wallet = request.args.get("wallet")
    if not wallet:
        return jsonify({"error": "Parametrul 'wallet' este necesar"}), 400

    url = f"{DEVNET_API}/accounts/{wallet}/nfts"
    response = requests.get(url)
    if response.status_code != 200:
        return jsonify({"error": "Eroare la obținerea NFT-urilor"}), 500

    nfts = response.json()
    print(f"NFT-uri obținute pentru {wallet}: {nfts}")  # Logăm NFT-urile pentru debugging

    if not nfts:
        return jsonify({"exists": False, "message": "Nu există NFT-uri asociate acestui wallet."})

    return jsonify({"exists": True, "nfts": nfts})



@app.route("/api/create-nft", methods=["POST"])
def create_nft():
    wallet = request.json.get("wallet")
    nft_type = request.json.get("type").lower()

    print(f"Adresa wallet: {wallet}")  # Debugging pentru wallet
    print(f"Tip NFT: {nft_type}")  # Debugging pentru tipul de NFT

    if not wallet or not nft_type:
        return jsonify({"status": "error", "message": "Datele wallet sau tipul NFT lipsesc."}), 400
    
    if nft_type not in ["piatra", "foarfeca", "hartie"]:
        return jsonify({"status": "error", "message": "Tipul NFT este invalid."}), 400

    # Setează URI-ul imaginii corespunzător tipului de NFT
    uris = {
        "piatra": "https://thumbs.dreamstime.com/b/morm%C3%A2nt-de-desene-animate-gol-vechi-cu-piatr%C4%83-funerar%C4%83-pentru-izolarea-%C3%AEngropat%C4%83-pe-fond-alb-164082087.jpg",
        "foarfeca": "https://st.depositphotos.com/1037178/2980/v/950/depositphotos_29805739-stock-illustration-crossed-swords-vector-cartoon-illustration.jpg",
        "hartie": "https://previews.123rf.com/images/ylivdesign/ylivdesign1610/ylivdesign161002276/63780877-diploma-icon-cartoon-illustration-of-diploma-vector-icon-for-web.jpg"
    }

    # Setează numele NFT și atributele
    nft_name = f"{nft_type.capitalize()}-{wallet}"
    nft_attributes = f"type:{nft_type};score:0"
    uri = uris[nft_type]

    # Comandă pentru crearea NFT-ului
    cmd = [
        "mxpy", "tx", "new",
        "--receiver", wallet,
        "--pem", PEM_PATH,
        "--gas-limit", "5000000",
        "--data", f"ESDTNFTCreate@47414d454b592d363836346339@01@{nft_name.encode('utf-8').hex()}@0190@@{nft_attributes.encode('utf-8').hex()}@{uri.encode('utf-8').hex()}",
        "--recall-nonce",
        "--proxy", "https://devnet-gateway.multiversx.com",
        "--chain", "D",
        "--send"
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Comanda executată cu succes: {result.stdout}")
        return jsonify({"status": "success", "message": f"NFT {nft_name} creat cu succes.", "output": result.stdout})
    except subprocess.CalledProcessError as e:
        print(f"Eroare la crearea NFT-ului: {e.stderr}")
        return jsonify({"status": "error", "message": "Eroare la crearea NFT-ului.", "details": e.stderr}), 500

@app.route("/api/get-nft-scores", methods=["GET"])
def get_nft_scores():
    wallet = request.args.get("wallet")
    if not wallet:
        return jsonify({"status": "error", "message": "Wallet-ul este necesar."}), 400

    url = f"{DEVNET_API}/accounts/{wallet}/nfts"
    response = requests.get(url)
    if response.status_code != 200:
        return jsonify({"status": "error", "message": "Eroare la obținerea NFT-urilor."}), 500

    nfts = response.json()
    scores = {"piatra": 0, "foarfeca": 0, "hartie": 0}

    for nft in nfts:
        name = nft.get("name", "").lower()
        attributes = nft.get("attributes", "")

        # Filtrăm doar NFT-urile de interes
        if name.startswith("piatra-") or name.startswith("foarfeca-") or name.startswith("hartie-"):
            try:
                # Decodare Base64 a atributelor
                decoded_attributes = base64.b64decode(attributes).decode("utf-8")
                for attr in decoded_attributes.split(";"):
                    key, value = attr.split(":")
                    if key == "type" and value.lower() in scores:
                        nft_type = value.lower()
                    if key == "score":
                        scores[nft_type] = int(value)
            except Exception as e:
                print(f"Eroare la decodarea atributelor: {attributes} - {e}")

    return jsonify({"status": "success", "scores": scores})


@app.route("/api/update-nft-score", methods=["POST"])
def update_nft_score():
    data = request.json
    wallet = data.get("wallet")
    nft_type = data.get("type").lower()
    score = data.get("score")
    if not wallet or not nft_type or score is None:
        return jsonify({"status": "error", "message": "Datele sunt incomplete."}), 400

    # Găsește NFT-ul specific și extrage nonce
    url = f"{DEVNET_API}/accounts/{wallet}/nfts"
    response = requests.get(url)
    if response.status_code != 200:
        return jsonify({"status": "error", "message": "Eroare la obținerea NFT-urilor."}), 500

    nfts = response.json()
    nonce = None
    for nft in nfts:
        if nft.get("name", "").lower() == f"{nft_type}-{wallet}".lower():
            nonce = nft.get("nonce")
            break

    if nonce is None:
        return jsonify({"status": "error", "message": f"NFT-ul {nft_type} nu a fost găsit."}), 404

    # Pregătește datele de update
    collection_identifier = "47414d454b592d363836346339"  # KYSGAME-6864c9 în hex
    attributes = f"type:{nft_type};score:{score}"
    cmd = [
        "mxpy", "tx", "new",
        "--receiver", wallet,
        "--pem", PEM_PATH,
        "--gas-limit", "10000000",
        "--data", f"ESDTNFTUpdateAttributes@{collection_identifier}@{nonce:02x}@{attributes.encode('utf-8').hex()}",
        "--recall-nonce",
        "--proxy", "https://devnet-gateway.multiversx.com",
        "--chain", "D",
        "--send"
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return jsonify({"status": "success", "message": f"Scorul pentru {nft_type} actualizat cu succes."})
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": "Eroare la actualizarea scorului.", "details": e.stderr}), 500

    
if __name__ == "__main__":
    app.run(debug=True)
