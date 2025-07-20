
/**
 * sqlplugin.js - Detects SQL intent using LLM and generates SQL if needed.
 * 
 * (C) 2025 TekMonks. All rights reserved.
 */

const aiapp = require(`${NEURANET_CONSTANTS.LIBDIR}/aiapp.js`);
const simplellm = require(`${NEURANET_CONSTANTS.LIBDIR}/simplellm.js`);
const llmchat = require(`${NEURANET_CONSTANTS.LIBDIR}/llmchat.js`);
const langdetector = require(`${NEURANET_CONSTANTS.THIRDPARTYDIR}/langdetector.js`);
const quota = require(`${NEURANET_CONSTANTS.LIBDIR}/quota.js`);
const utils = require(`${CONSTANTS.LIBDIR}/utils.js`);

const DEFAULT_MAX_MEMORY_TOKENS = 1000, CHAT_MODEL_DEFAULT = "chat-knowledgebase-openai";




exports.generatesqlresponse = async function (input) {
	const  query  = input.searchquery;

    if (!query) {
        throw new Error("Missing query in input");
    }

    // 1. Use a regular expression to extract the date strings.
    const regex = /from\s+(.*?)\s+to\s+(.*)/;
    const matches = query.match(regex);

    if (!matches || matches.length < 3) {
        return { error: "Could not parse the date range from the query." };
    }

    const startDateStr = matches[1]; // "2025-06-19 12:47:42"
    const endDateStr = matches[2];   // "2025-07-19 12:47:42"
        // 2. Convert both dates to the required DB format.

        // 3. Generate the final SQL query.
        // IMPORTANT: Replace 'Events' and 'event_timestamp' with your actual table and column names.
        const sqlRequest = `SELECT * FROM Events WHERE timestamp BETWEEN '${startDateStr}' AND '${endDateStr}';`;
		
    if (!sqlRequest) throw new Error("Missing SQL");
	try{
    const response = await fetch("http://localhost:3000/sqlres", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ sqlRequest})
    });
    
    const data = await response.json();
	
    if (!data.sql_res) {
        LOG.error("sql response error", data.error);
    } else {
        return { sql_res: JSON.stringify(data.sql_res, null, 2) }; 
    }

	} catch (error) {
       return { sql_res: ""};
    }
};

exports.getRelevantDoc = async function (input) {
	const query = input.searchquery;

	 if (!query) {
        throw new Error("Missing query in input");
    }

	 // 1. Use a regular expression to extract the date strings.
    const regex = /from\s+(.*?)\s+to\s+(.*)/;
    const matches = query.match(regex);

    if (!matches || matches.length < 3) {
        return { error: "Could not parse the date range from the query." };
    }

    const startDateStr = matches[1]; // "2025-06-19 12:47:42"
    const endDateStr = matches[2]; 

	const response = await fetch("http://localhost:5000/fetchDoc", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ startDateStr, endDateStr })
    });
	const data = await response.json();
	if (!data.doc) {
		LOG.error("Document retrieval error", data.error);
	} else {
		return { doc: JSON.stringify(data.doc, null, 2) }; 
	}
}

exports.merge_text_and_sql = async function (input) {
    const sql = typeof input.sql === 'object' ? JSON.stringify(input.sql) : input.sql;

    return {
        response: `<div>${input.text}</div><h4>Visual Representation</h4><pre>${sql}</pre>`,
        reason: 'ok',
        metadatas: input.metadatas || []
    };
};



/**
 * Step 3b: Wrap text only if no SVG is needed
 */
exports.wrap_text_only = async function (input) {
	const text = input.text || "";
    return {response: `<div>${input.text}</div>`, reason: 'ok',  metadatas: input.metadatas || []};
}