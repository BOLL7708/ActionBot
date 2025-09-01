import {type OnDelete} from '@xyflow/svelte'

export type DoCreateNode = (type: string, xPos: number, yPos: number) => void
export type ToggleInput = (state: boolean) => void
export default class Session {
    static editorFlowDragAndDropType: string = ''
    static editorDoCreateNode: DoCreateNode = () => {
    }
    static editorOnDelete: OnDelete = () => {
    }
    static colorMode: 'system' | 'light' | 'dark' = 'system'
    static toggleInput: ToggleInput = () => {
    }
}