export default <T>(a:T[], b:T[]) : boolean =>
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