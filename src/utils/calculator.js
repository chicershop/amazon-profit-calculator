/**
 * 利益計算ロジック
 */

/**
 * 容積重量を計算する
 * @param {number} length - 縦 (cm)
 * @param {number} width - 横 (cm)
 * @param {number} height - 高さ (cm)
 * @returns {number} 容積重量 (kg)
 */
export const calculateVolumetricWeight = (length, width, height) => {
  return (length * width * height) / 6000;
};

/**
 * 利益計算を行う
 * @param {Object} params - 計算パラメータ
 * @returns {Object} 計算結果
 */
export const calculateProfit = (params) => {
  const {
    productCost,        // 商品原価（元）
    sellingPrice,       // 販売価格（円）
    length,             // 縦 (cm)
    width,              // 横 (cm)
    height,             // 高さ (cm)
    weight,             // 重量 (kg)
    salesFee,           // 販売手数料（円）
    storageFee,         // 在庫保管手数料（円）
    fbaFee,             // FBA配送代行手数料（円）
    optionCost,         // オプション費用（元）
    shippingRate,       // 国際配送単価（元/kg）
    tariffRate,         // 関税率
    exchangeRate,       // 為替レート（円/元）
  } = params;

  // ① 原価 + オプション費用（元）
  const costWithOption = productCost + optionCost;

  // ② 容積重量と国際配送料
  const volumetricWeight = calculateVolumetricWeight(length, width, height);
  const chargeableWeight = Math.max(weight, volumetricWeight);
  const internationalShipping = chargeableWeight * shippingRate;

  // ③ 関税費用（元）
  const tariffCost = (costWithOption + internationalShipping) * tariffRate;

  // ④ 仕入れ総コスト（円）
  const totalProcurementCostYuan = costWithOption + internationalShipping + tariffCost;
  const totalProcurementCostYen = totalProcurementCostYuan * exchangeRate;

  // ⑤ Amazon手数料（円）
  const amazonFees = salesFee + storageFee + fbaFee;

  // ⑥ 総コスト（円）
  const totalCost = totalProcurementCostYen + amazonFees;

  // 粗利益（円）
  const grossProfit = sellingPrice - totalCost;

  // 粗利益率（%）
  const grossProfitRate = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

  return {
    // 計算中間値
    costWithOption: Math.round(costWithOption * 100) / 100,
    volumetricWeight: Math.round(volumetricWeight * 1000) / 1000,
    chargeableWeight: Math.round(chargeableWeight * 1000) / 1000,
    internationalShipping: Math.round(internationalShipping * 100) / 100,
    tariffCost: Math.round(tariffCost * 100) / 100,
    totalProcurementCostYuan: Math.round(totalProcurementCostYuan * 100) / 100,
    totalProcurementCostYen: Math.round(totalProcurementCostYen),
    amazonFees: Math.round(amazonFees),
    totalCost: Math.round(totalCost),
    // 最終結果
    grossProfit: Math.round(grossProfit),
    grossProfitRate: Math.round(grossProfitRate * 100) / 100,
  };
};

/**
 * 粗利益率が基準を満たすかどうかを判定
 * @param {number} profitRate - 粗利益率（%）
 * @param {number} threshold - 基準値（%）、デフォルト30%
 * @returns {boolean}
 */
export const meetsProfitThreshold = (profitRate, threshold = 30) => {
  return profitRate >= threshold;
};
