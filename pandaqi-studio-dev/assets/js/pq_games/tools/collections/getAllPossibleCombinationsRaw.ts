export default <T>(set:T[]) =>
{
    const num = set.length;
    const possibleCombos = Math.pow(2, num);
    const allCombos:T[][] = [];
    for (var i = 0; i < possibleCombos; i++){

        let combo:T[] = [];
        for (var j = 0; j < num; j++) {
            if (!(i & Math.pow(2,j))) { continue; } // not part of this combination
            combo.push(set[j]);
        }
        if(combo.length <= 0) { continue; }

        allCombos.push(combo);
    }
    return allCombos;
}