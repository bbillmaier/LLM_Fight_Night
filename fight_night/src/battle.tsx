import React, { useEffect, useMemo, useState } from "react";
import "./CSS/module/battle.css";
import { llmValues } from "./baseValues/llmValues"

type Props = { prompt: string };
type KoboldResponse = { results: { text: string }[] };

type Entry = {
  id: string;
  ts: number;
  prompt: string;   // raw prompt entered
  response?: string; // response from Kobold
  error?: string;    // error message
  status: "pending" | "done" | "error";
};

const KOBOLD_URL = "http://localhost:5001/api/v1/generate";

export default function KoboldCaller(props: Props) {
  const [history, setHistory] = useState<Entry[]>([]);
  // Setting up default values
  const [llmValues, setValues] = useState<llmValues>({
    max_con_length: 2048,
    max_response_length: 250,
    temp: 1,
  })

  // The default change handler TODO: Probably should put this in a util so I don't keep rewriting it.

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setValues({
      ...llmValues,
      [fieldName]: Number(fieldValue),
    });
  }
  //Basic Submit
  function submitLLMoptionsChange(e: React.FormEvent) {
    e.preventDefault();
    console.log("Updating LLM Options:", llmValues);
  }


  // Make a unique ID for the current prompt
  const currentId = useMemo(function () {
    if (props.prompt) {
      return Date.now().toString() + "-" + Math.random().toString();
    } else {
      return "";
    }
  }, [props.prompt]);

  useEffect(function () {
    // Do nothing if the prompt is empty
    if (!props.prompt.trim()) {
      return;
    }

    // Build the conversation context by combining previous entries
    let context = "";
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i];
      if (h.status === "done") {
        context += "PROMPT:\n" + h.prompt + "\nRESPONSE:\n" + (h.response || "") + "\n\n";
      }
    }

    // Combine context with the new prompt
    const fullPrompt = context + props.prompt;

    // Add a new entry marked as "pending"
    const newEntry: Entry = {
      id: currentId,
      ts: Date.now(),
      prompt: props.prompt,
      status: "pending",
    };

    setHistory(function (previous) {
      const copy = previous.slice();
      copy.unshift(newEntry); //Note: Adding to the bottow with push. If I wanna change it to newest first we can use unshift.
      return copy;
    });

    // Async function to send to Kobold
    async function send() {
      try {
        const res = await fetch(KOBOLD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            max_context_length: llmValues.max_con_length,
            max_length: llmValues.max_response_length,
            prompt: fullPrompt,
            memory: "You are a dungeon master. You narrate in an exciting and dramatic tone. Do not describe any game mechanics. Your response should be quick and only relevant to the attack I just described. Your response must include HTML markup to add emphasis and style. Use inline css to add color to important sections or words.",
            quiet: false,
            rep_pen: 1.1,
            rep_pen_range: 256,
            rep_pen_slope: 1,
            temperature: Math.round(llmValues.temp * 100) / 100,
            tfs: 1,
            top_a: 0,
            top_k: 100,
            top_p: 0.9,
            typical: 1,
          }),
        });

        if (!res.ok) {
          throw new Error("HTTP " + res.status + " " + res.statusText);
        }

        const json = (await res.json()) as KoboldResponse;
        const text = (json.results && json.results[0] ? json.results[0].text : "").trim();

        // Update the entry in history with response
        setHistory(function (previous) {
          return previous.map(function (h) {
            if (h.id === currentId) {
              return { ...h, response: text, status: "done" };
            } else {
              return h;
            }
          });
        });
      } catch (e: any) {
        const error = e && e.message ? e.message : String(e);
        setHistory(function (previous) {
          return previous.map(function (h) {
            if (h.id === currentId) {
              return { ...h, error: error, status: "error" };
            } else {
              return h;
            }
          });
        });
      }
    }

    send();
  }, [props.prompt, currentId]); // run whenever prompt or id changes

  function clearHistory() {
    setHistory([]);
  }


  return (
    <section>
      <div className="llmOptionsForm">
        <div className="llmOptionsFormInner">
            <form onSubmit={submitLLMoptionsChange}>
              <label>
                Context Length: <input type="number" name="max_con_length" value={llmValues.max_con_length} onChange={handleChange}></input>
              </label>
              <label>
                Response Length: <input type="number" name="max_response_length" value={llmValues.max_response_length} onChange={handleChange}></input>
              </label>
              <label>
                Creativity: <input type="number" name="temp" value={llmValues.temp} onChange={handleChange}></input>
              </label>
              <button type="submit">Update Settings</button>
          </form>
        </div>
      </div>
      <div>
        <strong>Combat Narration</strong>
        <button type="button" onClick={clearHistory} style={{ marginLeft: "auto" }}>
          Clear history
        </button>
      </div>

      {history.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No prompts yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {history.map(function (h) {
            return (
              <div key={h.id} className="singleResponse">
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                  {new Date(h.ts).toLocaleTimeString()} • {h.status.toUpperCase()}
                </div>

                {h.status === "pending" && <div>Sending…</div>}
                {h.status === "error" && <div style={{ color: "crimson" }}>Error: {h.error}</div>}
                {h.status === "done" && h.response && (
                  <div
                    className="kobold-html"
                    dangerouslySetInnerHTML={{ __html: h.response }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
