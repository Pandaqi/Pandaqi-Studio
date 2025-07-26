const isValidHex = (hex) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)

const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, "g"))

const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16)

const getAlphaFloat = (a, alpha) => {
    if (typeof a !== "undefined") { return a / 255 }
    if ((typeof alpha != "number") || alpha <0 || alpha >1) { return 1 }
    return alpha
}

export default (hex, alpha) => {
    //if(hex.length == 7) { hex += "FF"; }
    //if(hex.length == 3) { hex += "F"; }

    if (!isValidHex(hex)) {throw new Error("Invalid HEX")}
    const chunkSize = Math.floor((hex.length - 1) / 3)
    const hexArr = getChunksFromString(hex.slice(1), chunkSize)
    const [r, g, b, alp] = hexArr.map(convertHexUnitTo256)
    const a = getAlphaFloat(alp, alpha);
    return [r, g, b, a];
}