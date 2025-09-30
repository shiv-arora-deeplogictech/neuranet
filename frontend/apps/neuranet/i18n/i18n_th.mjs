export const i18n = {
"Title" : "Neuranet",
"logintagline": "Enterprise AI Neural Networks",
"loginsubtag": "อัจฉริยะ ผสานรวม และใช้งานง่าย",
"LoginMsg": "ลงชื่อเข้าใช้ด้วย Tekmonks",
"LoginFailed": "การเข้าสู่ระบบล้มเหลว",
"LearnMore": "LearnMore",

"NothingToConvert": "ไม่พบข้อมูลที่ต้องการแปลง",
"ErrorConvertingInternal": "ข้อผิดพลาดในการแปลง ขออภัย",
"ErrorConvertingBadAIModel": "ข้อผิดพลาดในการแปลง เนื่องจากโมเดล AI ไม่ตรงกัน ขออภัย",
"ErrorConvertingBadAPIRequest": "ข้อผิดพลาดในการแปลง เนื่องจากข้อผิดพลาดในการสื่อสารเครือข่าย ขออภัย",
"ErrorConvertingBadInputSQL": "ข้อผิดพลาดในการแปลง เนื่องจากอินพุตไม่ถูกต้อง SQL.\n\n{{#message}}{{message}}{{/message}}{{^message}}ตัวแยกวิเคราะห์ SQL ล้มเหลวในการแยกวิเคราะห์{{/message}}\n\nพบที่: บรรทัด:{{#line}}{{line}}{{/line}}{{^line}}0{{/line}}, คอลัมน์:{{#column}}{{column}}{{/column}}{{^column}}0{{/column}}.",
"PossibleErrorConvertingSQL": "--- คำเตือน: SQL ที่อาจมีปัญหา\n--- {{#message}}{{{message}}}{{/message}}{{^message}}ตัวแยกวิเคราะห์ SQL ล้มเหลวในการแยกวิเคราะห์{{/message}}\n--- พบที่: {{#line}}{{line}}{{/line}}{{^line}}0{{/line}}, คอลัมน์: {{#column}}{{column}}{{/column}}{{^column}}0{{/column}}.\n",
"InternalErrorConverting": "ข้อผิดพลาดภายใน โปรดลองใหม่ในภายหลัง",
"ValidateSQL": "ตรวจสอบอินพุตล่วงหน้า",
"ValidateSQLWarning": "การตรวจสอบนี้อาจทำให้เกิดข้อผิดพลาดในการตรวจสอบ เว้นแต่ SQL จะรองรับ SQL:2016 อย่างแท้จริง (ส่วนใหญ่ไม่รองรับ)",

"ChooseActivity": "ChooseActivity",

"ChatAIError": "ข้อผิดพลาด AI กำลังประมวลผล โปรดโหลดหน้าใหม่เพื่อเริ่มการสนทนาใหม่",
"NeuralNetReady": "AI Neural Network<br>พร้อมแล้ว...",
"TypeMessage": "พิมพ์ข้อความ",
"Multiline": "Multiline",
"MaxSizeError": "โปรดแนบไฟล์ขนาดเล็กกว่า 4 MB",
"MaxAttachmentsError": "สามารถแนบไฟล์ได้สูงสุด 4 ไฟล์",

"ViewLabel_gencode": "สร้างโค้ด",
"ViewLabel_enterpriseassist": "Enterprise assistant",
"ViewLabel_sqltranslate": "แปล SQL",
"ViewLabel_chat": "แชททั่วไป",
"ViewLabel_aiworkshop": "AI workshop",

"ErrorConvertingBadInputCode": "ข้อผิดพลาดในการแปลง เนื่องจากโค้ดอินพุตไม่ถูกต้อง\n\n{{#message}}{{message}}{{^message}}ตัวแยกวิเคราะห์โค้ดไม่สามารถแยกวิเคราะห์ได้{{/message}}\n\nพบที่: บรรทัด:{{#line}}{{line}}{{/line}}{{^line}}0{{/line}}, คอลัมน์: {{#column}}{{column}}{{/column}}{{^column}}0{{/column}}.",
"PossibleErrorConvertingCode": "--- คำเตือน: โค้ดอาจมีปัญหา\n--- {{#message}}{{message}}{{/message}}{{^message}}ตัวแยกวิเคราะห์โค้ดล้มเหลว{{/message}}\n--- พบที่: {{#line}}{{line}}{{^line}}0{{/line}}, คอลัมน์: {{#column}}{{column}}{{/column}}{{^column}}0{{/column}}.",

"ErrorConvertingAIQuotaLimit": "คุณใช้โควต้าการใช้จ่าย 24 ชั่วโมงถึงขีดจำกัดแล้ว โปรดลองใหม่อีกครั้งในวันพรุ่งนี้",

"NotImplemented": "ยังไม่ได้ใช้งาน ยัง",

"EnterpriseAssist_Done": "เสร็จสิ้น",
"EnterpriseAssist_Processing": "กำลังอ่าน",
"EnterpriseAssist_NoEvents": "ไม่มีเหตุการณ์",
"EnterpriseAssistAnalysisLabel": "การวิเคราะห์",
"EnterpriseAssist_KnowledgeBase": "การฝึกอบรม AI",
"EnterpriseAssist_ErrorNoKnowledge": "ขออภัย ฉันไม่มีความรู้เกี่ยวกับหัวข้อนี้",
"EnterpriseAssist_AIError": "ข้อผิดพลาดของ AI กำลังประมวลผล โปรดโหลดหน้าใหม่เพื่อเริ่มคำขอผู้ช่วยใหม่",
"EnterpriseAssist_ResponseTemplate": "{{{response}}}\n\n<span id='aireferences' style='font-size: x-small; line-height: 1.2em;'><span style='font-style: ตัวเอียง'>อ้างอิง</span><br/>\n{{#references}}{{.}}<br/>\n{{/references}}<span>",

"AIWorkshop_Title": "AI Workshop",
"AIWorkshop_Subtitle_EditApp": "กำลังแก้ไข {{{aiappid}}}",
"AIWorkshop_Subtitle_TrainApp": "การฝึกอบรม {{{aiappid}}}",
"AIWorkshop_NewAIApp": "ใหม่",
"AIWorkshop_TrainAIApp": "ฝึกอบรม",
"AIWorkshop_DeleteAIApp": "ลบ",
"AIWorkshop_PublishAIApp": "เผยแพร่",
"AIWorkshop_UnpublishAIApp": "ยกเลิกการเผยแพร่",
"AIWorkshop_AIAppNamePrompt": "ป้อนชื่อแอปพลิเคชัน AI",
"AIWorkshop_AIAppGenericError": "ข้อผิดพลาดใน แอปพลิเคชัน AI",
"AIWorkshop_AIAppGenericSuccess": "คำสั่งสำเร็จ",
"AIWorkshop_AIAppAlreadyExists": "ข้อผิดพลาด: มีแอปพลิเคชันที่ใช้ ID ดังกล่าวอยู่แล้ว",
"AIWorkshop_NotAdmin": "คุณไม่มีสิทธิ์ที่จำเป็น โปรดติดต่อผู้ดูแลระบบของคุณ",
"AIWorkshop_ClickAppToEdit": "คลิกเพื่อแก้ไข",
"AIWorkshop_KnowledgeBase": "การฝึกอบรม AI",

"AGENT_AI_WELCOME_MESSAGE": "Hey, which document you want to generate today? \n\nเฮ้ วันนี้คุณต้องการสร้างเอกสารอะไร?"
}