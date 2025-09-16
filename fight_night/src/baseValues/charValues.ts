export interface CharValues {
    name: string;
    charWeapon: string;
    weaponDescription: string;
    charDescription: string;
    hp: number;
    ac: number;
    charStr: number;
    charDex: number;
    charCon: number;
    charWis: number;
    charInt: number;
    charCha: number;
    charWeaponDie: 4 | 6 | 8 | 10 | 12;
  }

// This is just an easy way to add potential dice. I'm not bound to the phyiscal limitations of real/common polyhedrals.
export const charWeaponDice = [4, 6, 8, 10 , 12] as const;