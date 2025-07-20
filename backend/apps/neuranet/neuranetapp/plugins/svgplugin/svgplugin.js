/**
 * svgplugin.js - Handles LLM chart detection, SQL generation, SVG creation, and merging with LLM text.
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

/**
 * Step 1: Use LLM to detect chart intent and generate SQL + chart type
 */
exports.llm_sql_prompt = async function (params) {
	const id = params.id, org = params.org, session_id = params.session_id, query_in = params.query,
		brainid = params.brainid || params.aiappid;

	LOG.debug(`Chart intent and SQL generation triggered for query: ${query_in} from ${id}@${org}`);

	const aiappThis = await aiapp.getAIApp(id, org, brainid, true);
	if ((!aiappThis.disable_quota_checks) && (!(await quota.checkQuota(id, org, brainid)))) {
		LOG.error(`Quota exceeded for ${id}@${org}`);
		params.return_error("QUOTA_LIMIT_EXCEEDED"); return;
	}

	const chatsession = llmchat.getUsersChatSession(id, session_id).chatsession || [];
	const aiModelToUse = params.model?.name || CHAT_MODEL_DEFAULT;
	const aiModelObj = await aiapp.getAIModel(aiModelToUse, params.model?.model_overrides, id, org, brainid);
	const aiModulePath = `${NEURANET_CONSTANTS.LIBDIR}/${aiModelObj.driver.module}`;

	let aiLibrary;
	try {
		aiLibrary = utils.requireWithDebug(aiModulePath, NEURANET_CONSTANTS.CONF.debug_mode);
	} catch (err) {
		const errMsg = `Error loading AI module ${aiModulePath}: ${err}`;
		LOG.error(errMsg); params.return_error(errMsg); return;
	}

	const finalSession = chatsession.length ? await llmchat.trimSession(aiModelObj.max_memory_tokens || DEFAULT_MAX_MEMORY_TOKENS, llmchat.jsonifyContentsInThisSession(chatsession), aiModelObj, aiModelObj.token_approximation_uplift, aiModelObj.tokenizer, aiLibrary) : [];

	if (finalSession.length) finalSession[finalSession.length - 1].last = true;
	const flatSession = finalSession.map(s => ({ [s.role]: s.content }));

	const lang = langdetector.getISOLang(query_in);
	const prompt = params[`prompt_${lang}`] || params.prompt;

	const mustacheData = {session: finalSession, flatsession: flatSession, question: query_in, ...params};

	let llmResponse = await simplellm.prompt_answer(prompt, id, org, brainid, mustacheData, aiModelObj);

	try {
		const parsed = JSON.parse(llmResponse);
		LOG.info("Chart intent detection successful.");
		return parsed;
	} catch (err) {
		LOG.error("Invalid JSON from LLM in llm_sql_prompt:", llmResponse);
		return { requires_svg: false };
	}
};



exports.generate_chart = async function (input) {
    const { sql, chart_type } = input;
    if (!sql || !chart_type) throw new Error("Missing SQL or chart_type.");
	try{
    const response = await fetch("http://localhost:3000/sqlres", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({sql})
    });
    
    const data = await response.json();
        
    if (!data.svg) {
        LOG.error("SVG cannot be generated, no SVG returned from server.", data.error);
    } else {
        LOG.info("SVG chart generated successfully.");
        
        // Convert SVG to Base64 data URI
        const base64Svg = Buffer.from(data.svg).toString('base64');
        const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
		const imgTag = `<img src="${dataUri}" alt="Chart" />`;
        
        return { svg: imgTag }; 
    }
	}	catch (error) {
       return { svg: ""};
    }
};



exports.merge_text_and_svg = async function (input) {
    return {
        response: `<div>${input.text}</div><h4>Visual Representation</h4>${input.svg}`,
        reason: 'ok',
        metadatas: input.metadatas || []
    };
};


/**
 * Step 3b: Wrap text only if no SVG is needed
 */
exports.wrap_text_only = async function (input) {
    return {response: `<div>${input.text}</div>`, reason: 'ok',  metadatas: input.metadatas || []};
};
