import { showMessage } from "./errorHandler";
import Question from "./question";
import QVal, { QValType } from "./questionValue";
import { QuizParams } from "./quiz";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const AUDIO_FORMATS = ["mp3", "ogg", "wav", "m4a"];
const VIDEO_FORMATS = ["mp4", "webm", "mov", "avi"];
const LINK_PREFIXES = ["http://", "https://", "www.", ".com"];

const PROPS_ACCEPTING_LIST = ["category", "media", "answers", "author"];
const PROPS_FORCED_LOWERCASE = ["category", "author", "type"];

const MASK_QUESTION_SYMBOL = "?";
const MASK_ANSWER_SYMBOL = "!";
const INLINE_SPLIT_SYMBOL = ",";
const PROPERTY_DECLARE_SYMBOL = "=>";
const COMMENT_SYMBOL = "//";

const isValidMediaType = (path:string, params:QuizParams = {}) =>
{
    const ext = parseExtension(path);
    const allFormats = params.mediaFormats ?? [IMAGE_FORMATS, AUDIO_FORMATS, VIDEO_FORMATS].flat();
    return allFormats.includes(ext);
}

const parseRawFile = async (url: string, data:string) : Promise<string|Object> =>
{
    const ext = parseExtension(url);
    if(ext == "txt" || ext == "md") { return data; }
    else if(ext == "json") { return JSON.parse(data); }
    else if(ext == "doc" || ext == "docx") {
        return parseWordDocument(url);
    } else if(ext == "pdf") {
        // @NOTE: too heavyweight, too hard, skip
    }
}

const parseFileObject = (url: string, data:Record<string,any>, params:QuizParams = {}) : Question[] =>
{
    const questionsRaw = data.questions;
    const questions = [];
    for(const questionRaw of questionsRaw)
    {
        const q = new Question();
        for(const [key, data] of Object.entries(questionRaw))
        {
            if(typeof data !== "string" || !Array.isArray(data)) { continue; }
            q.updateProperty(key, data);
        }
        q.url = url;
        q.finalize(params);
        questions.push(q);
    }
    return questions;
}

const parseFileString = (url: string, data:string, params:QuizParams = {}) : Question[] =>
{
    const lines = data.split(/\r?\n/)

    const commentSymbol = params.symbols.comment ?? COMMENT_SYMBOL;
    const propertyDeclareSymbol = params.symbols.property ?? PROPERTY_DECLARE_SYMBOL;

    let curQuestion : Question = null;
    let currentProperty : string = null;
    const questions = [];
    for(const line of lines)
    {
        const emptyLine = line.length <= 0;
        if(emptyLine) { continue; }

        const comment = line.trim().indexOf(commentSymbol) == 0;
        if(comment) { continue; }

        let parts = line.split(propertyDeclareSymbol);
        parts = parts.map(s => s.trim());

        const invalid = parts.length > 2;
        if(invalid)
        {
            showMessage("Can't parse invalid line: " + line, params.id);
            continue;
        }

        const continueCurrentProperty = parts.length <= 1;
        if(continueCurrentProperty)
        {
            if(!curQuestion) { showMessage(["Can't continue property because no question started: ", parts], params.id); continue; }
            const val = parts[0];
            curQuestion.updateProperty(currentProperty, [val]);
            continue;
        }

        parts[0] = parts[0].toLowerCase();
        currentProperty = parts[0];

        const startNewQuestion = (currentProperty == "question");
        if(startNewQuestion)
        {
            const mustSavePreviousQuestion = curQuestion != null;
            if(mustSavePreviousQuestion) { curQuestion.finalize(params); questions.push(curQuestion); }
            curQuestion = new Question();
            curQuestion.url = url;
        }
        
        const val = parseInlinePropertyValue(currentProperty, parts[1]);
        curQuestion.updateProperty(currentProperty, val);
    }

    curQuestion.finalize(params);
    questions.push(curQuestion); 

    return questions;
}

const acceptsCommaList = (prop:string) => 
{ 
    return PROPS_ACCEPTING_LIST.includes(prop); 
}

