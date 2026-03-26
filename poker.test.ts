const { expect } = require("chai");

// Traduction des signes de cartes 
// "CA" : "Carreau",
// "T" : "Trèfle",
// "P" : "Pique",
// "C" : "Coeur",

type Card = {
  card: string;
  signe: string;
};

type Player = {
  id: string;
  Jeu: Card[];
};

// Valeures des cartes
const cards = [
  { card: "2", value: 2 },
  { card: "3", value: 3 },
  { card: "4", value: 4 },
  { card: "5", value: 5 },
  { card: "6", value: 6 },
  { card: "7", value: 7 },
  { card: "8", value: 8 },
  { card: "9", value: 9 },
  { card: "10", value: 10 },
  { card: "Valet", value: 11 },
  { card: "Dame", value: 12 },
  { card: "Roi", value: 13 },
  { card: "As", value: 14 }
];

  const board = [
    { card: '7', signe: 'CA' }, 
    { card: '2', signe: 'P' }, 
    { card: 'J', signe: 'T' }, 
    { card: '4', signe: 'C' }, 
    { card: '9', signe: 'T' }
  ];

  const type_combinaison = [
    { name: 'carte haute', value: '1' },
    { name: 'paire', value: '2' },
    { name: 'double paire', value: '3' },
    { name : 'brelan', value: '4' },
    { name : 'suite', value: '5' },
    { name : 'couleur', value: '6' },
    { name : 'full', value: '7' },
    { name : 'carré', value: '8' },
    { name : 'quinte flush', value: '9' },
  ];

  const players = [
    { id: 'Joueur 1', Jeu: [{ card: '10', signe: 'T' }, { card: '10', signe: 'CA' }] },
    { id: 'Joueur 2', Jeu: [{ card: 'Roi', signe: 'C' }, { card: 'Roi', signe: 'P' }] },
    { id: 'Joueur 3', Jeu: [{ card: '8', signe: 'P' }, { card: '8', signe: 'T' }] }
  ];

function getCardValue(card: string): number {
  return cards.find(c => c.card === card)?.value ?? 0;
}

function findBestHand(players: Player[], board: Card[]): Player | null {
  let bestPlayer: Player | null = null;
  let bestValue = -1;

  for (const player of players) {
    const hand = mixJeuAndBoard(player, board);
    const pair = getPair(hand);
    // Trouver une paire
    if (pair) {
      const value = getCardValue(pair[0].card);
      if (value > bestValue) {
        bestValue = value;
        bestPlayer = player;
      }
    }
  }

  return bestPlayer;
}


function getPair(hand: Card[]): Card[] | null {
  const seen: Record<string, Card[]> = {};

  for (const card of hand) {
    if (!seen[card.card]) {
      seen[card.card] = [];
    }
    seen[card.card].push(card);
  }

  for (const group of Object.values(seen)) {
    if (group.length >= 2) {
      return group.slice(0, 2);
    }
  }

  return null;
}

function getDoublePair(hand: Card[]): Card[] | null {
const seen: Record<string, Card[]> = {};

// On groupe par rang 
  for (const card of hand) {
    if (!seen[card.card]) {
      seen[card.card] = [];
    }
    seen[card.card].push(card);
  }

  // On récypère tous les groupes de 2 cartes ou plus 
  const allPairs = Object.values(seen).filter(group => group.length >= 2)
  // On trie par valeur de carte décroissante
  .sort((a, b) => getCardValue(b[0].card) - getCardValue(a[0].card));

  // IL faut au moins 2 paires distinctes
  if (allPairs.length >= 2) {
    const firstPair = allPairs[0].slice(0, 2);
    const secondPair = allPairs[1].slice(0, 2);
    return [...firstPair, ...secondPair];
  }

  return null;
}

function mixJeuAndBoard(player: Player, board: Card[]): Card[] {
  return [...player.Jeu, ...board];
}

describe("Texas Hold'em", () => {
  it("should mix player's hand with the board", () => {
    const player = players[0];
    const hand = mixJeuAndBoard(player, board);
    expect(hand).to.deep.equal([
      { card: '10', signe: 'T' },
      { card: '10', signe: 'CA' },
      { card: '7', signe: 'CA' },
      { card: '2', signe: 'P' },
      { card: 'J', signe: 'T' },
      { card: '4', signe: 'C' },
      { card: '9', signe: 'T' }
    ]);
  });

  it("should find the player with the best pair", () => {
    const best = findBestHand(players, board);
    expect(best?.id).to.equal('Joueur 2');
  });

  it("should return null", () => {
    const noPairPlayers: Player[] = [
      { id: 'P1', Jeu: [{ card: '2', signe: 'T' }, { card: '5', signe: 'C' }] }
    ];
    const emptyBoard: Card[] = [
      { card: '7', signe: 'CA' },
      { card: '9', signe: 'P' },
      { card: 'J', signe: 'T' },
      { card: '3', signe: 'C' },
      { card: '6', signe: 'T' }
    ];
    const best = findBestHand(noPairPlayers, emptyBoard);
    expect(best).to.equal(null);
  });
  
  it("should detect two pairs from a hand of 7 cards", () => {
    const handWithTwoPairs: Card[] = [
      { card: '10', signe: 'T' }, { card: '10', signe: 'CA' }, // Paire 1
      { card: '8', signe: 'P' }, { card: '8', signe: 'T' },   // Paire 2
      { card: '7', signe: 'CA' }, { card: '2', signe: 'P' }, { card: 'J', signe: 'T' }
    ];
    
    const result = getDoublePair(handWithTwoPairs);
    
    // On attend 4 cartes (les deux paires)
    expect(result).to.have.lengthOf(4);
    // On vérifie que les rangs sont corrects
    const ranks = result?.map(c => c.card);
    expect(ranks).to.include('10');
    expect(ranks).to.include('8');
  });

  it("should prioritize Double Pair over a simple Pair", () => {
    const boardDP: Card[] = [
      { card: '7', signe: 'CA' }, { card: '2', signe: 'P' }, 
      { card: 'J', signe: 'T' }, { card: '4', signe: 'C' }, { card: '9', signe: 'T' }
    ];

    const playersDP: Player[] = [
      { id: 'Paire d\'As', Jeu: [{ card: 'As', signe: 'T' }, { card: 'As', signe: 'CA' }] },
      { id: 'Double Paire 2 et 4', Jeu: [{ card: '2', signe: 'C' }, { card: '4', signe: 'P' }] }
    ];

    // Note : Actuellement ton findBestHand ne teste que getPair(). 
    // Ce test va échouer ("Red") jusqu'à ce que tu modifies findBestHand.
    const best = findBestHand(playersDP, boardDP);
    expect(best?.id).to.equal('Double Paire 2 et 4');
  });
});

