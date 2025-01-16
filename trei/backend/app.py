from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import requests
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ===================== CONFIGURARI =====================
DEVNET_API = "https://devnet-api.multiversx.com"
PEM_PATH = "../new_wallet.pem"  # Fisierul tau PEM
CHAIN_ID = "D"

# Colecția voastră NFT pe devnet, ex. "GAMEKY-6864c9" => hex: "47414d454b592d363836346339"
COLLECTION_HEX = "47414d454b592d363836346339"

# ===================== UTILS =====================
def extract_wallet_address(pem_path):
    """Extragerea adresei (erd1...) din fișierul PEM."""
    try:
        with open(pem_path, 'r') as file:
            data = file.read()
            lines = data.splitlines()
            for line in lines:
                if "for erd1" in line:
                    address = line.split("for ")[1].strip()
                    address = address.replace("-----", "").strip()
                    return address
    except Exception as e:
        print(f"Eroare la extragerea adresei din PEM: {e}")
    return None

def serve_file(filename):
    return send_from_directory('.', filename)

@app.route('/<path:filename>')
def serve_static(filename):
    """Servește fișiere statice dacă ai nevoie."""
    return serve_file(filename)

# ===================== 1) CONNECT WALLET =====================
@app.route("/api/connect-wallet", methods=["POST"])
def connect_wallet():
    """
    Prinde fișierul PEM din request, îl salvează local ca uploaded_wallet.pem
    și extrage adresa wallet-ului.
    """
    try:
        pem_content = request.json.get("pem")
        if not pem_content:
            return jsonify({"status": "error", "message": "Fișierul .pem este gol."}), 400

        # Salvăm PEM local
        pem_path = "uploaded_wallet.pem"
        with open(pem_path, "w") as f:
            f.write(pem_content)

        # Extragere address
        wallet_address = extract_wallet_address(pem_path)
        if not wallet_address:
            return jsonify({"status": "error", "message": "Nu pot extrage adresa din PEM"}), 500

        return jsonify({"status": "success", "walletAddress": wallet_address})

    except Exception as e:
        print(f"Eroare la connect_wallet: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ===================== 2) VERIFICARE NFT-uri =====================
@app.route("/api/verify-nft", methods=["GET"])
def verify_nft():
    """
    Returnează NFT-urile deținute de un wallet (pe devnet).
    GET /api/verify-nft?wallet=erd1...
    """
    wallet = request.args.get("wallet")
    if not wallet:
        return jsonify({"error": "Parametrul 'wallet' este necesar"}), 400

    url = f"{DEVNET_API}/accounts/{wallet}/nfts"
    response = requests.get(url)
    if response.status_code != 200:
        return jsonify({"error": "Eroare la obținerea NFT-urilor"}), 500

    nfts = response.json()
    print(f"NFT-uri obținute pentru {wallet}: {nfts}")

    if not nfts:
        return jsonify({"exists": False, "message": "Nu există NFT-uri asociate acestui wallet."})

    return jsonify({"exists": True, "nfts": nfts})

# ===================== 3) CREATE NFT  =====================
@app.route("/api/create-nft", methods=["POST"])
def create_nft():
    """
    Body JSON: { "wallet": "erd1....", "type": "foarfeca" }
    Creează un NFT cu metadata "#nftgame;type:...,score:0;win:0" + imagine raw github.
    """
    data = request.json
    wallet = data.get("wallet")
    nft_type = data.get("type", "").lower()

    print(f"Adresa wallet: {wallet}")
    print(f"Tip NFT: {nft_type}")

    if not wallet or not nft_type:
        return jsonify({"status": "error", "message": "Datele wallet sau tipul NFT lipsesc."}), 400
    
    # Tipurile acceptate
    allowed_types = ["piatra", "foarfeca", "hartie"]
    if nft_type not in allowed_types:
        return jsonify({"status": "error", "message": f"Tipul {nft_type} nu este valid."}), 400

    # Link-urile la imagini
    uris = {
        "foarfeca": "https://raw.githubusercontent.com/bargastef/BPDA_Project_2025/main/nft-game/public/assets/images/scissors.png",
        "hartie":   "https://raw.githubusercontent.com/bargastef/BPDA_Project_2025/main/nft-game/public/assets/images/paper.png",
        "piatra":   "https://raw.githubusercontent.com/bargastef/BPDA_Project_2025/main/nft-game/public/assets/images/rock.png"
    }

    # Metadata: "#nftgame;type:foarfeca;score:0;win:0"
    nft_attributes = f"#nftgame;type:{nft_type};score:0;win:0"
    nft_name = f"{nft_type.capitalize()}-{wallet}"
    uri = uris[nft_type]

    nft_name_hex = nft_name.encode('utf-8').hex()
    attributes_hex = nft_attributes.encode('utf-8').hex()
    uri_hex = uri.encode('utf-8').hex()

    cmd = [
        "mxpy", "tx", "new",
        "--receiver", wallet,
        "--pem", PEM_PATH,
        "--gas-limit", "5000000",
        "--data", (
            f"ESDTNFTCreate@{COLLECTION_HEX}"
            f"@01"            # Cantitate (1 NFT)
            f"@{nft_name_hex}"
            f"@0190"          # Royalties (0x0190 = 4.00%)
            f"@00"            # no hash
            f"@{attributes_hex}"
            f"@{uri_hex}"
        ),
        "--recall-nonce",
        "--proxy", "https://devnet-gateway.multiversx.com",
        "--chain", CHAIN_ID,
        "--send"
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Comanda executată cu succes:\n{result.stdout}")
        return jsonify({
            "status": "success",
            "message": f"NFT {nft_name} creat cu succes.",
            "output": result.stdout
        })
    except subprocess.CalledProcessError as e:
        print(f"Eroare la crearea NFT-ului:\n{e.stderr}")
        return jsonify({
            "status": "error",
            "message": "Eroare la crearea NFT-ului.",
            "details": e.stderr
        }), 500


# ===================== 4) SET ESDT ROLE (opțional) =====================
@app.route("/api/set-esdt-role", methods=["POST"])
def set_esdt_role():
    """
    Endpoint pentru a seta rolul ESDTNFTCreate pe colecție,
    ca wallet-ul să poată crea NFT-uri.
    Body: {"walletAddress": "erd1...", "collectionHex": "..."}
    """
    try:
        data = request.json
        wallet_addr = data.get("walletAddress")
        collection_hex = data.get("collectionHex", COLLECTION_HEX)
        if not wallet_addr:
            return jsonify({"status": "error", "message": "Lipsește walletAddress"}), 400

        # Convertim adresa la hex => se face cu "mxpy wallet bech32 --decode" 
        # Dar ca exemplu simplu, scurtcircuităm. Ai nevoie să știi hex-ul. 
        # In caz real:
        #   wallet_hex = subprocess.getoutput(f"mxpy wallet bech32 {wallet_addr} --decode")
        # Și parsezi output-ul

        # Rolurile
        create_role = "45534454526f6c654e4654437265617465"  # ESDTNFTCreate
        update_role = "45534454526f6c654e465455706461746541747472696275746573" # ESDTNFTUpdateAttributes
        burn_role   = "45534454526f6c654e46544275726e"

        # Apelează comanda setSpecialRole
        # (Ex.: setSpecialRole@<collection_hex>@<wallet_hex>@<create_role>@<update_role>)
        # Simplificăm, punem direct un hex placeholder
        wallet_hex = "0123456789ABCDEF"  # Trebuie inlocuit cu hex real

        cmd = [
            "mxpy", "tx", "new",
            "--receiver", wallet_addr,
            "--pem", PEM_PATH,
            "--gas-limit", "60000000",
            "--data", f"setSpecialRole@{collection_hex}@{wallet_hex}@{create_role}@{update_role}",
            "--recall-nonce",
            "--proxy", "https://devnet-gateway.multiversx.com",
            "--chain", CHAIN_ID,
            "--send"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("Setare rol reușită:", result.stdout)
        return jsonify({"status": "success", "message": "Roluri ESDTNFTCreate/Update setate cu succes."})

    except subprocess.CalledProcessError as e:
        print("Eroare la setarea rolului ESDT:", e.stderr)
        return jsonify({"status": "error", "message": "Eroare la setarea rolului ESDT", "details": e.stderr}), 500
    except Exception as ex:
        print("Eroare generală set-esdt-role:", ex)
        return jsonify({"status": "error", "message": str(ex)}), 500

# ===================== 5) UPDATE NFT SCORE/WIN =====================
@app.route("/api/update-nft-score", methods=["POST"])
def update_nft_score():
    """
    Body JSON: { "identifier": "GAMEKY-6864c9-01", "score": 12, "win": 5 }
    Face update la metadatele NFT pe blockchain:
    #nftgame;type:X;score:12;win:5
    """
    try:
        data = request.json
        identifier = data.get("identifier")  # ex. "GAMEKY-6864c9-01"
        new_score = data.get("score")
        new_win = data.get("win")

        if not identifier or new_score is None or new_win is None:
            return jsonify({"status": "error", "message": "Parametri insuficienți"}), 400

        # Extragem colecția și nonce din identifier
        parts = identifier.split("-")  # ["GAMEKY", "6864c9", "01"]
        if len(parts) < 3:
            return jsonify({"status": "error", "message": "Identifier NFT invalid"}), 400
        # primele două părți formează colecția "GAMEKY-6864c9", ultima e nonce
        collection_part = f"{parts[0]}-{parts[1]}" 
        nonce_hex = parts[2]  # "01" (hex direct)

        # Ca exemplu, recitim tipul NFT din chain (opțional) – altfel îl punem fix
        # Pentru simplitate, punem "foarfeca". În producție, ar trebui să-l citești corect.
        # new_type = "foarfeca"
        # ... DAR e mai bine să îl obținem chiar din NFT-ul existent
        # Mai jos un call simplu (devnet) să luăm NFT-ul:
        existing_nft_url = f"{DEVNET_API}/nfts/{identifier}"
        r = requests.get(existing_nft_url)
        if r.status_code != 200:
            return jsonify({"status": "error", "message": "Nu am putut citi NFT-ul existent"}), 500
        nft_data = r.json()  # conține "attributes" => "#nftgame;type:XXX;score:...,win:..."
        
        # Decodăm attributes (base64 -> text)
        import base64
        raw_attrs_b64 = nft_data.get("attributes", "")
        raw_attrs = base64.b64decode(raw_attrs_b64).decode("utf-8") if raw_attrs_b64 else ""

        # Exemplu: "#nftgame;type:foarfeca;score:0;win:0"
        # Scoatem type existent
        existing_type = "unknown"
        segments = raw_attrs.split(";")
        for seg in segments:
            if seg.startswith("type:"):
                existing_type = seg.split(":")[1].strip()

        # Construim noile atribute
        new_attributes = f"#nftgame;type:{existing_type};score:{new_score};win:{new_win}"
        new_attributes_hex = new_attributes.encode('utf-8').hex()

        # Apelăm comanda ESDTNFTUpdateAttributes
        cmd = [
            "mxpy", "tx", "new",
            "--pem", PEM_PATH,
            "--gas-limit", "5000000",
            # La "receiver" putem folosi "erd1qqqq..." (address 0) pentru update
            "--receiver", "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
            "--data", f"ESDTNFTUpdateAttributes@{COLLECTION_HEX}@{nonce_hex}@{new_attributes_hex}",
            "--recall-nonce",
            "--proxy", "https://devnet-gateway.multiversx.com",
            "--chain", CHAIN_ID,
            "--send"
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("Update reusit:", result.stdout)
        return jsonify({"status": "success", "message": "NFT metadata updated cu succes!"})

    except subprocess.CalledProcessError as e:
        print("Eroare la update-ul NFT:", e.stderr)
        return jsonify({
            "status": "error",
            "message": "Eroare la update NFT",
            "details": e.stderr
        }), 500
    except Exception as ex:
        print("Eroare generală:", ex)
        return jsonify({
            "status": "error",
            "message": str(ex)
        }), 500
# ===================== MAIN =====================
if __name__ == "__main__":
    app.run(debug=True)
