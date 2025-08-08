import {AbstractTrigger} from "./AbstractTrigger.ts";
import Constants from "../../../Classes/Constants.ts";
import {Enlist} from "../../Decorators.ts";
import {IAbstractNodeHandle} from "../AbstractNode.ts";

@Enlist()
export default class TriggerTwitchChat extends AbstractTrigger {
    __nodeText(): string {
        throw new Error("Method not implemented.");
    }
    __nodeTopHandles(): IAbstractNodeHandle[] {
        return []
    }
    __nodeBottomHandles(): IAbstractNodeHandle[] {
        return [{
            type: Constants.nodeHandleIds.text
        }]
    }

}