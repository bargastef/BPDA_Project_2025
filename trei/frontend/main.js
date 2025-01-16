const API_BASE = "http://127.0.0.1:5000"; // Backend URL
let walletAddress = ""; // Adresa wallet-ului utilizatorului

// Contor pentru verificări reușite
let successfulVerifications = 0;
const totalVerificationsNeeded = 3; // Numărul total de verificări necesare

// Funcție pentru a conecta wallet-ul
const connectWallet = async () => {
    const fileInput = document.getElementById("pem-file");
    const loadingMessage = document.getElementById("loading-message");

    if (!fileInput.files[0]) {
        alert("Incarca fisier .pem!");
        return;
    }

    // Afișează mesajul de așteptare
    loadingMessage.style.display = "block";

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
        const pemContent = event.target.result;
        try {
            const response = await fetch(`${API_BASE}/api/connect-wallet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pem: pemContent }),
            });
            const data = await response.json();
            if (data.status === "success") {
                alert("Wallet conectat cu succes!");
                walletAddress = data.walletAddress; // Salvează adresa wallet-ului
                sessionStorage.setItem("walletAddress", walletAddress); // Salvăm wallet-ul

                // Afișează adresa wallet-ului și butoanele
                document.getElementById("wallet-info").style.display = "block";
                document.getElementById("wallet-address").innerText = walletAddress;
                document.getElementById("action-buttons").style.display = "block";
                document.getElementById("generate-buttons").style.display = "block"; // Afișează butoanele de generare
                // Asigură-te că butoanele de generare sunt inițial dezactivate
                setGenerateButtonsDisabled(true);
            } else {
                alert("Eroare la conectarea wallet-ului.");
            }
        } catch (error) {
            console.error("Eroare la conectarea wallet-ului:", error);
        } finally {
            // Ascunde mesajul de așteptare
            loadingMessage.style.display = "none";
        }
    };
    reader.readAsText(file);

    // Resetează fișierul după conectare
    fileInput.value = "";
};

// Restaurare wallet la încărcarea paginii
window.onload = () => {
    const savedWallet = sessionStorage.getItem("walletAddress");
    if (savedWallet) {
        walletAddress = savedWallet;
        document.getElementById("wallet-info").style.display = "block";
        document.getElementById("wallet-address").innerText = walletAddress;
        document.getElementById("action-buttons").style.display = "block";
        document.getElementById("generate-buttons").style.display = "block";
    }
};

// Deconectare wallet
const disconnectWallet = () => {
    sessionStorage.removeItem("walletAddress");
    alert("Wallet deconectat!");
    location.reload(); // Reîncarcă pagina
};

const checkIfAllVerified = () => {
    if (successfulVerifications === totalVerificationsNeeded) {
        document.getElementById("joaca").disabled = false; // Deblochează butonul „Joacă”
        alert("Toate NFT-urile sunt confirmate!");
    }
};

// Funcție pentru verificarea NFT-urilor
const verifyNFT = async (type) => {
    const response = await fetch(`${API_BASE}/api/verify-nft?wallet=${walletAddress}&type=${type}`);
    const data = await response.json();
    
    if (data.exists) {
        alert(`${type} NFT exista.`);
        // Devenim indisponibil butonul de verificare
        document.getElementById(`verify-${type.toLowerCase()}`).disabled = true;
        
        // Crește contorul pentru verificări reușite
        successfulVerifications++;
        checkIfAllVerified(); // Verifică dacă toate condițiile sunt îndeplinite
    } else {
        alert(`${type} nu exista. Apasa "Genereaza" pentru a crea.`);
        // Permite butonul de generare
        document.getElementById(`verify-${type.toLowerCase()}`).disabled = true;
        document.getElementById(`generate-${type.toLowerCase()}`).disabled = false;
    }
};

// Funcție pentru a seta un timeout pentru butonul "Verifică"
const enableVerifyButtonAfterDelay = (type, delay) => {
    const verifyButton = document.getElementById(`verify-${type.toLowerCase()}`);
    const messageContainer = document.getElementById(`message-${type.toLowerCase()}`); // Containerul pentru mesaj
    let message = messageContainer.querySelector("span");

    // Dacă mesajul nu există deja, creează unul nou
    if (!message) {
        message = document.createElement("span");
        message.id = `wait-message-${type.toLowerCase()}`;
        message.style.color = "red";
        messageContainer.appendChild(message); // Adaugă mesajul în containerul dedicat
    }

    // Actualizează textul mesajului
    message.innerText = `Asteaptă ${delay / 1000} secunde pentru activarea butonului "Verifica ${type}".`;

    // Dezactivează butonul și setează timeout pentru reactivare
    verifyButton.disabled = true;
    setTimeout(() => {
        verifyButton.disabled = false;
        if (message) {
            message.remove(); // Elimină mesajul după activare
        }
    }, delay);
};


// Funcție pentru a crea un NFT
const createNFT = async (type) => {
    try {
        const response = await fetch(`${API_BASE}/api/create-nft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet: walletAddress, type }),
        });

        const data = await response.json();
        if (data.status === "success") {
            alert(`${type} NFT creat cu succes!`);
            document.getElementById(`generate-${type.toLowerCase()}`).disabled = true;
            // Activează butonul "Verifică" după 10 secunde
            enableVerifyButtonAfterDelay(type, 10000);
        } else {
            alert(`Eroare la crearea ${type} NFT: ${data.message}`);
        }
    } catch (error) {
        console.error("Eroare la crearea NFT-ului:", error);
        alert("Eroare la crearea NFT-ului.");
    }
};

// Funcție pentru a dezactiva toate butoanele de generare
const setGenerateButtonsDisabled = (isDisabled) => {
    const buttons = document.querySelectorAll('#generate-buttons button');
    buttons.forEach(button => button.disabled = isDisabled);
};

// Event listener pentru butonul "Conectează Wallet"
document.getElementById("connect-wallet").addEventListener("click", connectWallet);

// Event listeners pentru butoanele de acțiune
document.getElementById("verify-piatra").addEventListener("click", async () => {
    await verifyNFT("Piatra");
});

document.getElementById("verify-foarfeca").addEventListener("click", async () => {
    await verifyNFT("Foarfeca");
});

document.getElementById("verify-hartie").addEventListener("click", async () => {
    await verifyNFT("Hartie");
});

// Event listeners pentru butoanele de generare NFT
document.getElementById("generate-piatra").addEventListener("click", () => createNFT("piatra"));
document.getElementById("generate-foarfeca").addEventListener("click", () => createNFT("foarfeca"));
document.getElementById("generate-hartie").addEventListener("click", () => createNFT("hartie"));

document.getElementById("joaca").addEventListener("click", () => {
    sessionStorage.setItem("walletAddress", walletAddress);
    location.assign("game.html");
});