const parseInlinePropertyValue = (prop: string, val:string, params:QuizParams = {}) : string[] =>
{
    if(val.length <= 0) { return []; }
    if(acceptsCommaList(prop) && params.enableInlineMultiple) 
    {
        const splitSymbol = params.symbols.inlineMultiple ?? INLINE_SPLIT_SYMBOL; 
        return val.split(splitSymbol); 
    }
    return [val];
}

const parseQuestionProperty = (prop: string, val:string[], params:QuizParams = {}) : QVal[] =>
{
    val = val.map(s => s.trim());
    if(PROPS_FORCED_LOWERCASE.includes(prop)) { val = val.map(s => s.toLowerCase()); }
    val = val.filter(x => x != ''); // no completely empty entries

    const questionMaskSymbol = params.symbols.questionOnly ?? MASK_QUESTION_SYMBOL;
    const answerMaskSymbol = params.symbols.answerOnly ?? MASK_ANSWER_SYMBOL; 

    const arr : QVal[] = [];
    for(let elem of val)
    {
        const firstChar = elem.charAt(0);
        let qValType = QValType.ALL;
        if(firstChar == questionMaskSymbol) { elem = elem.slice(1).trim(); qValType = QValType.QUESTION; }
        else if(firstChar == answerMaskSymbol) { elem = elem.slice(1).trim(); qValType = QValType.ANSWER; }

        arr.push(new QVal(elem, qValType));
    }
    return arr;
}

const parseExtension = (path:string) =>
{
    const splitPath = path.split(".");
    return splitPath[splitPath.length - 1];
}

const parsePathToID = (path:string) =>
{
    const splitPath = path.split("/");
    return splitPath[splitPath.length - 1];
}

const toWhiteSpaceString = (val:string[]) =>
{
   return val.join("<br>");
}

const isExternalURL = (val:string, params:QuizParams = {}) =>
{
    const prefixes = params.linkPrefixes ?? LINK_PREFIXES;
    for(const prefix of prefixes)
    {
        if(val.includes(prefix)) { return true; }
    }
    return false;
}

const parseQuestionsIntoList = (cache:Record<string, Question[]>) =>
{
    const list = [];
    for(const elem of Object.values(cache))
    {
        list.push(elem);
    }
    return list.flat();
}

const parseQuestionsIntoJSON = (questions: Question[]) =>
{
    const questionsParsed = [];
    for(const q of questions)
    {
        const obj = {};
        for(const prop of Object.keys(q))
        {
            const val = q[prop];
            if(Array.isArray(val)) {
                const arr = [];
                for(const elem of val)
                {
                    arr.push(parseQuestionValueIntoString(elem));
                }
                obj[prop] = arr;
            } else {
                obj[prop] = parseQuestionValueIntoString(val);
            }
        }
        questionsParsed.push(obj);
    }
    const obj = { questions: questionsParsed };
    return obj;
}

const parseQuestionsIntoJSONString = (questions: Question[]) =>
{
    return JSON.stringify(parseQuestionsIntoJSON(questions));
}

const parseQuestionValueIntoString = (v:QVal) =>
{
    if(!(v instanceof QVal)) { return v; }

    const val = v.get();
    if(v.type == QValType.ALL) { return val; }
    else if(v.type == QValType.ANSWER) { return MASK_ANSWER_SYMBOL + val; }
    else if(v.type == QValType.QUESTION) { return MASK_QUESTION_SYMBOL + val; }
}

// @SOURCE (one of many): https://stackoverflow.com/questions/28440170/get-docx-file-contents-using-javascript-jquery
// @SOURCE (seemed promising, until Node was required again): https://www.npmjs.com/package/docxyz?activeTab=readme
// @SOURCE (also seemed promising, but no): https://github.com/morungos/node-word-extractor
const parseWordDocument = async (url:string) =>
{
    return "CAN'T PARSE WORD DOCUMENTS, all libraries for some fucking reason require Node and a bunch of dependencies. I tried, I really tried.";
}

export
{
    parseRawFile,
    parseFileString,
    parseFileObject,
    parseQuestionProperty,
    parseQuestionsIntoList,
    parseQuestionsIntoJSON,
    parseQuestionsIntoJSONString,
    parseExtension,
    parsePathToID,
    toWhiteSpaceString,

    isValidMediaType,
    isExternalURL,

    IMAGE_FORMATS,
    AUDIO_FORMATS,
    VIDEO_FORMATS
}