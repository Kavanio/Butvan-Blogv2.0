/**
 * 哈希与字符计算算法工具
 */

export function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

/**
 * 依据标题字符编码计算唯一的确定性微倾斜角度（-3deg ~ 3deg）
 */
export function getTitleTilt(title: string): string {
  const hash = stringHash(title);
  const degree = (hash % 14 - 7) % 7 - 3;
  return `${degree}deg`;
}
