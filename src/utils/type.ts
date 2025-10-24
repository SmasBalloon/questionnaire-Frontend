export interface Player {
  id: string;
  pseudo: string;
  score: number;
}

export interface PendingAnswer {
  playerId: string;
  playerPseudo: string;
  questionId: number;
  answerText: string;
  responseTime: number;
  potentialPoints: number;
  validated: boolean;
}