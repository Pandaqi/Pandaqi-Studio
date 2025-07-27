import addPrinceDataToNode from "./addPrinceDataToNode";
import { PackData } from "./dictShared";

export default (packDict:Record<string, PackData>) =>
{
    console.log(packDict);

    const princeInfos = Array.from(document.getElementsByClassName("prince-info")) as HTMLElement[];
    for(const infoNode of princeInfos)
    {
        const princeName = infoNode.dataset.prince ?? "lionsyre"
        console.log(princeName);
        const data = packDict[princeName]
        addPrinceDataToNode(infoNode, data)
    }
}

