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


// function getPair(cards : Card[]):{

// }

function mixJeuAndBoard(player: Player, board: Card[]): Card[] {
  return [...player.Jeu, ...board];
}

describe("Texas Hold'em", () => {
  it("find a pair", () => {
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
  })
});