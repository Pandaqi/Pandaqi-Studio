import Container from "../containers/container";
import ContainerImage from "../containers/containerImage";
import ContainerText from "../containers/containerText";
import ResourceLoader from "../resources/resourceLoader";
import TextConfig, { TextAlign } from "../text/textConfig";
import AlignValue from "../values/alignValue";
import AnchorValue from "../values/anchorValue";
import { FlowDir, FlowType } from "../values/flowInput";
import SizeValue, { SizeType } from "../values/sizeValue";
import TwoAxisValue from "../values/twoAxisValue";

const resLoader = new ResourceLoader();

function testLayoutSystem()
{
    const subContainer = new Container({
        size: new TwoAxisValue(new SizeValue(1.0, SizeType.PARENT), 300.0)
    })
    this.container.addChild(subContainer);

    const iconResource = resLoader.getResource("icons");
    const size = 0.15*this.sizeUnit;
    const iconContainer = new ContainerImage({
        resource: iconResource,
        frame: this.getIconFrame(this.getMainIcon()),
        size: new TwoAxisValue().fromSingle(size),
        padding: 10,
        anchor: AnchorValue.CENTER_RIGHT
    })
    subContainer.addChild(iconContainer);

    const txt = new ContainerText({
        resource: iconResource,
        text: "Test, test, test",
        padding: 10,
        textConfig: new TextConfig({
            font: "Comica Boom",
            size: 36,
            alignVertical: TextAlign.MIDDLE
        }),
        size: new TwoAxisValue(200, new SizeValue(0.5, SizeType.PARENT)),
        anchor: AnchorValue.CENTER_CENTER
    })
    subContainer.addChild(txt);

    // FLEX/FLOW CONTAINERS!
    const padding = 0.05*this.sizeUnit
    const icons = new Container({
        padding: padding,
        size: new TwoAxisValue().setBlock(),
        dir: FlowDir.HORIZONTAL,
        alignFlow: AlignValue.MIDDLE, 
        alignStack: AlignValue.MIDDLE,
        gap: 15,
        flow: FlowType.GRID
    })
    this.container.addChild(icons);

    let iconSize = 0.2*this.sizeUnit;
    for(const type of this.typeList)
    {
        const cont = new ContainerImage({
            resource: iconResource,
            frame: this.getIconFrame(type),
            size: new TwoAxisValue().fromSingle(iconSize)
        })
        icons.addChild(cont);
        iconSize *= 0.5;

    }
}