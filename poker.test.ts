// const { cards, players, board }=  require("./poker.const");

const { expect } = require("chai");

type Card = {
  card: string;
  signe: string;
};
type Player = {
  id: string;
  Jeu: Card[];
};
type CardValue = {
  card: string;
  value: number;
};


// Traduction des signes de cartes 
// "CA" : "Carreau",
// "T" : "Trèfle",
// "P" : "Pique",
// "C" : "Coeur",


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
    { name: 'carte haute', value: '1' }, //  X
    { name: 'paire', value: '2' }, // X
    { name: 'double paire', value: '3' }, // X
    { name : 'brelan', value: '4' }, // X
    { name : 'suite', value: '5' }, //X
    { name : 'couleur', value: '6' }, //X
    { name : 'full', value: '7' }, //X
    { name : 'carré', value: '8' }, //X 
    { name : 'quinte flush', value: '9' },
  ];

const players = [
    { id: 'Joueur 1', Jeu: [{ card: '10', signe: 'T' }, { card: '10', signe: 'CA' }] },
    { id: 'Joueur 2', Jeu: [{ card: 'Roi', signe: 'C' }, { card: 'Roi', signe: 'P' }] },
    { id: 'Joueur 3', Jeu: [{ card: '8', signe: 'P' }, { card: '8', signe: 'T' }] }
  ];

