import {type OnDelete} from '@xyflow/svelte'

export type DoCreateNode = (type: string, xPos: number, yPos: number) => void
export default class Session {
    static editorFlowDragAndDropType: string = ''
    static editorDoCreateNode: DoCreateNode = () => {
    }
    static editorOnDelete: OnDelete = () => {
    }
}