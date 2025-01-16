// Variabile globale
let playerScore = { piatra: 0, foarfeca: 0, hartie: 0 };
let playerWins = 0; // Scorul jucătorului
let robotWins = 0; // Scorul robotului
const winningScore = 5; // Scorul necesar pentru a câștiga

const robotOptions = ["piatra", "foarfeca", "hartie"];
const API_BASE = "http://127.0.0.1:5000"; // Backend URL
const walletAddress = sessionStorage.getItem("walletAddress");

console.log(`Fetching scores for wallet: ${walletAddress}`);

if (!walletAddress) {
    alert("Wallet-ul nu este conectat. Te rugăm să te întorci la pagina principală.");
    window.location.href = "index.html";
}

console.log(`Fetching scores for wallet: ${walletAddress}`);




// Funcție pentru preluarea scorurilor NFT de pe blockchain
const fetchInitialScores = async () => {
    try {
        const response = await fetch(`${API_BASE}/api/get-nft-scores?wallet=${walletAddress}`);
        const data = await response.json();

        if (data.status === "success") {
            playerScore = data.scores; // Actualizează scorurile inițiale
        } else {
            console.error("Eroare la preluarea scorurilor NFT:", data.message);
        }
    } catch (error) {
        console.error("Eroare la preluarea scorurilor NFT:", error);
    }
};

// Apelează această funcție la încărcarea paginii
window.onload = async () => {
    await fetchInitialScores();
};


// Funcție pentru alegerea robotului
const getRobotChoice = () => {
    const randomIndex = Math.floor(Math.random() * robotOptions.length);
    return robotOptions[randomIndex];
};

const checkWinner = async () => {
    if (playerWins === winningScore || robotWins === winningScore) {
        disableGameControls();

        const endMessageElement = document.getElementById("end-message");
        endMessageElement.style.fontFamily = `"Segoe UI Emoji", "Apple Color Emoji", sans-serif`; // Asigură fontul pentru emoji-uri

        if (playerWins === winningScore) {
            endMessageElement.innerText = "🎉 Ai castigat jocul!";
            endMessageElement.style.color = "blue"; // Setează culoarea textului pe albastru
        } else {
            endMessageElement.innerText = "❌ Robotul a castigat jocul!";
            endMessageElement.style.color = "red"; // Setează culoarea textului pe roșu
        }

        // Actualizează NFT-urile la sfârșit de joc
        await updateNFTScores();

        // Redirecționează la pagina principală după un timeout
        setTimeout(() => {
            window.location.href = "index.html";
        }, 10000);
    }
};

const disableGameControls = () => {
    // Dezactivăm toate butoanele
    document.getElementById("player-piatra").disabled = true;
    document.getElementById("player-foarfeca").disabled = true;
    document.getElementById("player-hartie").disabled = true;
};

const compareChoices = (playerChoice, robotChoice) => {
    if (playerChoice === robotChoice) return "Egalitate!";
    if (
        (playerChoice === "piatra" && robotChoice === "foarfeca") ||
        (playerChoice === "foarfeca" && robotChoice === "hartie") ||
        (playerChoice === "hartie" && robotChoice === "piatra")
    ) {
        playerScore[playerChoice]++;
        playerWins++;
        checkWinner(); // Verifică dacă jucătorul a câștigat
        return "Victorie!";
    }
    robotWins++;
    checkWinner(); // Verifică dacă robotul a câștigat
    return "Infrangere!";
};

const updateNFTScores = async () => {
    for (const [type, score] of Object.entries(playerScore)) {
        if (score > 0) { // Actualizează doar NFT-urile care au scoruri acumulate
            try {
                const response = await fetch(`${API_BASE}/api/update-nft-score`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        wallet: walletAddress,
                        type: type,
                        score: score
                    }),
                });
                const data = await response.json();
                if (data.status === "success") {
                    console.log(`NFT-ul ${type} actualizat cu scorul ${score}`);
                } else {
                    console.error(`Eroare la actualizarea NFT-ului ${type}: ${data.message}`);
                }
            } catch (error) {
                console.error(`Eroare la actualizarea NFT-ului ${type}:`, error);
            }
        }
    }
};

const updateScoreDisplay = () => {
    document.getElementById("player-score").innerText = `${playerWins}`;
    document.getElementById("robot-score").innerText = `${robotWins}`;
};

const handleChoice = (playerChoice) => {
    const robotChoice = getRobotChoice();
    const result = compareChoices(playerChoice, robotChoice);

    // Afișează scorurile actualizate
    updateScoreDisplay();

    // Afișează rezultatul cu stiluri personalizate
    const resultElement = document.getElementById("result");
    resultElement.innerHTML = `
        <span>Tu: <strong>${playerChoice}</strong></span><br>
        <span>Robot: <strong>${robotChoice}</strong></span><br>
        <span id="result-text">Rezultat: <strong>${result}</strong></span>
    `;
    resultElement.style.fontSize = "24px"; // Text mai mare

    // Selectează doar elementul rezultat și setează culoarea
    const resultTextElement = document.getElementById("result-text");
    if (result === "Victorie!") {
        resultTextElement.style.color = "green";
    } else if (result === "Infrangere!") {
        resultTextElement.style.color = "red";
    } else if (result === "Egalitate!") {
        resultTextElement.style.color = "orange"; // Portocaliu pentru egalitate
    }

};

// Event listeners pentru cărțile jucătorului
document.getElementById("player-piatra").addEventListener("click", () => handleChoice("piatra"));
document.getElementById("player-foarfeca").addEventListener("click", () => handleChoice("foarfeca"));
document.getElementById("player-hartie").addEventListener("click", () => handleChoice("hartie"));
