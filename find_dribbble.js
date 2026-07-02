const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Puru Goyal\\.gemini\\antigravity\\brain\\e0a87165-a5d7-422a-9c73-cdee5e6ec695\\.system_generated\\logs\\transcript_full.jsonl';

const fileChanges = {};

async function processLineByLine() {
  const fileStream = fs.createReadStream(transcriptPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      // We only care about steps before 4827
      if (data.step_index < 4827) {
        if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
          for (const call of data.tool_calls) {
            if (call.name === 'write_to_file' || call.name === 'multi_replace_file_content' || call.name === 'replace_file_content') {
              const args = call.args || {};
              const targetFile = args.TargetFile || args.AbsolutePath || '';
              
              if (targetFile.includes('src')) {
                fileChanges[targetFile] = {
                  step: data.step_index,
                  name: call.name,
                  content: args.CodeContent || args.ReplacementChunks || args.ReplacementContent
                };
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  console.log("Files modified before step 4827:");
  for (const [file, info] of Object.entries(fileChanges)) {
    console.log(`- ${file} (Last modified at step ${info.step} via ${info.name})`);
  }
}

processLineByLine();
