import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEncoding } from "js-tiktoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

const enc = getEncoding("gpt2");
function tokenizer_len(x) {
  return enc.encode(x).length;
}

var infer_cache = {};

function get_inferer(token) {
  if (infer_cache.token) {
    return infer_cache.token;
  } else {
    infer_cache = {};
    infer_cache[token] = new GoogleGenerativeAI(token).getGenerativeModel({
      model: "gemini-pro",
    });
    return infer_cache[token];
  }
}

// import { BartTokenizer } from "@xenova/transformers";
// async function tokenizer_len(x) {
//     return BartTokenizer.from_pretrained("facebook/bart-large").then(
//       (tok) => tok(x)["input_ids"].size
//     );
//   }
// import * as fs from "fs";

const MAX_INPUT_SIZE = 30000;
const MAX_OUTPUT_SIZE = 4096;
const MIN_OUTPUT_SIZE = 50;
const OVERLAP = 200;

async function chunkify(text) {
  if (tokenizer_len(text) <= MAX_INPUT_SIZE) {
    return [text];
  }
  let n_tokens = await tokenizer_len(text);
  let n_chunks = Math.ceil(n_tokens / MAX_INPUT_SIZE);
  let chunk_size = Math.ceil(n_tokens / n_chunks) + OVERLAP;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunk_size,
    chunkOverlap: 50,
    lengthFunction: tokenizer_len,
  });
  let output = await splitter.createDocuments([text]);
  return output.map((key) => key.pageContent);
}

async function API_call(input, token, prompt) {
  if (tokenizer_len(input) < MIN_OUTPUT_SIZE) {
    console.log("Text too short < 50 xxx API Call xxx");
    return input;
  }
  console.log("API Call to Gemini >>>>>>>>>>>>> ");
  try {
    let data = await get_inferer(token).generateContent(
      (prompt.trim() === ""
        ? "This is a webpage selection snapshot text, please provide a concise summary of the content below:"
        : prompt) +
        "\n\n\n" +
        input
    );
    const response = await data.response;
    const text = response.text();
    return text;
  } catch (e) {
    console.error("Error:", e);
    return null;
  }
}

async function summarize(text, token, prompt) {
  if (text === null) {
    return null;
  }
  text = await text;
  let chunks = await chunkify(text);
  if (chunks.length === 1) {
    let ret = await API_call(chunks[0], token, prompt);
    return ret;
  }
  let new_summary = "";
  let responses = [];
  for (let i = 0; i < chunks.length; i++) {
    let ret = await API_call(chunks[i], token, prompt);
    if (!ret) {
      return null;
    }
    responses.push(ret);
  }

  for (let j = 0; j < chunks.length; j++) {
    new_summary += responses[j];
  }

  return summarize(new_summary, token, prompt);
}

export default summarize;
export { tokenizer_len };
