exports.parse = async (params) => {
    const airesponse = params?.airesponse;
    try {
        let responseStr = typeof airesponse.response === "string"
            ? airesponse.response
            : JSON.stringify(airesponse.response);

        // Clean the string iteratively until it's valid JSON
        responseStr = cleanJsonString(responseStr);
        
        // Try to extract JSON from code blocks first
        const jsonPattern = /```json\s*([\s\S]*?)```/i;
        const match = responseStr.match(jsonPattern);
        
        if (match) {
            responseStr = match[1].trim();
        }
        
        // Parse the cleaned string
        const parsed = JSON.parse(responseStr);
        airesponse.response = parsed;
        return airesponse;
        
    } catch (error) {
        LOG.info(`Sanitize JSON plugin: Failed to parse AI response as JSON, returning original response. ERROR: ${error.message}`);
        return airesponse;
    }
}

function cleanJsonString(str) {
    // Remove outer quotes if the entire string is wrapped in quotes
    if ((str.startsWith('"') && str.endsWith('"')) || 
        (str.startsWith("'") && str.endsWith("'"))) {
        str = str.slice(1, -1);
    }
    
    // Aggressively reduce all backslash sequences
    // This handles extreme cases with 16+ backslashes
    let previous = '';
    let maxIterations = 20; // Increased for extreme escaping
    let iterations = 0;
    
    while (str !== previous && iterations < maxIterations) {
        previous = str;
        
        // Reduce backslashes in powers of 2 for efficiency
        // 16 -> 8 -> 4 -> 2 -> 1
        str = str.replace(/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/g, '\\\\\\\\\\\\\\\\'); // 16 -> 8
        str = str.replace(/\\\\\\\\\\\\\\\\\\\\\\\\\\\\/g, '\\\\\\\\\\\\\\'); // 14 -> 7
        str = str.replace(/\\\\\\\\\\\\\\\\\\\\\\\\/g, '\\\\\\\\\\\\'); // 12 -> 6
        str = str.replace(/\\\\\\\\\\\\\\\\\\\\/g, '\\\\\\\\\\'); // 10 -> 5
        str = str.replace(/\\\\\\\\\\\\\\\\/g, '\\\\\\\\'); // 8 -> 4
        str = str.replace(/\\\\\\\\\\\\/g, '\\\\\\'); // 6 -> 3
        str = str.replace(/\\\\\\\\\\\\/g, '\\\\\\'); // 6 -> 3 (alt pattern)
        str = str.replace(/\\\\\\\\/g, '\\\\'); // 4 -> 2
        str = str.replace(/\\\\/g, '\\'); // 2 -> 1
        
        iterations++;
    }
    
    // Now handle escaped quotes and control characters
    // Do this after reducing backslashes
    str = str
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
    
    return str.trim();
}

// Alternative approach: More aggressive cleaning
function cleanJsonStringAggressive(str) {
    // Remove outer quotes if present
    if ((str.startsWith('"') && str.endsWith('"')) || 
        (str.startsWith("'") && str.endsWith("'"))) {
        str = str.slice(1, -1);
    }
    
    // Replace all variations of escaped backslashes
    // Keep replacing until no more changes occur
    let cleaned = str;
    let prevCleaned = '';
    
    while (cleaned !== prevCleaned) {
        prevCleaned = cleaned;
        cleaned = cleaned
            .replace(/\\\\\\\\/g, '\\')   // 4 backslashes -> 1
            .replace(/\\\\\\/g, '\\')     // 3 backslashes -> 1
            .replace(/\\\\/g, '\\');      // 2 backslashes -> 1
    }
    
    // Now handle escaped quotes and newlines
    cleaned = cleaned
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
    
    return cleaned.trim();
}