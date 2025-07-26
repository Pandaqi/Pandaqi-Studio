import DecisionNode from "./decisionNode"
import DecisionNodeTree from "./decisionNodeTree";

const NEW_NODE_ID = "label";
const LINE_SPLIT_SYMBOL = "=";
const CONTINUE_PROP_SYMBOL = "*";

const parseString = (s:string) : DecisionNode[] =>
{
    const lines = s.split(/\r?\n/)

    let curNode : DecisionNode = null;
    let curProp : string = null;
    const nodes = [];
    for(const line of lines)
    {
        const emptyLine = line.length <= 0;
        if(emptyLine) { continue; }

        let parts = line.split(LINE_SPLIT_SYMBOL);
        parts = parts.map(s => s.trim());

        const invalid = parts.length != 2;
        if(invalid)
        {
            console.error("Can't parse invalid line: " + line);
            continue;
        }

        const continueCurProp = parts[0].charAt(0) == CONTINUE_PROP_SYMBOL;
        if(continueCurProp)
        {
            if(!curNode) { console.error("Can't continue property because no question started: ", parts); continue; }
            parts[0] = parts[0].slice(1, parts[0].length).trim(); // cut off continue symbol and trim again
            curNode.updatePropertyMultiple(curProp, parts);
            continue;
        }

        parts[0] = parts[0].toLowerCase();
        curProp = parts[0];

        const startNewNode = curProp == NEW_NODE_ID;
        if(startNewNode)
        {
            const mustSavePrevNode = curNode != null && curNode.isValid();
            if(mustSavePrevNode) { curNode.finalize(); nodes.push(curNode); }
            curNode = new DecisionNode();
        }
        
        curNode.updateProperty(curProp, parts[1]);
    }

    if(curNode.isValid()) 
    { 
        curNode.finalize();
        nodes.push(curNode); 
    }

    return nodes;
}

const parseNodesIntoTree = (nodes:DecisionNode[]) =>
{
    // turn into dictionary with label keys, for quick access to all nodes
    const nodeReference : Record<string, DecisionNode> = {};
    const treeNodeReference : Record<string, DecisionNodeTree> = {};
    for(const node of nodes)
    {
        nodeReference[node.label] = node;

        const treeNode = new DecisionNodeTree();
        treeNodeReference[node.label] = treeNode;
    }

    for(const node of Object.values(nodeReference))
    {
        // for all nodes, save their children (and save the inverse direction; they're their parent)
        const treeNode = treeNodeReference[node.label];
        for(const [text,label] of Object.entries(node.paths))
        {
            const childNode = treeNodeReference[label];
            if(!childNode)
            {
                console.error("Can't add non-existent child node with label "  + label + " to parent ", treeNode);
                continue;
            }

            childNode.addParent(treeNode);
            treeNode.addChild(childNode, text);
        }

        // and copy/clone any other data from the original node
        treeNode.copy(node);
    }

    // find the node with no inbound connections: that's the root of the tree
    let rootNodes = [];
    for(const node of Object.values(treeNodeReference))
    {
        if(node.countParents() > 0) { continue; }
        rootNodes.push(node);
    }

    if(rootNodes.length <= 0)
    {
        console.error("No root nodes for decision tree!");
        return null;
    }

    if(rootNodes.length > 1)
    {
        console.error("Multiple root nodes for decision tree!", rootNodes);
        return null;
    }

    return rootNodes[0];
}

export
{
    parseString,
    parseNodesIntoTree
}