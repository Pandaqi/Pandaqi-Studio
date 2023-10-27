import Question from "./question";
import { QuizParams } from "./quiz";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const AUDIO_FORMATS = ["mp3", "ogg", "wav", "m4a"];
const VIDEO_FORMATS = ["mp4", "webm", "mov", "avi"];
const LINK_PREFIXES = ["http://", "https://", "www.", ".com"];

const DEFAULT_SCORE = 1;
const DEFAULT_AUTHOR = "anonymous";
const DEFAULT_CATEGORY = "general";
const PROPS_ACCEPTING_LIST = ["category", "media", "answers", "author"];
const PROPS_FORCED_LOWERCASE = ["category", "autor"];

const isValidMediaType = (path:string) =>
{
    const ext = parseExtension(path);
    return IMAGE_FORMATS.includes(ext) || AUDIO_FORMATS.includes(ext) || VIDEO_FORMATS.includes(ext);
}

const parseTextFile = (data:string, params:QuizParams = {}) =>
{
    params.defaultAuthor = params.defaultAuthor ?? DEFAULT_AUTHOR;
    params.defaultCategory = params.defaultCategory ?? DEFAULT_CATEGORY;
    params.defaultScore = params.defaultScore ?? DEFAULT_SCORE;

    // @ts-ignore
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
            console.error("Can't parse invalid line: " + line);
            continue;
        }

        const continueCurrentProperty = parts.length <= 1;
        if(continueCurrentProperty)
        {
            if(!curQuestion) { console.error("Can't continue property because no question started: ", parts); continue; }
            const val = parts[0];
            curQuestion.updateProperty(currentProperty, [val]);
            continue;
        }

        parts[0] = parts[0].toLowerCase();
        currentProperty = parts[0];

        const startNewQuestion = (currentProperty == "question");
        if(startNewQuestion)
        {
            const mustSavePreviousQuestion = curQuestion != null && curQuestion.isValid();
            if(mustSavePreviousQuestion) { curQuestion.finalize(params); questions.push(curQuestion); }
            curQuestion = new Question();
        }
        
        const val = parseInlinePropertyValue(currentProperty, parts[1]);
        curQuestion.updateProperty(currentProperty, val);
    }

    if(curQuestion.isValid()) 
    { 
        curQuestion.finalize(params);
        questions.push(curQuestion); 
    }

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

const parseQuestionProperty = (prop: string, val:string[]) : string[] =>
{
    val = val.map(s => s.trim());
    if(PROPS_FORCED_LOWERCASE.includes(prop)) { val = val.map(s => s.toLowerCase()); }
    val = val.filter(x => x != ''); // no completely empty entries
    return val;
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



const parseQuestionsIntoJSON = () =>
{
    // @TODO
}

export
{
    parseTextFile,
    parseQuestionProperty,
    parseQuestionsIntoList,
    parseQuestionsIntoJSON,
    parseExtension,
    parsePathToID,
    toWhiteSpaceString,

    isValidMediaType,
    isExternalURL,

    IMAGE_FORMATS,
    AUDIO_FORMATS,
    VIDEO_FORMATS
}