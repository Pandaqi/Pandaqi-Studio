import { showMessage } from "./errorHandler";
import { isExternalURL, isValidMediaType, parseExtension, parseQuestionsIntoList, parseRawFile, parseFileString, parseFileObject } from "./parser";
import Question from "./question";
import { QuizParams } from "./quiz";

const BASE_URL = "/pub-quiz/";
const QUESTION_FILE_NAME_PATTERN = "questions";
const MAX_SCORE = 5;
const DEF_FILE_EXTENSIONS = ["txt"];
const VALID_FILE_EXTENSIONS = ["txt", "md", "json"]; //["txt", "md", "doc", "docx", "pdf", "json"];
const SUB_FOLDERS = {
    media: "media/",
    questions: "questions/"
}

export default class Loader
{
    params: QuizParams;
    url: string;
    filename: string;
    filenames: string[];
    fileExtensions: string[];
    cache: Record<string, Question[]>
    maxScore: number;
    data: Question[];
    subFolders: { media: string, questions: string }
    id: string;

    constructor(params:QuizParams = {})
    {
        this.params = params;
        this.url = params.url ?? BASE_URL;
        this.maxScore = params.maxScore ?? MAX_SCORE;
        this.filename = params.filename ?? QUESTION_FILE_NAME_PATTERN;
        this.filenames = params.filenames ?? [];
        this.fileExtensions = params.fileExtensions ?? DEF_FILE_EXTENSIONS;
        this.id = params.id;
        this.ensureFileExtensionValidity();

        this.subFolders = Object.assign(structuredClone(SUB_FOLDERS), params.subFolders);
        this.ensureSubFolderValidity();

        this.cache = {};
    }

    getData() { return this.data; }
    getCache() { return this.cache; }

    // Loads files with <NAME>_<IDX>, index from 0 and upwards, until it can't find the next one anymore
    async load()
    {
        const urls = this.getURLsToLoad("questions");

        const promises = [];
        for(const url of urls)
        {
            promises.push(this.loadFile(url));
        }
        await Promise.all(promises);
        
        const data = parseQuestionsIntoList(this.cache);
        this.ensureQuestionValidity(data);
        this.ensureMediaValidity(data);

        this.data = data;
        return data;
    }

    getURLsToLoad(type = "questions")
    {
        if(this.filenames.length > 0) { return this.getURLsFixed(type); }
        return this.getURLsInSequence(type);
    }

    getURLsFixed(type = "questions")
    {
        const arr = [];
        for(const name of this.filenames)
        {
            const path = this.getFilePath(name, "txt", type);
            const fileExists = this.fileExists(path);
            if(!fileExists) { break; }
            arr.push(path);
        }
        return arr;
    }

    getURLsInSequence(type = "questions")
    {   
        let counter = 0;
        let fileExists = true;
        const arr = [];
        while(fileExists)
        {
            let path = "";
            let foundFile = false;
            for(const extension of this.fileExtensions)
            {
                path = this.getFilePath(this.filename + "_" + counter, extension, type);
                fileExists = this.fileExists(path);
                if(fileExists) { foundFile = true; break; }
            }

            counter++;
            if(!foundFile) { break; }
            arr.push(path);
        }
        return arr;
    }

    async loadFile(url:string)
    {
        if(this.inCache(url)) { return; }
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);

            xhr.onerror = (ev) => { resolve(false); }
            xhr.onloadend = async () => {
                if(xhr.status == 404) { resolve(false); return; }
                if(xhr.status == 200) {
                    await this.onFileLoaded(url, xhr.response);
                    resolve(true);
                }
            };

            xhr.send();
        });
    }

    async onFileLoaded(url: string, data: string)
    {
        const dataParsed = await parseRawFile(url, data);
        let questions;
        if(typeof dataParsed === "object") {
            questions = parseFileObject(url, dataParsed, this.params);
        } else {
            questions = parseFileString(url, dataParsed, this.params);
        }
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
        let base = this.url + (this.subFolders[sub] ?? "") + name;
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
            const score = parseInt(q.score.get());
            if(score > this.maxScore || score <= 0)
            {
                showMessage(["Question has a score that's too high or too low: " + score, q], this.id);
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
            const val = elem.get();
            const path = this.getFilePath(val, "", "media");
            const isMedia = isValidMediaType(parseExtension(path));
            let newValue = isMedia ? path : val;
            if(isMedia && !this.fileExists(path))
            {
                showMessage(["Media doesn't exist: " + path], this.id);
            }

            elem.set(newValue);
            newList.push(elem);
        }
        q[prop] = newList;
    }

    ensureSubFolderValidity()
    {
        for(const [key,data] of Object.entries(this.subFolders))
        {
            const lastChar = data.charAt(data.length-1);
            if(lastChar != "/") { this.subFolders[key] = data + "/"; }
        }
    }

    ensureFileExtensionValidity()
    {
        const arr = [];
        for(const ext of this.fileExtensions)
        {
            if(!VALID_FILE_EXTENSIONS.includes(ext)) { continue; }
            arr.push(ext);
        }
        this.fileExtensions = arr;
    }
}