function getCardValue(card: string): number {
  return cards.find((c: CardValue) => c.card === card)?.value ?? 0;
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
    const quinteFlush = getQuinteFlush(hand);
    const carre = getCarre(hand);
    const couleur = getCouleur(hand);
    const full = getFull(hand);
    const suite = getSuite(hand);
    const brelan = getBrelan(hand);
    const doublePair = getDoublePair(hand);
    const simplePair = getPair(hand);

    if (quinteFlush) {
      currentCategory = 9; // 'quinte flush'
      currentRankValue = getCardValue(quinteFlush[0].card);
      // Gestion de la roue (5-high quinte flush)
      if (currentRankValue === 14 && getCardValue(quinteFlush[1].card) === 5) {
          currentRankValue = 5;
      }
    } else if (carre) {
      currentCategory = 8; // 'carré'
      currentRankValue = getCardValue(carre[0].card);
    } 
    else if (full) {
      currentCategory = 7; 
      currentRankValue = getCardValue(full[0].card);
    }else if (couleur) {
      currentCategory = 6; // 'couleur'
      currentRankValue = getCardValue(couleur[0].card);
    } else if (suite) {
      currentCategory = 5; // 'suite'
      currentRankValue = getCardValue(suite[0].card); 
      // Note: Pour la roue (5-high), la valeur de comparaison est 5
      if (currentRankValue === 14 && getCardValue(suite[1].card) === 5) {
          currentRankValue = 5;
      }
    } else if (brelan) {
      currentCategory = 4; // 'brelan'
      currentRankValue = getCardValue(brelan[0].card);
    } else if (doublePair) {
      currentCategory = 3;
      currentRankValue = getCardValue(doublePair[0].card);
    }
    else if (simplePair) {
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


// Groupe toute les carte en focntion de leur valeur (pour les apirs, brelan, carrés...)
function groupByRank(hand: Card[]): Map<string, Card[]> {
  const seen = new Map<string, Card[]>();
  for (const card of hand) {
    if (!seen.has(card.card)) {
      seen.set(card.card, []);
    }
    seen.get(card.card)!.push(card);
  }
  return seen;
}

function getPair(hand: Card[]): Card[] | null {
  for (const group of groupByRank(hand).values()) {
    if (group.length >= 2) return group.slice(0, 2);
  }
  return null;
}

function getBrelan(hand: Card[]): Card[] | null {
  for (const group of groupByRank(hand).values()) {
    if (group.length >= 3) return group.slice(0, 3);
  }
  return null;
}

function getDoublePair(hand: Card[]): Card[] | null {
  const allPairs = Array.from(groupByRank(hand).values())
    .filter(group => group.length >= 2)
    .sort((a, b) => getCardValue(b[0].card) - getCardValue(a[0].card));

  if (allPairs.length >= 2) {
    return [...allPairs[0].slice(0, 2), ...allPairs[1].slice(0, 2)];
  }
  return null;
}

function getCarre(hand: Card[]): Card[] | null {
  for (const group of groupByRank(hand).values()) {
    if (group.length >= 4) return group.slice(0, 4);
  }
  return null;
}

function getCouleur(hand: Card[]): Card[] | null {
  const bySigne = new Map<string, Card[]>();

  for (const card of hand) {
    if (!bySigne.has(card.signe)) {
      bySigne.set(card.signe, []);
    }
    bySigne.get(card.signe)!.push(card);
  }

  for (const group of bySigne.values()) {
    if (group.length >= 5) {
      return group
        .sort((a, b) => getCardValue(b.card) - getCardValue(a.card))
        .slice(0, 5);
    }
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


function getFull(hand: Card[]): Card[] | null {
  const groups = Array.from(groupByRank(hand).values())
    .sort((a, b) => getCardValue(b[0].card) - getCardValue(a[0].card));

  // Chercher le meilleur brelan 
  const bestBrelan = groups.find(g => g.length >= 3);
  if (!bestBrelan) return null;

  // Chercher la meilleure paire
  const bestPaire = groups.find(g => g !== bestBrelan && g.length >= 2);
  if (!bestPaire) return null;

  // Retourner les 5 cartes 
  return [...bestBrelan.slice(0, 3), ...bestPaire.slice(0, 2)];
}

function mixJeuAndBoard(player: Player, board: Card[]): Card[] {
  return [...player.Jeu, ...board];
}


function getQuinteFlush(hand: Card[]): Card[] | null {
  // On cherche d'abord s'il y a une couleur (Flush)
  const couleurCards = getCouleur(hand);
  if (!couleurCards) return null;

  // On récupère TOUTES les cartes de la même couleur que le Flush trouvé
  const laCouleur = couleurCards[0].signe;
  const sameSigneCards = hand.filter(c => c.signe === laCouleur);

  // On vérifie si ces cartes spécifiques forment une suite
  return getSuite(sameSigneCards);
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

  it("should detect a brelan", () => {
    const handWithBrelan: Card[] = [
      { card: '8', signe: 'T' }, { card: '8', signe: 'CA' }, { card: '8', signe: 'C' },
      { card: '2', signe: 'P' }, { card: '5', signe: 'T' },
      { card: 'J', signe: 'C' }, { card: 'Roi', signe: 'P' }
    ];

    const result = getBrelan(handWithBrelan);

    expect(result).to.have.lengthOf(3);
    expect(result?.map(c => c.card).every(r => r === '8')).to.be.true;
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

  it("should detect a four of a kind (carre)", () => {
    const handWithCarre: Card[] = [
      { card: 'As', signe: 'T' }, { card: 'As', signe: 'CA' },
      { card: 'As', signe: 'P' }, { card: 'As', signe: 'C' },
      { card: '2', signe: 'T' }, { card: '5', signe: 'P' }, { card: 'Roi', signe: 'C' }
    ];
    const result = getCarre(handWithCarre);
    expect(result).to.have.lengthOf(4);
    expect(result!.every(c => c.card === 'As')).to.be.true;
  });

  it("should prioritize Carre over Couleur", () => {
    const boardCarre: Card[] = [
      { card: 'As', signe: 'CA' }, { card: 'As', signe: 'C' },
      { card: 'As', signe: 'P' }, { card: '4', signe: 'T' }, { card: '6', signe: 'T' }
    ];
    const playersCarre: Player[] = [
      { id: 'Jean', Jeu: [{ card: '2', signe: 'T' }, { card: '9', signe: 'T' }] },
      { id: 'Julie', Jeu: [{ card: 'As', signe: 'T' }, { card: 'Roi', signe: 'P' }] }
    ];
    const best = findBestHand(playersCarre, boardCarre);
    expect(best?.id).to.equal('Julie');
  });

  it("should detect a flush (couleur)", () => {
    const handWithCouleur: Card[] = [
      { card: 'As', signe: 'T' }, { card: '9', signe: 'T' },
      { card: '6', signe: 'T' }, { card: '4', signe: 'T' },
      { card: '2', signe: 'T' }, { card: 'Roi', signe: 'P' }, { card: '8', signe: 'C' }
    ];
    const result = getCouleur(handWithCouleur);
    expect(result).to.have.lengthOf(5);
    expect(result!.every(c => c.signe === 'T')).to.be.true;
    expect(result![0].card).to.equal('As');
  });

  it("should prioritize Couleur over Suite", () => {
    const boardCouleur: Card[] = [
      { card: '7', signe: 'T' }, { card: '9', signe: 'T' },
      { card: 'J', signe: 'T' }, { card: '4', signe: 'T' }, { card: '6', signe: 'T' }
    ];
    const playersCouleur: Player[] = [
      { id: 'Suite 5-9', Jeu: [{ card: '5', signe: 'P' }, { card: '8', signe: 'C' }] },
      { id: 'Couleur Trèfle', Jeu: [{ card: 'As', signe: 'T' }, { card: '2', signe: 'P' }] }
    ];
    const best = findBestHand(playersCouleur, boardCouleur);
    expect(best?.id).to.equal('Couleur Trèfle');
  });

  it("should find best hand", () => {
    const boardStraight: Card[] = [
      { card: '7', signe: 'CA' }, { card: '8', signe: 'P' },
      { card: '9', signe: 'T' }, { card: '8', signe: 'C' }, { card: '4', signe: 'T' }
    ];
    const playersStraight: Player[] = [
      { id: 'Brelan de 8', Jeu: [{ card: '8', signe: 'CA' }, { card: '2', signe: 'P' }] },
      { id: 'Suite 7-Valet', Jeu: [{ card: '10', signe: 'C' }, { card: 'Valet', signe: 'P' }] }
    ];
    const best = findBestHand(playersStraight, boardStraight);
    expect(best?.id).to.equal('Suite 7-Valet');
  });
  it("should detect a Full House (3 of a kind + 2 of a kind)", () => {
    const hand: Card[] = [
      { card: 'As', signe: 'T' }, { card: 'As', signe: 'CA' }, { card: 'As', signe: 'P' },
      { card: 'Roi', signe: 'C' }, { card: 'Roi', signe: 'T' },
      { card: '2', signe: 'P' }, { card: '5', signe: 'T' }
    ];
    const result = getFull(hand);
    expect(result).to.have.lengthOf(5);
    expect(result![0].card).to.equal('As');
    expect(result![4].card).to.equal('Roi'); 
  });

  it("should choose the highest triple as the main part of the full ", () => {
    const handWithTwoTriples: Card[] = [
      { card: '8', signe: 'T' }, { card: '8', signe: 'CA' }, { card: '8', signe: 'P' },
      { card: 'Valet', signe: 'C' }, { card: 'Valet', signe: 'T' }, { card: 'Valet', signe: 'P' },
      { card: '4', signe: 'C' }
    ];
    const result = getFull(handWithTwoTriples);
    expect(getCardValue(result![0].card)).to.equal(11); 
    expect(getCardValue(result![4].card)).to.equal(8);  
  });

  it("should detect a Royal Flush (10-A same suit)", () => {
    const handRoyal: Card[] = [
      { card: 'As', signe: 'T' }, { card: 'Roi', signe: 'T' },
      { card: 'Dame', signe: 'T' }, { card: 'Valet', signe: 'T' },
      { card: '10', signe: 'T' }, { card: '2', signe: 'P' }, { card: '3', signe: 'C' }
    ];
    const result = getQuinteFlush(handRoyal);
    expect(result).to.have.lengthOf(5);
    expect(result![0].card).to.equal('As');
    expect(result![0].signe).to.equal('T');
  });

  it("should detect a flush with low numbers", () => {
    const handSteelWheel: Card[] = [
      { card: 'As', signe: 'CA' }, { card: '2', signe: 'CA' },
      { card: '3', signe: 'CA' }, { card: '4', signe: 'CA' },
      { card: '5', signe: 'CA' }, { card: 'Roi', signe: 'P' }, { card: '9', signe: 'C' }
    ];
    const result = getQuinteFlush(handSteelWheel);
    expect(result).to.have.lengthOf(5);
    expect(result![0].card).to.equal('5'); // Ordre 5-4-3-2-A
    expect(result![0].signe).to.equal('CA');
  });
});