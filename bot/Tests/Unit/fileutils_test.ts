import {assert, assertEquals} from 'jsr:@std/assert'
import {assertFalse} from 'jsr:@std/assert/false'
import FileUtils from '../../DenoUtils/FileUtils.ts'
import Test from '../../Utils/Test.ts'

Test.run('read, write, copy, delete text from/to disk', () => {
    const text = '# Title\nThis is some text content! 😛'
    const filepath = '../_test/text_txt.md'
    const readEmpty = FileUtils.readText(filepath)
    assertFalse(readEmpty)
    const written = FileUtils.writeText(filepath, text)
    assert(written)
    const text2 = FileUtils.readText(filepath)
    assertEquals(text, text2)
    const copyPath = '../_test/text_copy.md'
    const copied = FileUtils.copy(filepath, copyPath)
    assert(FileUtils.exists(filepath))
    assert(FileUtils.exists(copyPath))
    assertFalse(FileUtils.exists('../_random/nothing'))
    assert(copied)
    const deleted = FileUtils.remove(filepath)
    assert(deleted)
    const deletedCopy = FileUtils.remove(copyPath)
    assert(deletedCopy)
})