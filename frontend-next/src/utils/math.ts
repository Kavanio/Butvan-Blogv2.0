/**
 * 数学几何算法：复古邮票穿孔齿孔 SVG 路径生成器
 */

export function generateStampPerforationPath(width: number, height: number): string {
  const scale = Math.sqrt(width / 92);
  const radius = 5 * scale;
  const step = 15 * scale;

  const getPoints = (dimension: number) => {
    const count = Math.max(1, Math.floor((dimension - step) / step));
    const start = (dimension - (count - 1) * step) / 2;
    return Array.from({ length: count }, (_, idx) => start + idx * step);
  };

  let path = "M 0 0 ";

  // 顶边穿孔
  for (const x of getPoints(width)) {
    path += `L ${x - radius} 0 A ${radius} ${radius} 0 0 0 ${x + radius} 0 `;
  }
  path += `L ${width} 0 `;

  // 右边穿孔
  for (const y of getPoints(height)) {
    path += `L ${width} ${y - radius} A ${radius} ${radius} 0 0 0 ${width} ${y + radius} `;
  }
  path += `L ${width} ${height} `;

  // 底边穿孔
  for (const x of [...getPoints(width)].reverse()) {
    path += `L ${x + radius} ${height} A ${radius} ${radius} 0 0 0 ${x - radius} ${height} `;
  }
  path += `L 0 ${height} `;

  // 左边穿孔
  for (const y of [...getPoints(height)].reverse()) {
    path += `L 0 ${y + radius} A ${radius} ${radius} 0 0 0 0 ${y - radius} `;
  }
  path += "Z";

  return path;
}
