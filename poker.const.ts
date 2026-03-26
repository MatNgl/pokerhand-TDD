// Traduction des signes de cartes 
// "CA" : "Carreau",
// "T" : "Trèfle",
// "P" : "Pique",
// "C" : "Coeur",


// Valeures des cartes
export const cards = [
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

export const board = [
    { card: '7', signe: 'CA' }, 
    { card: '2', signe: 'P' }, 
    { card: 'J', signe: 'T' }, 
    { card: '4', signe: 'C' }, 
    { card: '9', signe: 'T' }
  ];

export const type_combinaison = [
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


module.exports = {
  cards,
players,
board,
type_combinaison
};