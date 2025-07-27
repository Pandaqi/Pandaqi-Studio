export const loadFile = async (url:string) : Promise<string> =>
{        
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.onerror = (ev) => { resolve(""); }
        xhr.onloadend = () => {
            if(xhr.status == 404) { resolve(""); return; }
            if(xhr.status == 200) {
                resolve(xhr.response);
            }
        };

        xhr.send();
    });
}