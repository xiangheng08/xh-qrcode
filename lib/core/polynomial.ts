import * as GF from './galois-field';

/**
 * 在伽罗瓦域中将两个多项式相乘
 *
 * @param  p1 多项式
 * @param  p2 多项式
 * @return    p1和p2的乘积
 */
export function mul(p1: Uint8Array, p2: Uint8Array): Uint8Array {
  const coeff = new Uint8Array(p1.length + p2.length - 1);

  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      coeff[i + j] ^= GF.mul(p1[i], p2[j]);
    }
  }

  return coeff;
}

/**
 * 计算多项式除法的余数
 *
 * @param  divident 多项式
 * @param  divisor  多项式
 * @return          余数
 */
export function mod(divident: Uint8Array, divisor: Uint8Array): Uint8Array {
  let result = new Uint8Array(divident);

  while ((result.length - divisor.length) >= 0) {
    const coeff = result[0];

    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= GF.mul(divisor[i], coeff);
    }

    // 从缓冲区头部移除所有零
    let offset = 0;
    while (offset < result.length && result[offset] === 0) offset++;
    result = result.slice(offset);
  }

  return result;
}

/**
 * 生成指定次数的不可约生成多项式
 * (用于Reed-Solomon编码器)
 *
 * @param  degree 生成多项式的次数
 * @return        包含多项式系数的缓冲区
 */
export function generateECPolynomial(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = mul(poly, new Uint8Array([1, GF.exp(i)]));
  }

  return poly;
}