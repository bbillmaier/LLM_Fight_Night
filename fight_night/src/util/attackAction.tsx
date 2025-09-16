import React from "react";
import type { CharValues } from "../baseValues/charValues";
import type { AttackOutcome } from "../baseValues/attackOutcome";

type Who = "player" | "monster";

type Props = {
  player: CharValues;
  monster: CharValues;
  onPrompt: (prompt: string) => void;
  onAttackResolved: (outcome: AttackOutcome) => void;
  children: (handleAttack: (who: Who) => void) => React.ReactNode;
};

function getRandomInteger(min: number, max: number): number {
  var minC = Math.ceil(min);
  var maxF = Math.floor(max);
  return Math.floor(Math.random() * (maxF - minC + 1)) + minC;
}

function attackSuccess(attackRoll: number, opposingAC: number): boolean {
  if (attackRoll >= opposingAC) {
    return true;
  } else {
    return false;
  }
}
function defeatsFoe(hp: number, damage: number){
    if(damage >= hp){
        return true;
    } else {
        return false;
    }
}
var metaPromptPrefix: string =
  "You are a dungeon master. You narrate in an exciting and dramatic tone.";
var metaPromptSuffix: string =
  "Do not describe any game mechanics. Your response should be quick and only relevant to the attack I just described. Your response must include HTML markup to add emphasis and style. Use inline css to add color to important sections or words.";

function buildAttack(
  who: Who,
  props: Props
): { prompt: string; outcome: AttackOutcome } {
  if (who === "player") {
    //Just doing all the math to calculate an attack. Right now I'm assuming that every weapon uses strength. May add an option later to allow the user to select str, dex or fin (Whichever is greater)
    var toHitBonus = Math.floor((props.player.charStr - 10) / 2);
    var attackRoll = getRandomInteger(1, 20) + toHitBonus;
    var rawDamage = toHitBonus + getRandomInteger(1, props.player.charWeaponDie);
    var damageDealt = Math.max(0, rawDamage);
    var hit = attackSuccess(attackRoll, props.monster.ac);
    //checking if the damage defeats the foe. Checking every time feels bad but I think it's necessary. I'll sleep on it and think about it. Actually the more I think about it the more I think I can't get around it.
    var playerDefeatsMonster = defeatsFoe(props.monster.hp, damageDealt);
    var prompt: string;
    if (hit === true) {
      if(playerDefeatsMonster === true){
        prompt = metaPromptPrefix + " " + props.player.name + " attacked " + props.monster.name + " with their " + props.player.charWeapon + " and successfully struck them for " + String(damageDealt) + ". This was a killing blow and  " + props.monster.name + " has been slain! Please describe the attack. " + metaPromptSuffix;
      }else{
        prompt = metaPromptPrefix + " " + props.player.name + " attacked " + props.monster.name + " with their " + props.player.charWeapon + " and successfully struck them for " + String(damageDealt) + ". Please describe the attack. Note: " + props.monster.name + " survives the attack.  " + metaPromptSuffix;
      }
    } else {
      prompt = metaPromptPrefix + " " + props.player.name + " attacked " + props.monster.name + " with their " + props.player.charWeapon + " and missed. Please describe the attempt. " + metaPromptSuffix;
    }

    //This is the outcome I'm passing back to the battleSetup (really hating that name now) to calculate HP. The LLM is just a narrator still gotta do the math on this myself.
    var outcome: AttackOutcome;
    if (hit === true) {
      outcome = {
        who: "player",
        hit: true,
        damage: damageDealt,
      };
    } else {
      outcome = {
        who: "player",
        hit: false,
        damage: 0,
      };
    }

    return { prompt: prompt, outcome: outcome };
  } else {
    //Basically the same code again. Really bad idea to do it this way cause now changes have to be dupped. Was having to much fun and really wanted to get to the part where I got to play with the LLM.
    //TODO: Refactor this to be a util that we can call and pass all the props too.
    var toHitBonus2 = Math.floor((props.monster.charStr - 10) / 2);
    var attackRoll2 = getRandomInteger(1, 20) + toHitBonus2;
    var rawDamage2 = toHitBonus2 + getRandomInteger(1, props.monster.charWeaponDie);
    var damageDealt2 = Math.max(0, rawDamage2);
    var hit2 = attackSuccess(attackRoll2, props.player.ac);
    var monsterDefeatsPlayer = defeatsFoe(props.player.hp, damageDealt2);

    var prompt2: string;
    if (hit2 === true) {
        if(monsterDefeatsPlayer === true){
            prompt2 = metaPromptPrefix + " " + props.monster.name + " attacked " + props.player.name + " with their " + props.monster.charWeapon + " and successfully struck them for " + String(damageDealt2) + ". This was a killing blow and " + props.player.name + " has been slain! " + metaPromptSuffix;
        }else{
            prompt2 = metaPromptPrefix + " " + props.monster.name + " attacked " + props.player.name + " with their " + props.monster.charWeapon + " and successfully struck them for " + String(damageDealt2) + ". Please describe the attack. Note: " + props.player.name + " survives the attack. " + metaPromptSuffix;
        }
    } else {
        prompt2 = metaPromptPrefix + " " + props.monster.name + " attacked " + props.player.name + " with their " + props.monster.charWeapon + " and missed. Please describe the attempt. " + metaPromptSuffix;
    }

    var outcome2: AttackOutcome;
    if (hit2 === true) {
      outcome2 = {
        who: "monster",
        hit: true,
        damage: damageDealt2,
      };
    } else {
      outcome2 = {
        who: "monster",
        hit: false,
        damage: 0,
      };
    }

    return { prompt: prompt2, outcome: outcome2 };
  }
}

export default function AttackUtil(props: Props) {
  function handleAttack(who: Who): void {
    var result = buildAttack(who, props);
    props.onPrompt(result.prompt);
    props.onAttackResolved(result.outcome);
  }

  return <>{props.children(handleAttack)}</>;
}
