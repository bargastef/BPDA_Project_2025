// src/processCards.js

export function processCards(cards) {
    return cards.map((card) => {
      let description = '';
      switch (card.type) {
        case '01':
          description = 'Foarfecă';
          break;
        case '02':
          description = 'Piatra'; // sau "Ciocan", cum preferi
          break;
        case '03':
          description = 'Foaie';
          break;
        default:
          description = 'Necunoscut';
      }
      return {
        ...card,
        description,
      };
    });
  }
  