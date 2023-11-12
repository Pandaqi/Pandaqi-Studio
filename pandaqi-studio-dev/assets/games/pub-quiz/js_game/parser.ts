import { showMessage } from "./errorHandler";
import Question from "./question";
import QVal, { QValType } from "./questionValue";
import { QuizParams } from "./quiz";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const AUDIO_FORMATS = ["mp3", "ogg", "wav", "m4a"];
const VIDEO_FORMATS = ["mp4", "webm", "mov", "avi"];
const LINK_PREFIXES = ["http://", "https://", "www.", ".com"];

const PROPS_ACCEPTING_LIST = ["category", "media", "answers", "author"];
const PROPS_FORCED_LOWERCASE = ["category", "autor"];

const MASK_QUESTION_SYMBOL = "?";
const MASK_ANSWER_SYMBOL = "!";

const isValidMediaType = (path:string) =>
{
    const ext = parseExtension(path);
    return IMAGE_FORMATS.includes(ext) || AUDIO_FORMATS.includes(ext) || VIDEO_FORMATS.includes(ext);
}

const parseRawFile = (data:string) : string|Object =>
{
    const ext = parseExtension(data);
    if(ext == "txt" || ext == "md") { return data; }
    else if(ext == "json") { return JSON.parse(data); }
    else if(ext == "doc" || ext == "docx") {

    } else if(ext == "pdf") {

    }

    // @TODO: depending on type, invoke a different parser to process and return content
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

    let curQuestion : Question = null;
    let currentProperty : string = null;
    const questions = [];
    for(const line of lines)
    {
        const emptyLine = line.length <= 0;
        if(emptyLine) { continue; }

        let parts = line.split("=>");
        parts = parts.map(s => s.trim());

        const invalid = parts.length > 2;
        if(invalid)
        {
            showMessage("Can't parse invalid line: " + line);
            continue;
        }

        const continueCurrentProperty = parts.length <= 1;
        if(continueCurrentProperty)
        {
            if(!curQuestion) { showMessage(["Can't continue property because no question started: ", parts]); continue; }
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

const parseInlinePropertyValue = (prop: string, val:string) : string[] =>
{
    if(val.length <= 0) { return []; }
    if(acceptsCommaList(prop)) { return val.split(","); }
    return [val];
}

const parseQuestionProperty = (prop: string, val:string[]) : QVal[] =>
{
    val = val.map(s => s.trim());
    if(PROPS_FORCED_LOWERCASE.includes(prop)) { val = val.map(s => s.toLowerCase()); }
    val = val.filter(x => x != ''); // no completely empty entries

    const arr : QVal[] = [];
    for(let elem of val)
    {
        const firstChar = elem.charAt(0);
        let qValType = QValType.ALL;
        if(firstChar == MASK_QUESTION_SYMBOL) { elem = elem.slice(1); qValType = QValType.QUESTION; }
        else if(firstChar == MASK_ANSWER_SYMBOL) { elem = elem.slice(1); qValType = QValType.ANSWER; }

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

const isExternalURL = (val:string) =>
{
    for(const prefix of LINK_PREFIXES)
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
            if(Array.isArray(prop)) {
                const arr = [];
                for(const elem of q[prop])
                {
                    arr.push(parseQuestionValueIntoString(elem));
                }
                obj[prop] = arr;
            } else {
                obj[prop] = parseQuestionValueIntoString(q[prop]);
            }
        }
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
    const val = v.get();
    if(v.type == QValType.ALL) { return val; }
    else if(v.type == QValType.ANSWER) { return MASK_ANSWER_SYMBOL + val; }
    else if(v.type == QValType.QUESTION) { return MASK_QUESTION_SYMBOL + val; }
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