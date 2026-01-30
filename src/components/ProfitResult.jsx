import React from 'react';

/**
 * 計算結果表示コンポーネント
 */
const ProfitResult = ({ result, settings }) => {
  if (!result) return null;

  const formatNumber = (num) => {
    return num.toLocaleString('ja-JP');
  };

  const getProfitRateClass = () => {
    if (result.grossProfitRate >= settings.profitThreshold) return 'positive';
    if (result.grossProfitRate >= 20) return 'neutral';
    return 'negative';
  };

  return (
    <div className="profit-result">
      <h2>計算結果</h2>

      <div className="result-main">
        <div className="result-item result-highlight">
          <span className="result-label">粗利益</span>
          <span className={`result-value ${result.grossProfit >= 0 ? 'positive' : 'negative'}`}>
            {formatNumber(result.grossProfit)}円
          </span>
        </div>
        <div className="result-item result-highlight">
          <span className="result-label">粗利益率</span>
          <span className={`result-value ${getProfitRateClass()}`}>
            {result.grossProfitRate.toFixed(2)}%
          </span>
        </div>
      </div>

      {result.meetsThreshold && (
        <div className="threshold-badge success">
          基準値（{settings.profitThreshold}%）以上 - 詳細リサーチ推奨
        </div>
      )}

      <div className="result-details">
        <h3>コスト内訳</h3>

        <div className="detail-section">
          <h4>仕入れコスト（元）</h4>
          <div className="detail-row">
            <span>原価 + オプション費用</span>
            <span>{result.costWithOption}元</span>
          </div>
          <div className="detail-row">
            <span>容積重量</span>
            <span>{result.volumetricWeight}kg</span>
          </div>
          <div className="detail-row">
            <span>課金重量（実重量/容積重量の大きい方）</span>
            <span>{result.chargeableWeight}kg</span>
          </div>
          <div className="detail-row">
            <span>国際配送料</span>
            <span>{result.internationalShipping}元</span>
          </div>
          <div className="detail-row">
            <span>関税費用</span>
            <span>{result.tariffCost}元</span>
          </div>
          <div className="detail-row subtotal">
            <span>仕入れ総コスト（元）</span>
            <span>{result.totalProcurementCostYuan}元</span>
          </div>
        </div>

        <div className="detail-section">
          <h4>日本円換算</h4>
          <div className="detail-row">
            <span>仕入れ総コスト（円）</span>
            <span>{formatNumber(result.totalProcurementCostYen)}円</span>
          </div>
          <div className="detail-row">
            <span>Amazon手数料合計</span>
            <span>{formatNumber(result.amazonFees)}円</span>
          </div>
          <div className="detail-row total">
            <span>総コスト</span>
            <span>{formatNumber(result.totalCost)}円</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitResult;
