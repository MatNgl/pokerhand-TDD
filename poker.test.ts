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
  let bestCategoryValue = 0; // Correspond à la 'value' dans type_combinaison
  let bestRankValue = -1;    // Valeur de la carte pour le départage

  for (const player of players) {
    const hand = mixJeuAndBoard(player, board);
    
    // Initialisation par défaut : Carte Haute
    let currentCategory = 1; 
    let currentRankValue = Math.max(...hand.map(c => getCardValue(c.card)));

    // On cherche les combinaisons
    const suite = getSuite(hand);
    const doublePair = getDoublePair(hand);
    const simplePair = getPair(hand);

    if (suite) {
      currentCategory = 5; // 'suite'
      currentRankValue = getCardValue(suite[0].card); 
      // Note: Pour la roue (5-high), la valeur de comparaison est 5
      if (currentRankValue === 14 && getCardValue(suite[1].card) === 5) {
          currentRankValue = 5;
      }
    } else if (doublePair) {
      currentCategory = 3;
      currentRankValue = getCardValue(doublePair[0].card);
    }
    if (doublePair) {
      currentCategory = 3; // 'double paire'
      // On prend la valeur de la paire la plus haute pour comparer 
      currentRankValue = getCardValue(doublePair[0].card); 
    } else if (simplePair) {
      currentCategory = 2; // 'paire'
      currentRankValue = getCardValue(simplePair[0].card);
    }

    //Logique de comparaison pour déterminer le "Best Player"
    // La catégorie la plus haute gagne 
    if (currentCategory > bestCategoryValue) {
      bestCategoryValue = currentCategory;
      bestRankValue = currentRankValue;
      bestPlayer = player;
    } 
    else if (currentCategory === bestCategoryValue && currentRankValue > bestRankValue) {
      bestRankValue = currentRankValue;
      bestPlayer = player;
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


function getSuite(hand: Card[]): Card[] | null {
  // 1. Récupérer les valeurs uniques et les trier par ordre décroissant
  const uniqueCards = Array.from(new Set(hand.map(c => c.card)))
    .map(cardStr => ({
      card: cardStr,
      value: getCardValue(cardStr)
    }))
    .sort((a, b) => b.value - a.value);

  //Cas spécial : La "Roue" (5-4-3-2-A)
  const values = uniqueCards.map(c => c.value);
  const isWheel = values.includes(14) && values.includes(5) && 
                  values.includes(4) && values.includes(3) && values.includes(2);

  // Recherche d'une séquence de 5 cartes
  for (let i = 0; i <= uniqueCards.length - 5; i++) {
    const window = uniqueCards.slice(i, i + 5);
    if (window[0].value - window[4].value === 4) {

      return window.map(w => hand.find(h => h.card === w.card)!);
    }
  }

  // Si c'est une roue, on construit la main manuellement (5-4-3-2-A)
  if (isWheel) {
    const wheelRanks = ['5', '4', '3', '2', 'As'];
    return wheelRanks.map(rank => hand.find(h => h.card === rank)!);
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

  it("should return best hand with no bonus", () => {
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
    expect(best).to.deep.equal({ id: 'P1', Jeu: [{ card: '2', signe: 'T' }, { card: '5', signe: 'C' }]});
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

    const best = findBestHand(playersDP, boardDP);
    expect(best?.id).to.equal('Double Paire 2 et 4');
  });

  it("should detect a standard Ace-high straight", () => {
    const hand: Card[] = [
      { card: 'As', signe: 'T' }, { card: 'Roi', signe: 'CA' },
      { card: 'Dame', signe: 'P' }, { card: 'Valet', signe: 'C' },
      { card: '10', signe: 'T' }, { card: '2', signe: 'P' }, { card: '3', signe: 'C' }
    ];
    const result = getSuite(hand);
    expect(result).to.have.lengthOf(5);
    expect(result![0].card).to.equal('As');
  });

  it("should detect an Ace-low straight (the wheel: 5-4-3-2-A)", () => {
    const hand: Card[] = [
      { card: 'As', signe: 'T' }, { card: '2', signe: 'CA' },
      { card: '3', signe: 'P' }, { card: '4', signe: 'C' },
      { card: '5', signe: 'T' }, { card: 'Roi', signe: 'P' }, { card: '9', signe: 'C' }
    ];
    const result = getSuite(hand);
    expect(result).to.have.lengthOf(5);
    // Selon l'exigence d'ordre, la roue doit être ordonnée 5,4,3,2,A
    expect(result![0].card).to.equal('5');
    expect(result![4].card).to.equal('As');
  });

  it("should detect a middle straight (7 to Valet)", () => {
    // Board : 7, 8, 9, 2, 4
    const boardStraight: Card[] = [
      { card: '7', signe: 'CA' }, { card: '8', signe: 'P' }, 
      { card: '9', signe: 'T' }, { card: '2', signe: 'C' }, { card: '4', signe: 'T' }
    ];

    const playerStraight: Player = { 
      id: 'Joueur Suite 7-V', 
      Jeu: [{ card: '10', signe: 'C' }, { card: 'Valet', signe: 'P' }] 
    };

    const hand = mixJeuAndBoard(playerStraight, boardStraight);
    const result = getSuite(hand);

    expect(result).to.have.lengthOf(5);
    expect(result![0].card).to.equal('Valet');
    expect(result![4].card).to.equal('7');
    
    const best = findBestHand([playerStraight], boardStraight);
    expect(best?.id).to.equal('Joueur Suite 7-V');
  });
});

