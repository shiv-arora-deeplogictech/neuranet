exports.parse = async (params)=>{
    const airesponse = params?.airesponse;
    try{
    let responseStr = typeof airesponse.response === "string"
                    ? airesponse.response
                    : JSON.stringify(airesponse.response);

                responseStr = cleanBackslashes(responseStr);
                const jsonPattern = /```json\s*([\s\S]*?)```/i;
                const match = responseStr.match(jsonPattern);
                const parsed = match ? JSON.parse(match[1]) : JSON.parse(responseStr);

                airesponse.response = parsed;
                return airesponse;
} catch(e){
    LOG.info("Sanitize JSON plugin: Failed to parse AI response as JSON, returning original response.");
    return airesponse;
}
}

function cleanBackslashes(str) {
  return str
    .replace(/\\n/g, '')           // Remove escaped newlines
    .replace(/\\"/g, '"')          // Replace escaped quotes with regular quotes
    .replace(/\\\\/g, '\\');       // Replace double backslashes with single backslashes
}
