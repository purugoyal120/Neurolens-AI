const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Puru Goyal\\.gemini\\antigravity\\brain\\e0a87165-a5d7-422a-9c73-cdee5e6ec695\\.system_generated\\logs\\transcript_full.jsonl';

const filesToExtract = [
  'index.css',
  'DashboardLayout.tsx',
  'Sidebar.tsx',
  'TopNav.tsx',
  'ImpactDashboard.tsx'
];

const extractedContent = {};

async function processLineByLine() {
  const fileStream = fs.createReadStream(transcriptPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      // We only care about steps between 4830 and 4880
      if (data.step_index >= 4830 && data.step_index <= 4880) {
        if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
          for (const call of data.tool_calls) {
            if (call.name === 'write_to_file') {
              const args = call.args || {};
              const targetFile = args.TargetFile || '';
              
              for (const fileName of filesToExtract) {
                if (targetFile.includes(fileName)) {
                  // The code content in JSON is double escaped string if it's from the prompt representation, but here it might be an actual string in the parsed JSON object.
                  let content = args.CodeContent;
                  if (typeof content === 'string' && content.startsWith('"') && content.endsWith('"')) {
                    // Try to unescape it if it's JSON encoded string
                    try {
                      content = JSON.parse(content);
                    } catch (e) {}
                  }
                  extractedContent[fileName] = content;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore parse errors on corrupted lines
    }
  }

  // Now we write them back to their locations
  const writePaths = {
    'index.css': 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src\\index.css',
    'DashboardLayout.tsx': 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src\\components\\layout\\DashboardLayout.tsx',
    'Sidebar.tsx': 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src\\components\\layout\\Sidebar.tsx',
    'TopNav.tsx': 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src\\components\\layout\\TopNav.tsx',
    'ImpactDashboard.tsx': 'c:\\Users\\Puru Goyal\\Downloads\\neurolens-ai (3)\\neurolens-ai\\apps\\vision-test-web\\src\\components\\ImpactDashboard.tsx'
  };

  for (const [fileName, content] of Object.entries(extractedContent)) {
    if (content) {
      fs.writeFileSync(writePaths[fileName], content, 'utf8');
      console.log('Restored ' + fileName);
    } else {
      console.log('Could not find content for ' + fileName);
    }
  }
}

processLineByLine();
