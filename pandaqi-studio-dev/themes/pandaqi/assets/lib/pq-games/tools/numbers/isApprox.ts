import isZero from "./isZero";

export default (num:number, target:number) =>
{
    return isZero(num - target);
}