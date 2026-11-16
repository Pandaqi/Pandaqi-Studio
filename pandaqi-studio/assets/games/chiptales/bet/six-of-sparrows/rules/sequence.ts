export default class Sequence
{
    numbers: number[] = [];

    count()
    {
        return this.numbers.length;
    }

    has(n:number)
    {
        return this.numbers.includes(n);
    }

    add(n:number)
    {
        this.numbers.push(n);
    }
}