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

  const players = [
    { id: 'Joueur 1', Jeu: [{ card: '10', signe: 'T' }, { card: '10', signe: 'CA' }] },
    { id: 'Joueur 2', Jeu: [{ card: 'K', signe: 'C' }, { card: 'K', signe: 'P' }] },
    { id: 'Joueur 3', Jeu: [{ card: '8', signe: 'P' }, { card: '8', signe: 'T' }] }
  ];

// function findBestHand(players: any, board: any) {
//   for (let player of players) {
//     const hand = mixJeuAndBoard(player.Jeu, board);
    
//     player.bestHand = bestHand;
//   }
// }


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

  it("should return a pair if it exists", () => {
    const player = players[0];
    const hand = mixJeuAndBoard(player, board);
    const pair = getPair(hand);
    expect(pair).to.deep.equal([
      { card: '10', signe: 'T' },
      { card: '10', signe: 'CA' }
    ]);
  });

  it("should return null if no pair exists", () => {
    const noPairHand: Card[] = [
      { card: '2', signe: 'P' },
      { card: '5', signe: 'T' },
      { card: '7', signe: 'CA' },
      { card: '9', signe: 'C' },
      { card: 'J', signe: 'T' }
    ];
    const pair = getPair(noPairHand);
    expect(pair).to.equal(null);
  });
});