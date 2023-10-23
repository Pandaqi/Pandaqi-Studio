import Question from "./question";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const AUDIO_FORMATS = ["mp3", "ogg", "wav", "m4a"];
const VIDEO_FORMATS = ["mp4", "webm", "mov", "avi"];

const isValidMediaType = (path:string) =>
{
    const ext = parseExtension(path);
    return IMAGE_FORMATS.includes(ext) || AUDIO_FORMATS.includes(ext) || VIDEO_FORMATS.includes(ext);
}

const parseTextFile = (data:string) =>
{
    // @ts-ignore
    const lines = data.split(/\r?\n/)

    let curQuestion = null;
    let currentProperty = null;
    const questions = [];
    for(const line of lines)
    {
        const emptyLine = line.length <= 0;
        if(emptyLine) { continue; }

        let parts = line.split("=>");
        parts = parts.map(s => s.trim());

        const continueCurrentProperty = parts.length <= 1;
        if(continueCurrentProperty)
        {
            curQuestion.updateProperty(currentProperty, parts[0]);
            continue;
        }

        const invalid = parts.length > 2;
        if(invalid)
        {
            console.error("Can't parse invalid line: " + line);
            continue;
        }

        parts[0] = parts[0].toLowerCase();
        currentProperty = parts[0];

        const startNewQuestion = (currentProperty == "question");
        if(startNewQuestion)
        {
            const mustSavePreviousQuestion = curQuestion != null && curQuestion.isValid();
            if(mustSavePreviousQuestion) { curQuestion.finalize(); questions.push(curQuestion); }
            curQuestion = new Question();
        }
        
        const hasData = parts[1].length > 0;
        if(hasData)
        {
            curQuestion.updateProperty(currentProperty, parts[1]);
        }
    }

    if(curQuestion.isValid()) 
    { 
        curQuestion.finalize();
        questions.push(curQuestion); 
    }

    return questions;
}

const parseQuestionProperty = (val:string) : string[] =>
{
    let arr = val.split(",");
    arr = arr.map(s => s.trim());
    arr = arr.filter(x => x != ''); // no completely empty entries
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

    isValidMediaType,
    IMAGE_FORMATS,
    AUDIO_FORMATS,
    VIDEO_FORMATS
}