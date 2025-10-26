const EXP_TABLE = new Uint8Array(512)
const LOG_TABLE = new Uint8Array(256)

/**
 * 预计算对数和反对数表以加快后续计算
 *
 * 对于伽罗瓦域2^8中的每个可能值，我们将预计算该值的对数和反对数(指数)
 *
 * 参考 {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Introduction_to_mathematical_fields}
 */
;(function initTables() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x
    LOG_TABLE[x] = i

    x <<= 1 // 乘以2

    // QR码规范要求使用按字节模100011101运算。
    // 这意味着当数字大于等于256时，应与0x11D进行异或运算。
    if (x & 0x100) {
      // 类似于 x >= 256，但更快 (因为 0x100 == 256)
      x ^= 0x11d
    }
  }

  // 优化：将反对数表的大小加倍，这样就不需要对255取模来
  // 保持在边界内(因为我们主要使用此表进行两个伽罗瓦域数字的乘法运算)。
  // @see {@link mul}
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255]
  }
})()

/**
 * 返回伽罗瓦域中n的对数值
 *
 * @param  n
 * @return
 */
export function log(n: number): number {
  if (n < 1) throw new Error('log(' + n + ')')
  return LOG_TABLE[n]
}

/**
 * 返回伽罗瓦域中n的反对数值
 *
 * @param  n
 * @return
 */
export function exp(n: number): number {
  return EXP_TABLE[n]
}

/**
 * 在伽罗瓦域中将两个数相乘
 *
 * @param  x
 * @param  y
 * @return
 */
export function mul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0

  // 如果EXP_TABLE没有超量分配，应该是 EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255]
  // @see {@link initTables}
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
}
