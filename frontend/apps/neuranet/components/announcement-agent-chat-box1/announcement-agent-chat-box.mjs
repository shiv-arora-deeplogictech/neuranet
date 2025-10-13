/**
 * @module announcement-agent-chat-box
 * 
 * (C) 2023 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 * 
 * Provides a standard chatbox component. Can take Latex'ed Markdown
 * sent out by LLMs and format it to HTML.
 */

import katex from "./3p/katex-0.16.min.mjs";
import { util } from "/framework/js/util.mjs";
import {marked} from "./3p/marked.esm.min.js";
import { router } from "/framework/js/router.mjs";
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import {i18n} from "/framework/js/i18n.mjs"

const COMPONENT_PATH = util.getModulePathFromURL(import.meta.url), DEFAULT_MAX_ATTACH_SIZE = 4194304,
    DEFAULT_MAX_ATTACH_SIZE_ERROR = "File size is larger than allowed size",FONTS_PATH = util.getModulePathFromURL(import.meta.url);
let MUSTACHE;
// let jsPDF;

async function elementConnected(host) {
    const ATTACHMENT_ALLOWED = host.getAttribute("attach")?.toLowerCase() == "true";
    const MIC_ALLOWED = host.getAttribute("mic")?.toLowerCase() == "true";
    if(ATTACHMENT_ALLOWED) agent_chat_box.setDataByHost(host, { COMPONENT_PATH,FONTS_PATH, ATTACHMENT_ALLOWED: "true"});
    if(MIC_ALLOWED) agent_chat_box.setDataByHost(host, { COMPONENT_PATH, MIC_ALLOWED: "true"});
    const memory = agent_chat_box.getMemoryByHost(host); memory.FILES_ATTACHED = [];
    MUSTACHE = await router.getMustache();
}

async function elementRendered(host) {
    const shadowRoot = agent_chat_box.getShadowRootByHost(host);
    const textareaEdit = shadowRoot.querySelector("textarea#messagearea");
    await insertWelcomeMessage(shadowRoot, textareaEdit);
    textareaEdit.focus();
}

async function send(containedElement) {
    const shadowRoot = agent_chat_box.getShadowRootByContainedElement(containedElement), host = agent_chat_box.getHostElement(containedElement);
    const userMessageArea = shadowRoot.querySelector("textarea#messagearea"), userPrompt = userMessageArea.value.trim();
    if (userPrompt == "") return;    // empty prompt, ignore

    const disMessage = shadowRoot.querySelector("div#message"), buttonSendImg = shadowRoot.querySelector("img#send"), checkBox = shadowRoot.querySelector("input#multiline");
    disMessage.classList.add("disabled"), checkBox.setAttribute("disabled", true); buttonSendImg.src = `${COMPONENT_PATH}/img/spinner.svg`; userMessageArea.readOnly = true;
    const oldInsertion = _insertAIResponse(shadowRoot, userMessageArea, userPrompt, undefined, undefined, false);
    const onRequest = host.getAttribute("onrequest"), api_chat = host.getAttribute("chatapi");
    const requestProcessor = util.createAsyncFunction(`return await ${onRequest};`), 
        request = await requestProcessor({chatbox: this, prompt: userPrompt, files: _getMemory(containedElement).FILES_ATTACHED});
    const result = await apiman.rest(`${api_chat}`, "POST", request, true);

    const onResult = host.getAttribute("onresult"), resultProcessor = util.createAsyncFunction(`return await ${onResult};`), 
        processedResult = await resultProcessor({chatbox: this, result});
    _insertAIResponse(shadowRoot, userMessageArea, userPrompt, processedResult[processedResult.ok?"response":"error"], oldInsertion, true,result.document_type);

    if (!processedResult.ok) {  // sending more messages is now disabled as this chat is dead due to error
        buttonSendImg.onclick = ''; buttonSendImg.src = `${COMPONENT_PATH}/img/senddisabled.svg`;
    } else { // enable sending more messages
        buttonSendImg.src = `${COMPONENT_PATH}/img/send.svg`;
        disMessage.classList.remove("disabled"), checkBox.removeAttribute("disabled");
        userMessageArea.readOnly = false;
    }   
}

async function insertWelcomeMessage(shadowRoot, userMessageArea){
    const welcomeMessage = await i18n.get("AGENT_AI_ANNOUNCEMENT_MESSAGE");
    _insertAIResponse(shadowRoot, userMessageArea, undefined, welcomeMessage, undefined, false);
}

async function attach(containedElement) {
    const memory = _getMemory(containedElement), host = agent_chat_box.getHostElement(containedElement);
    const maxattachments = host.getAttribute("maxattachments"), accepts = host.getAttribute("attachaccepts") || "*/*";
    if (maxattachments && (memory.FILES_ATTACHED.length >= parseInt(maxattachments))) {
        alert(host.getAttribute("maxattachmentserror") || DEFAULT_MAX_ATTACHMENTS_ERROR);
        return;
    }

    const { name, data } = await util.uploadAFile(accepts, "binary",
        host.getAttribute("maxattachsize") || DEFAULT_MAX_ATTACH_SIZE, host.getAttribute("maxattachsizeerror") || DEFAULT_MAX_ATTACH_SIZE_ERROR);
    const bytes64 = await util.bufferToBase64(data), fileid = name.replaceAll(/[.\s]/g, "_") + "_" + Date.now();;
    const fileObject = { filename: name, bytes64, fileid };
    memory.FILES_ATTACHED.push(fileObject);

    const shadowRoot = agent_chat_box.getShadowRootByContainedElement(containedElement);
    const insertionHTML = shadowRoot.querySelector("template#fileattachment_insertion_template").innerHTML.trim();   // clone
    const renderedHTML = MUSTACHE.render(insertionHTML, fileObject);
    const tempNode = document.createElement("template"); tempNode.innerHTML = renderedHTML;
    const newNode = tempNode.content.cloneNode(true);
    const insertionNode = shadowRoot.querySelector("span#attachedfiles");
    insertionNode.appendChild(newNode);
}

