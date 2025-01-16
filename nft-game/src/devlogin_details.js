// src/devlogin_details.js
const devLoginDetails = {
  wallet: 'Dev_Wallet',
  cards: [
    { name: 'Foaie', score: 0, wins: 0, type: '03' },
    { name: 'Foarfecă', score: 0, wins: 0, type: '01' },
    // Observă că, de exemplu, poate lipsește tipul '02' (Piatra)
  ],

  generateCard(type) {
    // Creează un card nou pentru tipul lipsă
    let name = '';
    switch (type) {
      case '01': name = 'Foarfecă'; break;
      case '02': name = 'Piatra';   break;
      case '03': name = 'Foaie';    break;
      default:  name = 'Necunoscut';
    }
    return { name, score: 0, wins: 0, type };
  },

  addMissingTypes(missingTypes) {
    // Adaugă în array-ul `cards` tipurile care nu există
    missingTypes.forEach((type) => {
      this.cards.push(this.generateCard(type));
    });
  },
};

export default devLoginDetails;
