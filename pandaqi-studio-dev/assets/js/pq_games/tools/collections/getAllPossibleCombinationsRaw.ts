export default (set:any[]) =>
{
    const num = set.length;
    const possibleCombos = Math.pow(2, num);
    const allCombos = [];
    for (var i = 0; i < possibleCombos; i++){

        let combo = [];
        for (var j = 0; j < num; j++) {
            if (!(i & Math.pow(2,j))) { continue; } // not part of this combination
            combo.push(set[j]);
        }
        if(combo.length <= 0) { continue; }

        allCombos.push(combo);
    }
    return allCombos;
}