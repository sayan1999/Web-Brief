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
          Get inference token from huggingface.com and register it here! Ignore
          if already done.
        </p>
      </b>
    </center>
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
      <b>
        <p>Select content on target webpage and hit summarize.</p>
      </b>
    </center>
    <div className="button-container" id="button">
      <button onClick={(evt) => process(evt)}>
        Summarize <span className="load loading"></span>
      </button>
    </div>
    <div className="text-container" id="summary"></div>
  </div>
);
