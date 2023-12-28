chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request["type"] === "msg_from_popup") {
    if (request.method === "get_tab_content") {
      console.log("Content request received from popup");
      if (localStorage["token"]) {
        sendResponse({
          type: "msg_from_content",
          content: window.getSelection().toString(),
          token: localStorage["token"],
        });
      } else {
        console.log("Summarizer token unavailable");
        alert("Summarizer token unavailable");
        sendResponse({
          type: "msg_from_content",
          content: window.getSelection().toString(),
        });
      }
    }
  }
  if (request["type"] === "msg_from_popup") {
    if (request.method === "save_token") {
      console.log("Saving token saved by popup");
      localStorage["token"] = request.token;
      console.log("Token saved by popup successfully");
      sendResponse({
        type: "msg_from_content",
        content: "Token saved success!",
      });
      console.log("Content sent to popup");
    }
  }
  return true;
});
