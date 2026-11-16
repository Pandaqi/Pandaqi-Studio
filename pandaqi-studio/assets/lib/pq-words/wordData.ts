export class WordMetadata 
{
    type: string;
    level: string;
    cat: string;
    subcat: string;

    set(type: string, level: string, cat: string, subcat: string)
    {
        this.type = type;
        this.level = level;
        this.cat = cat;
        this.subcat = subcat;
    }

    setFromObject(obj)
    {
        this.set(obj.type, obj.level, obj.cat, obj.subcat);
    }

    getCategory()
    {
        return this.cat
    }

    getSubCategory()
    {
        return this.subcat;
    }

    getFullCategory(nice = true)
    {
        let str = this.cat
        if(this.subcat != "general") { 
            if(nice) { str += " (" + this.subcat + ")"; }
            else { str += "_" + this.subcat; }
        }
        return str;
    }

    prettyPrint()
    {
        return [this.type, this.level, this.cat, this.subcat].join(", ");
    }
}

export class WordData 
{
    word: string;
    metadata: WordMetadata;

    constructor()
    {
        this.word = "";
        this.metadata = null;
    }

    is(word:string) { return this.word == word; }
    setWord(word:string) { this.word = word; }
    getWord() { return this.word; }
    setMetadata(md:WordMetadata) {  this.metadata = md; }
    getMetadata() { return this.metadata; }
}

export class WordDataList 
{
    words: string[];
    metadata: WordMetadata;

    constructor() 
    {
        this.words = [];
        this.metadata = null;
    }

    setMetadata(md:WordMetadata) { this.metadata = md; }
    setWords(words:string[]) { this.words = words; }
    splitWordsIntoSeparateEntries()
    {
        const arr = [];
        for(const wordData of this.words)
        {
            const data = new WordData();
            data.setWord(wordData);

            const md = new WordMetadata();
            data.setMetadata(this.metadata);
            arr.push(data);
        }
        return arr;
    }
}