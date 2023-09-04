import { HfInference } from "@huggingface/inference";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEncoding } from "js-tiktoken";

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
    infer_cache[token] = new HfInference(token);
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

var MAX_SIZE = 1000;

async function chunkify(text) {
  if (tokenizer_len(text) <= MAX_SIZE) {
    return [text];
  }
  let n_tokens = await tokenizer_len(text);
  let n_chunks = Math.ceil(n_tokens / MAX_SIZE);
  let chunk_size = Math.ceil(n_tokens / n_chunks) + 100;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunk_size,
    chunkOverlap: 50,
    lengthFunction: tokenizer_len,
  });
  let output = await splitter.createDocuments([text]);
  return output.map((key) => key.pageContent);
}

async function API_call(input, token) {
  console.log("API Call to Huggingface >>>>>>>>>>>>> ");
  try {
    let data = await get_inferer(token).summarization({
      inputs: input,
      parameters: {
        min_length: Math.min(100, tokenizer_len(input)),
      },
    });
    return data["summary_text"];
  } catch (e) {
    console.error("Error:", e);
    return null;
  }
}

async function summarize(text, token) {
  if (text === null) {
    return null;
  }
  text = await text;
  let chunks = await chunkify(text);
  if (chunks.length === 1) {
    let ret = await API_call(chunks[0], token);
    return ret;
  }
  let new_summary = "";
  let responses = [];
  for (let i = 0; i < chunks.length; i++) {
    let ret = await API_call(chunks[i], token);
    if (!ret) {
      return null;
    }
    responses.push(ret);
  }

  for (let j = 0; j < chunks.length; j++) {
    new_summary += responses[j];
  }

  return summarize(new_summary, token);
}

export default summarize;
export { tokenizer_len };
