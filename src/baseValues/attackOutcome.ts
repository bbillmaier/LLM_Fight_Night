export type AttackOutcome = {
    who: "player" | "monster";
    hit: boolean;
    damage: number;
  };