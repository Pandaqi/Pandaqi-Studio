import { isExternalURL, isValidMediaType, parseExtension, parseQuestionsIntoList, parseTextFile } from "./parser";
import Question from "./question";
import { QuizParams } from "./quiz";

const BASE_URL = "/pub-quiz/";
const QUESTION_FILE_NAME_PATTERN = "questions";
const MAX_SCORE = 5;

export default class Loader
{
    params: QuizParams;
    url: string;
    filename: string;
    cache: Record<string, Question[]>
    maxScore: number;
    data: Question[]

    // @TODO: bring into constants, add default check for folder slash behind it
    subfolders = {
        media: "media/",
        questions: "questions/"
    }

    constructor(params:QuizParams = {})
    {
        this.params = params;
        this.url = params.url ?? BASE_URL;
        this.maxScore = params.maxScore ?? MAX_SCORE;
        this.filename = params.filename ?? QUESTION_FILE_NAME_PATTERN;
        this.cache = {};
    }

    getData() { return this.data; }
    getCache() { return this.cache; }

    // Loads files with <NAME>_<IDX>, index from 0 and upwards, until it can't find the next one anymore
    async load()
    {
        let counter = 0;
        let fileExists = true;
        let path = "";
        const urls = [];
        while(fileExists)
        {
            path = this.getFilePath(this.filename + "_" + counter, "txt", "questions");
            fileExists = this.fileExists(path);
            counter++;
            if(!fileExists) { break; }
            urls.push(path);
        }

        const promises = [];
        for(const url of urls)
        {
            promises.push(this.loadTextFile(url));
        }
        await Promise.all(promises);
        
        const data = parseQuestionsIntoList(this.cache);
        this.ensureQuestionValidity(data);
        this.ensureMediaValidity(data);

        this.data = data;
        return data;
    }

    async loadTextFile(url:string)
    {
        if(this.inCache(url)) { return; }
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);

            xhr.onerror = (ev) => { resolve(false); }
            xhr.onloadend = () => {
                if(xhr.status == 404) { resolve(false); return; }
                if(xhr.status == 200) {
                    this.onTextFileLoaded(url, xhr.response);
                    resolve(true);
                }
            };

            xhr.send();
        });
    }

    onTextFileLoaded(url: string, data: string)
    {
        const questions = parseTextFile(data, this.params);
        this.addToCache(url, questions);
    }

    inCache(url:string)
    {
        return url in this.cache;
    }

    addToCache(url: string, data:Question[])
    {
        this.cache[url] = data;
    }   

    getFilePath(name:string, ext = "txt", sub = "media")
    {
        let base = this.url + (this.subfolders[sub] ?? "") + name;
        if(isExternalURL(name)) { base = name; }

        if(ext.length <= 0) { return base; }
        return base + "." + ext;
    }

    fileExists(url:string) 
    {
        var req = new XMLHttpRequest();
        req.open('HEAD', url, false);
        req.send();
        return req.status !== 404;
    }

    ensureQuestionValidity(questions:Question[])
    {
        for(const q of questions)
        {
            const score = q.score as number;
            if(score > this.maxScore || score <= 0)
            {
                console.error("Question has a score that's too high or too low: " + score, q);
            }
        }
    }

    // @NOTE: Also updates urls to full, correct ones
    ensureMediaValidity(questions:Question[])
    {
        for(const elem of questions)
        {
            this.ensurePathValidity(elem, "media");
            this.ensurePathValidity(elem, "answers");
        }
    }

    ensurePathValidity(q:Question, prop:string)
    {
        const newList = [];
        for(const elem of q[prop])
        {
            const path = this.getFilePath(elem, "", "media");
            const isMedia = isValidMediaType(parseExtension(path));
            let newValue = isMedia ? path : elem;
            if(isMedia && !this.fileExists(path))
            {
                console.error("Media doesn't exist: " + path);
            }
            newList.push(newValue);
        }
        q[prop] = newList;
    }
}