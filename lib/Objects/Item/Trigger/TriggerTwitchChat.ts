import {AbstractTrigger} from "./AbstractTrigger.ts";
import Constants from "../../../Classes/Constants.ts";
import {Enlist, HandleOut} from "../../Decorators.ts";

@Enlist()
@HandleOut({id: 1, type: Constants.nodeHandleTypes.text})
export default class TriggerTwitchChat extends AbstractTrigger {
    __nodeText(): string {
        throw new Error("Method not implemented.");
    }
}