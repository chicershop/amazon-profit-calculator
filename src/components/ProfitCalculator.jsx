import React from 'react';

/**
 * 利益計算入力フォームコンポーネント
 */
const ProfitCalculator = ({ inputs, onInputChange, onCalculate, onStartNew, error, settings, fbaFeeResult }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate();
  };

  const handleInputChange = (field) => (e) => {
    onInputChange(field, e.target.value);
  };

  return (
    <div className="profit-calculator">
      <h2>利益計算</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>商品情報</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="asin">ライバル商品ASIN</label>
              <input
                type="text"
                id="asin"
                value={inputs.asin}
                onChange={handleInputChange('asin')}
                placeholder="例: B08N5WRWNW"
              />
            </div>
            <div className="form-group">
              <label htmlFor="productLink">ライバル商品リンク</label>
              <input
                type="url"
                id="productLink"
                value={inputs.productLink}
                onChange={handleInputChange('productLink')}
                placeholder="https://www.amazon.co.jp/..."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="productName">商品名</label>
              <input
                type="text"
                id="productName"
                value={inputs.productName}
                onChange={handleInputChange('productName')}
                placeholder="商品名を入力"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>コスト情報</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="productCost">商品原価（元）<span className="required">*</span></label>
              <input
                type="number"
                id="productCost"
                value={inputs.productCost}
                onChange={handleInputChange('productCost')}
                placeholder="0"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sellingPrice">販売価格（円）<span className="required">*</span></label>
              <input
                type="number"
                id="sellingPrice"
                value={inputs.sellingPrice}
                onChange={handleInputChange('sellingPrice')}
                placeholder="0"
                step="1"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>サイズ・重量</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="length">縦（cm）<span className="required">*</span></label>
              <input
                type="number"
                id="length"
                value={inputs.length}
                onChange={handleInputChange('length')}
                placeholder="0"
                step="0.1"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="width">横（cm）<span className="required">*</span></label>
              <input
                type="number"
                id="width"
                value={inputs.width}
                onChange={handleInputChange('width')}
                placeholder="0"
                step="0.1"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="height">高さ（cm）<span className="required">*</span></label>
              <input
                type="number"
                id="height"
                value={inputs.height}
                onChange={handleInputChange('height')}
                placeholder="0"
                step="0.1"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="weight">重量（kg）<span className="required">*</span></label>
              <input
                type="number"
                id="weight"
                value={inputs.weight}
                onChange={handleInputChange('weight')}
                placeholder="0"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Amazon手数料</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salesFee">販売手数料（円）</label>
              <input
                type="number"
                id="salesFee"
                value={inputs.salesFee}
                onChange={handleInputChange('salesFee')}
                placeholder="0"
                step="1"
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="storageFee">在庫保管手数料（円）</label>
              <input
                type="number"
                id="storageFee"
                value={inputs.storageFee}
                onChange={handleInputChange('storageFee')}
                placeholder="0"
                step="1"
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fbaFee">FBA配送代行手数料（円）</label>
              <input
                type="text"
                id="fbaFee"
                value={fbaFeeResult != null ? `${fbaFeeResult.fee}円（${fbaFeeResult.tierName}・自動）` : (inputs.fbaFee ? `${inputs.fbaFee}円` : '—')
                }
                readOnly
                className="readonly"
                placeholder="サイズ・重量・販売価格を入力すると自動計算"
              />
              <p className="help-text">縦・横・高さ・重量・販売価格から自動計算（<a href="https://sell.amazon.co.jp/pricing#fulfillment-fees" target="_blank" rel="noopener noreferrer">FBA料金表</a>）</p>
            </div>
          </div>
        </div>

        <div className="form-section settings-summary">
          <h3>適用中の設定値</h3>
          <div className="settings-display">
            <span>オプション費用: {settings.optionCost}元</span>
            <span>国際配送単価: {settings.shippingRate}元/kg</span>
            <span>関税率: {(settings.tariffRate * 100).toFixed(0)}%</span>
            <span>為替レート: {settings.exchangeRate}円/元</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">計算する</button>
          {onStartNew && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onStartNew}
            >
              新規作成
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfitCalculator;