async function detach(containedElement, fileid) {
    const memory = _getMemory(containedElement);
    memory.FILES_ATTACHED = memory.FILES_ATTACHED.filter(fileobject => fileobject.fileid != fileid);
    const shadowRoot = agent_chat_box.getShadowRootByContainedElement(containedElement);
    const insertionNode = shadowRoot.querySelector("span#attachedfiles");
    const nodeToDelete = insertionNode.querySelector(`span#${fileid}`);
    if (nodeToDelete) insertionNode.removeChild(nodeToDelete);
}

function getCollapsibleSection(hostid, title, content) {
    const shadowRoot = agent_chat_box.getShadowRootByHostId(hostid);
    const insertionTemplate = shadowRoot.querySelector("template#collapsible_content_template").innerHTML;
    const rendered = MUSTACHE.render(insertionTemplate, { title, content });
    return rendered;
}

function _detachAllFiles(shadowRoot, clearAttachedFileMemory) {
    const containedElement = shadowRoot.querySelector("div#body");
    if (clearAttachedFileMemory) { const memory = _getMemory(containedElement); memory.FILES_ATTACHED = []; }
    const insertionNode = shadowRoot.querySelector("span#attachedfiles");
    while (insertionNode.firstChild) insertionNode.removeChild(insertionNode.firstChild);
}

function _insertAIResponse(shadowRoot, userMessageArea, userPrompt, aiResponse, oldInsertion, clearAttachedFileMemory,doc_type) {
    const insertionTemplate = shadowRoot.querySelector("template#chatresponse_insertion_template").content.cloneNode(true);
    const insertion = oldInsertion || insertionTemplate.querySelector("div#insertiondiv");
    if (userPrompt) insertion.querySelector("span#userprompt").innerHTML = userPrompt;
    else { insertion.querySelector("span#userprompt").style.display = "none"; }
    const elementAIResponse = insertion.querySelector("span#airesponse");

    if (aiResponse) {
        let htmlContent;
        let isAnnouncementDoc = false;
        try {
            if(typeof aiResponse === "string") aiResponse = JSON.parse(aiResponse);
            const json = aiResponse;
            json.IS_Thai = isThaiLine(json.location);
            json.IS_Eng = !json.IS_Thai;
            // Check for required fields
            if (json && json.announcementBy && json.title && json.location && json.body && json.dateOfIssuing && json.signedBy && json.designation) {
                isAnnouncementDoc = true;
                // Optionally set logoSrc, or use a default
                json.logoSrc = `${COMPONENT_PATH}/img/garuda.jpg`;
                let templateToRender;
                if(doc_type === "announcement_letter")  templateToRender = shadowRoot.querySelector("template#announcement_document_template").innerHTML.trim();
                console.log("Announcement Template: ", templateToRender);
                htmlContent = MUSTACHE.render(templateToRender, json);
            }
        } catch (e) {
            // Not JSON, fallback
        }
        if (!isAnnouncementDoc) {
            htmlContent = _latexedMarkdownToHTML(aiResponse);
        }
        elementAIResponse.innerHTML = htmlContent + insertionTemplate.querySelector("span#controls").outerHTML;;
        elementAIResponse.dataset.content = `<!doctype html>\n${htmlContent}\n</html>`;
        elementAIResponse.dataset.content_mime = "text/html";
    }

    shadowRoot.querySelector("div#chatmainarea").appendChild(insertion);
    const chatScroller = shadowRoot.querySelector("div#chatscroller");
    chatScroller.scrollTop = chatScroller.scrollHeight;

    shadowRoot.querySelector("div#start").classList.replace("visible", "hidden");
    chatScroller.classList.replace("hidden", "visible");
    userMessageArea.value = "";
    _detachAllFiles(shadowRoot, clearAttachedFileMemory);

    return insertion;
}

function isThaiLine(line) {
    return /[\u0E00-\u0E7F]/.test(line);
}

function _latexedMarkdownToHTML(text) {
    try {
        const latexBoundariedText = text.replace(/\\\[([\s\S]*?)\\\]/g, '<div class=\"maths\">$1</div>');
        let html = marked.parse(latexBoundariedText);
        const regex = /<div class=\"maths\">([\s\S]*?)<\/div>/g;
        let match; while ((match = regex.exec(html)) !== null) {
            const mathMLText = katex.renderToString(match[1].trim(), { displayMode: true, output: "mathml", throwOnError: false, strict: false });
            html = html.replace(match[0], mathMLText);
        }
        return html;
    } catch (err) {
        LOG.error(`Markdown conversion error: ${err}, returning original text`);
        return text;
    }
}

const _getMemory = containedElement => agent_chat_box.getMemoryByContainedElement(containedElement);

export const agent_chat_box = { trueWebComponentMode: true, elementConnected, elementRendered, send, attach, detach, getCollapsibleSection}
monkshu_component.register("announcement-agent-chat-box", `${COMPONENT_PATH}/announcement-agent-chat-box.html`, agent_chat_box);
