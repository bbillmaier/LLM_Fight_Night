import { useState } from "react";
import "./CSS/module/charCards.css";
import type { CharValues } from "./baseValues/charValues";
import { charWeaponDice } from "./baseValues/charValues";



type Props = {
    title: string;
    values: CharValues;                        
    onChange: (patch: Partial<CharValues>) => void; 
    onAttack: () => void;
  };

//We are using CharCard for both player and monster. Title declares which is which and is rendered in the HTML.
function CharCard({ title, values, onChange, onAttack }: Props) {
    //Setting our initial values. Starting at 10 by tradition and a d6 for a standard longsword.

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) {
        const { name, value } = e.target;
        const numeric = new Set([
          "hp","ac","charStr","charDex","charCon","charWis","charInt","charCha","charWeaponDie",
        ]);
      
        onChange({
          [name]: numeric.has(name) ? Number(value) : value,
        } as Partial<CharValues>);
      }
      

    return ( 
    // Remember that in React class is a reserved word but ID is fine to use as normal.
    // I use containers and Inners to solve the classic problem of centering divs being annoying in CSS.
    <div className="charCont">
        <div className="charInner">
        <h2> { title } </h2> 
        {/* todo write logic to actually calculate these stats rather than have the user input them */}
        <div className="calculatedStats">
            <label>
                Hit Points <input type="string" name="hp" value ={values.hp} onChange={handleChange}></input>
            </label>
            <label>
                Armor Class <input type="string" name="ac" value ={values.ac} onChange={handleChange}></input>
            </label>
        </div>
        <div className="baseStats">
            <label>
                Strength <input type="string" name="charStr" value ={values.charStr} onChange={handleChange}></input>
            </label>
            <label>
                Dexterity <input type="string" name="charDex" value ={values.charDex} onChange={handleChange}></input>
            </label>
            <label>
                Constitution <input type="string" name="charCon" value ={values.charCon} onChange={handleChange}></input>
            </label>
            <label>
                Wisdom <input type="string" name="charWis" value ={values.charWis} onChange={handleChange}></input>
            </label>
            <label>
                Inteligence <input type="string" name="charInt" value ={values.charInt} onChange={handleChange}></input>
            </label>
            <label>
                Charsima <input type="string" name="charCha" value ={values.charCha} onChange={handleChange}></input>
            </label>
        </div>
        <label className="characterName">
            Character Name <input type="string" name="name" value ={values.name} onChange={handleChange}></input>
        </label>
        <label>
        {/* Fun little note here. Normally I would care about having two words be concatenated here like Great Hammer being greathammer. 
        But the LLM we are going to be passing this to is going to tokenize it anyway and wont care.*/}
        Character Weapon <input className="Weapon" name="charWeapon" value ={values.charWeapon} onChange={handleChange}></input>
        </label>
        <label>
            Weapon Die:
            <select name="charWeaponDie" value={values.charWeaponDie} onChange={handleChange}>
                {charWeaponDice.map((d) => (
                    <option value={d}>
                    d{d}
                    </option>
                ))}
      </select>
    </label>
      <div className="descriptions">
        <label>Character Description <textarea name="charDescription"  value={values.charDescription} onChange={handleChange}></textarea></label>
      </div>
        </div>
        <button type="button" onClick={onAttack}>Attack!</button>
    </div>

    );
}


export default CharCard;