import { useState } from "react";
import "./CSS/battleSetup.css";
import type { CharValues } from "./baseValues/charValues";
import type { AttackOutcome } from "./baseValues/attackOutcome";
import { charWeaponDice } from "./baseValues/charValues";
import CharCard from "./charCard";
import KoboldCaller from './battle';
import AttackUtil from './util/attackAction';

// we declare the values here because we need to move them into the parent so we can send them to Kobold
const defaultChar: CharValues = {
    name: "",
    charWeapon: "",
    weaponDescription: "",
    charDescription: "",
    hp: 25,
    ac: 10,
    charStr: 10,
    charDex: 10,
    charCon: 10,
    charWis: 10,
    charInt: 10,
    charCha: 10,
    charWeaponDie: 6,
  };


export default function BattleSetup() {

    //I set the states up here and then pass them and the onchange functionality via props to the charCard components.
    const [player, setPlayer] = useState<CharValues>({ ...defaultChar });
    const [monster, setMonster] = useState<CharValues>({ ...defaultChar });

    //On change function. Using patch to change only some values.
    const updatePlayer = (patch: Partial<CharValues>) =>
    setPlayer((prev) => ({ ...prev, ...patch }));

    const updateMonster = (patch: Partial<CharValues>) =>
    setMonster((prev) => ({ ...prev, ...patch }));

    const [prompt, setPrompt] = useState("");
    function handleAttackResolved(outcome: AttackOutcome) {
        if (outcome.who === "player" && outcome.hit) {
            setMonster(prev => ({ ...prev, hp: Math.max(0, prev.hp - outcome.damage) }));
        }
        if (outcome.who === "monster" && outcome.hit) {
            setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - outcome.damage) }));
        }
    }
  return (
    <section className="battleSetup">
        <div className="setupTitle">
            <h1>Battle Setup</h1>
        </div>
        <div className="setupCont">
            <div className="setupInner">
                <div className="charCards"> 
                <AttackUtil
                    //Sending and retrieving our props. Sending Player and Monster Stats. Retrieveing the prompt to send to Kobold and the resolution of the attack.
                    player={player}
                    monster={monster}
                    onPrompt={(p) => setPrompt(p)}
                    onAttackResolved={handleAttackResolved}
                    >
                    {(handleAttack) => (
                        <>
                        <CharCard
                            title="Player"
                            values={player}
                            onChange={updatePlayer}
                            onAttack={() => handleAttack("player")}
                        />
                        <CharCard
                            title="Monster"
                            values={monster}
                            onChange={updateMonster}
                            onAttack={() => handleAttack("monster")}
                        />
                        </>
                    )}
                    </AttackUtil>
                </div>
            </div>
        </div>
        <div className="battleZone">
                <KoboldCaller  prompt={prompt} />
        </div>
    </section>
  );
}