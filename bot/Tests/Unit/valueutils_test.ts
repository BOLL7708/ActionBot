import {assert, assertEquals} from 'jsr:@std/assert'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import Test from '../../Utils/Test.ts'

Test.run('value utils', async () => {
    const value = 'test value'

    // B64
    const b64Encoded = ValueUtils.safeBase64Encode(value)
    const b64Decoded = ValueUtils.safeBase64Decode(b64Encoded ?? '')
    assert(!ValueUtils.isBlank(b64Encoded))
    assert(!ValueUtils.isBlank(b64Decoded))
    assertEquals(value, b64Decoded)

    // B64 URL
    const b64UrlEncoded = ValueUtils.safeBase64UrlEncode(value)
    const b64UrlDecoded = ValueUtils.safeBase64UrlDecode(b64UrlEncoded ?? '')
    assert(!ValueUtils.isBlank(b64UrlEncoded))
    assert(!ValueUtils.isBlank(b64UrlDecoded))
    assertEquals(value, b64UrlDecoded)

    // Password & Salt
    const salt = ValueUtils.generateSalt()
    const saltStr = ValueUtils.encodeBytes(salt, true)
    const password = 'test password'
    const hash1 = await ValueUtils.hashPassword(password, salt)
    const hash2 = await ValueUtils.hashPassword(password, ValueUtils.decodeBytes(saltStr))
    assert(!ValueUtils.isBlank(hash1))
    assert(!ValueUtils.isBlank(hash2))
    assertEquals(hash1, hash2)

    // Match type
    // string
    assertEquals(ValueUtils.tryToMatchTypes('test', 'cake'), 'cake')
    assertEquals(ValueUtils.tryToMatchTypes('test', 100), '100')
    assertEquals(ValueUtils.tryToMatchTypes('test', true), 'true')
    assertEquals(ValueUtils.tryToMatchTypes('test', [100, 200]), '100,200')
    assertEquals(ValueUtils.tryToMatchTypes('test', {one: 1}), '{"one":1}')
    // number
    assertEquals(ValueUtils.tryToMatchTypes(100, 200), 200)
    assertEquals(ValueUtils.tryToMatchTypes(100, '200'), 200)
    assertEquals(ValueUtils.tryToMatchTypes(100, true), 1)
    assertEquals(ValueUtils.tryToMatchTypes(100, [100, 200]), 2) // Becomes array length
    assertEquals(ValueUtils.tryToMatchTypes(100, {one: 1, two: 2}), 2) // Becomes object property key count
    // boolean
    assertEquals(ValueUtils.tryToMatchTypes(true, false), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, 0), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, 1), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, 'false'), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, 'f'), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, '0'), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, 'no'), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, ''), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, 'true'), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, 't'), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, '1'), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, 'ok'), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, 'random'), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, []), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, ['random']), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, {one: 'random'}), true)
    assertEquals(ValueUtils.tryToMatchTypes(true, null), false)
    assertEquals(ValueUtils.tryToMatchTypes(true, undefined), false)
    // array
    assertEquals(ValueUtils.tryToMatchTypes([], [1, 2, 3]), [1, 2, 3])
    assertEquals(ValueUtils.tryToMatchTypes([], {one: 1, two: 2}), [1, 2])
    // object
    assertEquals(ValueUtils.tryToMatchTypes({}, {one: 1, two: 2}), {one: 1, two: 2})
    assertEquals(ValueUtils.tryToMatchTypes({}, [1, 2, 3]), {'0': 1, '1': 2, '2': 3})
    // null
    assertEquals(ValueUtils.tryToMatchTypes(null, []), undefined)
})