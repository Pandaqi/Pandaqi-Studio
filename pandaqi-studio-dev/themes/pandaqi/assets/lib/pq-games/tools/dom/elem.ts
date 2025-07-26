export default (type:string, classes:string[] = [], inner = "") =>
{
    const elem = document.createElement(type);
    elem.classList.add(...classes);
    elem.innerHTML = inner;
    return elem;
}