import {AbstractItem} from '../AbstractItem.ts'

/**
 * Nodes are objects that will be present in the Event Node Editor.
 */
export abstract class AbstractNode extends AbstractItem {
    abstract __nodeTitle(): string
    abstract __nodeText(): string
    abstract __nodeColor(): string
    // TODO: Handles?
}