import '../Runners/index.ts' // This is required so the prototypes get extended.
import {assert, assertEquals} from 'jsr:@std/assert'
import {ELogLevel, EnlistData} from '../../lib/index.ts'
import Log from '../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.ts'
import DatabaseHelper from '../Helpers/DatabaseHelper.ts'
import TestUtils from '../Utils/TestUtils.ts'

Deno.test('init', async () => {
    EnlistData.run()

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
})