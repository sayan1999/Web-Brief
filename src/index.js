import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import process from "./App";
import { savetoken } from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <div className="App">
    <center>
      <b>
        <p>
          <a href="https://makersuite.google.com/app/apikey">
            Get inference token from google gemini and paste/register it here!
            Ignore if already done.
          </a>
        </p>
      </b>
    </center>
    <center>
      <input
        type="password"
        id="token"
        name="token"
        required
        minlength="4"
        maxlength="80"
        size="50"
        font-size="12"
        placeholder="Register/Edit token here"
      />
    </center>

    <div className="button-container">
      <button
        id="submit"
        onClick={(evt) => {
          savetoken(document.getElementById("token").value);
          document.getElementById("token").value = "";
        }}
      >
        Save Token <span className="load loading"></span>
      </button>
    </div>
    <center>
      <input
        id="prompt"
        name="prompt"
        font-size="12"
        size="50"
        placeholder="Optional Customizable prompt instruction for summarization here"
      />
    </center>
    <center>
      <b>
        <p>Select content on target webpage and hit summarize.</p>
      </b>
    </center>
    <div className="button-container" id="button">
      <button
        onClick={(evt) => process(evt, document.getElementById("prompt").value)}
      >
        Summarize <span className="load loading"></span>
      </button>
    </div>
    <div className="text-container" id="summary"></div>
  </div>
);
