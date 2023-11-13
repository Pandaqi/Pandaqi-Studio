export default (a:any[], b:any[]) =>
{
    for(const elemA of a)
    {
        for(const elemB of b)
        {
            if(elemA == elemB) { return true; }
        }
    }
    return false;
}