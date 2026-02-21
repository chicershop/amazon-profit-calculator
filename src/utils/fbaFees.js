/**
 * Amazon FBA 配送代行手数料の自動計算
 * 出典: https://sell.amazon.co.jp/pricing#fulfillment-fees
 * 寸法は必ず「縦・横・高さ」の順（料金表の左から順）。重量はkg。
 * 小型・標準-1: 縦・横・高さをそれぞれ上限と比較。標準-2〜8・大型・特大型: 最長辺（cm）で区分。
 */

/**
 * サイズ区分ごとのFBA配送代行手数料（円）
 * [価格1000円超, 価格1000円以下]
 * 判定は上から順に行い、最初に該当した区分を適用する。
 * check(l, w, h, weight) の l,w,h は 縦・横・高さ の順。
 */
const FBA_TIERS = [
  // 小型: 縦25cm x 横18cm x 高さ2.0cm 以下、250g以下（料金表の寸法は左から縦・横・高さ）
  {
    name: '小型',
    check: (l, w, h, weight) => l <= 25 && w <= 18 && h <= 2 && weight <= 0.25,
    feeOver1000: 288,
    fee1000OrLess: 222,
  },
  // 標準-1: 縦35cm x 横30cm x 高さ3.3cm 以下、1kg以下（料金表の寸法は左から縦・横・高さ）
  {
    name: '標準-1',
    check: (l, w, h, weight) => l <= 35 && w <= 30 && h <= 3.3 && weight <= 1,
    feeOver1000: 318,
    fee1000OrLess: 252,
  },
  // 標準-2〜8: 最長辺○cm以下、重量kg以下（公式FBA料金表の「標準」に準拠）
  { name: '標準-2', check: (l, w, h, wgt) => Math.max(l, w, h) <= 20 && wgt <= 2, feeOver1000: 413, fee1000OrLess: 347 },
  { name: '標準-3', check: (l, w, h, wgt) => Math.max(l, w, h) <= 30 && wgt <= 2, feeOver1000: 434, fee1000OrLess: 368 },
  { name: '標準-4', check: (l, w, h, wgt) => Math.max(l, w, h) <= 40 && wgt <= 2, feeOver1000: 455, fee1000OrLess: 389 },
  { name: '標準-5', check: (l, w, h, wgt) => Math.max(l, w, h) <= 50 && wgt <= 2, feeOver1000: 465, fee1000OrLess: 399 },
  { name: '標準-6', check: (l, w, h, wgt) => Math.max(l, w, h) <= 60 && wgt <= 2, feeOver1000: 485, fee1000OrLess: 419 },
  { name: '標準-7', check: (l, w, h, wgt) => Math.max(l, w, h) <= 80 && wgt <= 5, feeOver1000: 514, fee1000OrLess: 448 },
  { name: '標準-8', check: (l, w, h, wgt) => Math.max(l, w, h) <= 100 && wgt <= 9, feeOver1000: 532, fee1000OrLess: 466 },
  // 大型: 最長辺cm以下、重量kg以下
  { name: '大型-1', check: (l, w, h, wgt) => Math.max(l, w, h) <= 60 && wgt <= 2, feeOver1000: 589, fee1000OrLess: 523 },
  { name: '大型-2', check: (l, w, h, wgt) => Math.max(l, w, h) <= 80 && wgt <= 5, feeOver1000: 624, fee1000OrLess: 558 },
  { name: '大型-3', check: (l, w, h, wgt) => Math.max(l, w, h) <= 100 && wgt <= 10, feeOver1000: 675, fee1000OrLess: 609 },
  { name: '大型-4', check: (l, w, h, wgt) => Math.max(l, w, h) <= 120 && wgt <= 15, feeOver1000: 781, fee1000OrLess: 715 },
  { name: '大型-5', check: (l, w, h, wgt) => Math.max(l, w, h) <= 140 && wgt <= 20, feeOver1000: 1020, fee1000OrLess: 954 },
  { name: '大型-6', check: (l, w, h, wgt) => Math.max(l, w, h) <= 160 && wgt <= 25, feeOver1000: 1100, fee1000OrLess: 1034 },
  { name: '大型-7', check: (l, w, h, wgt) => Math.max(l, w, h) <= 180 && wgt <= 30, feeOver1000: 1532, fee1000OrLess: 1466 },
  { name: '大型-8', check: (l, w, h, wgt) => Math.max(l, w, h) <= 200 && wgt <= 40, feeOver1000: 1756, fee1000OrLess: 1690 },
  // 特大型: 最長辺cm以下、50kg以下
  { name: '特大型-1', check: (l, w, h, wgt) => Math.max(l, w, h) <= 200 && wgt <= 50, feeOver1000: 2755, fee1000OrLess: 2689 },
  { name: '特大型-2', check: (l, w, h, wgt) => Math.max(l, w, h) <= 220 && wgt <= 50, feeOver1000: 3573, fee1000OrLess: 3507 },
  { name: '特大型-3', check: (l, w, h, wgt) => Math.max(l, w, h) <= 240 && wgt <= 50, feeOver1000: 4496, fee1000OrLess: 4430 },
  { name: '特大型-4', check: (l, w, h, wgt) => Math.max(l, w, h) <= 260 && wgt <= 50, feeOver1000: 5625, fee1000OrLess: 5559 },
];

/**
 * FBA配送代行手数料を計算する
 * 寸法は料金表に合わせ「縦・横・高さ」の順で渡すこと。
 * @param {number} length - 縦（cm）
 * @param {number} width - 横（cm）
 * @param {number} height - 高さ（cm）
 * @param {number} weight - 重量（kg）
 * @param {number} sellingPrice - 販売価格（円）。1000円超で手数料が異なる
 * @returns {{ fee: number, tierName: string } | null} 該当する場合のみ返す
 */
export const calculateFbaFee = (length, width, height, weight, sellingPrice) => {
  const l = Number(length);
  const w = Number(width);
  const h = Number(height);
  const wgt = Number(weight);
  if ([l, w, h, wgt].some(v => isNaN(v) || v < 0)) return null;

  const over1000 = Number(sellingPrice) > 1000;
  for (const tier of FBA_TIERS) {
    if (tier.check(l, w, h, wgt)) {
      const fee = over1000 ? tier.feeOver1000 : tier.fee1000OrLess;
      return { fee, tierName: tier.name };
    }
  }
  const last = FBA_TIERS[FBA_TIERS.length - 1];
  const fee = over1000 ? last.feeOver1000 : last.fee1000OrLess;
  return { fee, tierName: '該当なし（目安: 特大型）' };
};
