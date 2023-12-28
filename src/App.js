/*global chrome*/

import summarize from "./Summary.js";
import { tokenizer_len } from "./Summary.js";

async function savetoken(token) {
  chrome.tabs.query(
    { active: true, currentWindow: true, windowType: "normal" },
    function (tabs) {
      console.log("[Request] Saving token to local storage");
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "msg_from_popup", method: "save_token", token: token },
        function (response) {
          if (response["type"] === "msg_from_content") {
            console.log("[Pass]: Received response from Content Page");
            // console.log(response);
            if (response["content"]) {
              console.log(response["content"]);
              alert(response["content"]);
            } else {
              console.log("[Fail] Error saving token");
            }
          }
        }
      );
    }
  );
}

function process(evt, prompt) {
  document.getElementById("summary").innerText = "";
  chrome.tabs.query(
    { active: true, currentWindow: true, windowType: "normal" },
    function (tabs) {
      console.log("[Request] Requesting content from web page tab");
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "msg_from_popup", method: "get_tab_content" },
        function (response) {
          if (response["type"] === "msg_from_content") {
            console.log("[Pass] Received response from web page tab");
            if (response["content"]) {
              console.log(
                "[Pass] Received content of web page tab, tokens length:",
                tokenizer_len(response["content"])
              );
              let text = response["content"];
              if (response["token"]) {
                evt.target.classList.add("activeLoading");
                summarize(text, response["token"], prompt).then((summary) => {
                  if (summary) {
                    console.log("Summary:", summary);
                    document.getElementById("summary").innerText = summary;
                  } else {
                    console.log("Error fetching summary API");
                    document.getElementById("summary").innerText =
                      "Error fetching summary API limit reached or wrong token?";
                    alert(
                      "Error fetching summary API limit reached or wrong token? Please crosscheck your token try again later or upgrade to pro from huggiingface"
                    );
                  }

                  evt.target.classList.remove("activeLoading");
                });
              } else {
                console.log(
                  "[Fail]: Gemini AI google inference token not found!"
                );
                alert(
                  "Inference token not found! Please register an inference token from gemini ai free of cost to use this app"
                );
              }
            } else {
              console.log(
                "[Fail]: No content received from web page, make sure selection weas made on page"
              );
              alert(
                "No content received from web page, make sure a selection was made on page"
              );
            }
          }
        }
      );
    }
  );
}

export default process;
export { savetoken };
