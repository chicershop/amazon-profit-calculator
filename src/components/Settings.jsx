import React, { useState } from 'react';

/**
 * 設定画面コンポーネント
 */
const Settings = ({ settings, onUpdate, onReset, defaultSettings }) => {
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdate(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('設定をデフォルト値に戻しますか？')) {
      setLocalSettings({ ...defaultSettings });
      onReset();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="settings">
      <h2>設定</h2>

      <div className="form-section">
        <h3>計算パラメータ</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="optionCost">オプション費用（元）</label>
            <input
              type="number"
              id="optionCost"
              value={localSettings.optionCost}
              onChange={handleChange('optionCost')}
              step="0.1"
              min="0"
            />
            <p className="help-text">商品原価に追加されるオプション費用</p>
          </div>

          <div className="form-group">
            <label htmlFor="shippingRate">国際配送単価（元/kg）</label>
            <input
              type="number"
              id="shippingRate"
              value={localSettings.shippingRate}
              onChange={handleChange('shippingRate')}
              step="0.1"
              min="0"
            />
            <p className="help-text">1kgあたりの国際配送費用</p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tariffRate">関税率（%）</label>
            <input
              type="number"
              id="tariffRate"
              value={localSettings.tariffRate * 100}
              onChange={(e) => {
                const value = parseFloat(e.target.value) / 100 || 0;
                setLocalSettings(prev => ({ ...prev, tariffRate: value }));
                setSaved(false);
              }}
              step="1"
              min="0"
              max="100"
            />
            <p className="help-text">原価+配送料に対する関税率</p>
          </div>

          <div className="form-group">
            <label htmlFor="exchangeRate">為替レート（円/元）</label>
            <input
              type="number"
              id="exchangeRate"
              value={localSettings.exchangeRate}
              onChange={handleChange('exchangeRate')}
              step="0.1"
              min="0"
            />
            <p className="help-text">1人民元あたりの日本円換算レート</p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="profitThreshold">粗利益率基準（%）</label>
            <input
              type="number"
              id="profitThreshold"
              value={localSettings.profitThreshold}
              onChange={handleChange('profitThreshold')}
              step="1"
              min="0"
              max="100"
            />
            <p className="help-text">この値以上の場合、自動的に詳細リサーチへ進みます</p>
          </div>
        </div>
      </div>

      <div className="settings-info">
        <h3>現在の設定値サマリー</h3>
        <ul>
          <li>オプション費用: <strong>{localSettings.optionCost}元</strong></li>
          <li>国際配送単価: <strong>{localSettings.shippingRate}元/kg</strong></li>
          <li>関税率: <strong>{(localSettings.tariffRate * 100).toFixed(0)}%</strong></li>
          <li>為替レート: <strong>{localSettings.exchangeRate}円/元</strong></li>
          <li>粗利益率基準: <strong>{localSettings.profitThreshold}%</strong></li>
        </ul>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={handleSave}
        >
          {saved ? '保存しました!' : '設定を保存'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          デフォルトに戻す
        </button>
      </div>

      <div className="settings-note">
        <p>
          設定はブラウザのLocalStorageに保存されます。
          ブラウザのデータをクリアすると設定も消去されます。
        </p>
      </div>
    </div>
  );
};

export default Settings;
