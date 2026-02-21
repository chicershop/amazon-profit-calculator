import React from 'react';

/**
 * ライバル情報入力フォームコンポーネント（単体）
 */
const CompetitorForm = ({ competitor, index, onChange, onRemove, canRemove }) => {
  const handleChange = (field) => (e) => {
    onChange(index, field, e.target.value);
  };

  return (
    <div className="competitor-form">
      <div className="competitor-header">
        <h4>ライバル {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            className="btn btn-small btn-danger"
            onClick={() => onRemove(index)}
          >
            削除
          </button>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>ASIN</label>
          <input
            type="text"
            value={competitor.asin}
            onChange={handleChange('asin')}
            placeholder="B08N5WRWNW"
          />
        </div>
        <div className="form-group">
          <label>現在のレビュー数</label>
          <input
            type="number"
            value={competitor.reviewCount}
            onChange={handleChange('reviewCount')}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>レビューレート（★）</label>
          <input
            type="number"
            value={competitor.reviewRate}
            onChange={handleChange('reviewRate')}
            placeholder="4.5"
            step="0.1"
            min="0"
            max="5"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>販売価格（円）</label>
          <input
            type="number"
            value={competitor.price}
            onChange={handleChange('price')}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>セール時の販売価格（円）</label>
          <input
            type="number"
            value={competitor.salePrice}
            onChange={handleChange('salePrice')}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>月間販売数</label>
          <input
            type="number"
            value={competitor.monthlySales}
            onChange={handleChange('monthlySales')}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>月間販売額（円）</label>
          <input
            type="number"
            value={competitor.monthlyRevenue}
            onChange={handleChange('monthlyRevenue')}
            placeholder="販売価格×月間販売数で自動入力"
            min="0"
          />
          <p className="help-text">販売価格と月間販売数を入力すると自動計算されます（上書き可能）</p>
        </div>
      </div>
    </div>
  );
};

/**
 * 月間販売額（円）＝ 販売価格 × 月間販売数 で自動計算（詳細リサーチ・履歴の正規化でも使用）
 */
export const calcMonthlyRevenue = (price, monthlySales) => {
  const p = parseFloat(price);
  const m = parseFloat(monthlySales);
  if (Number.isNaN(p) || Number.isNaN(m) || p < 0 || m < 0) return '';
  return String(Math.round(p * m));
};

/** ライバル1件の月間販売額を自動算出して埋める（履歴から開いたとき用） */
export const normalizeCompetitorMonthlyRevenue = (c) => {
  const revenue = calcMonthlyRevenue(c.price, c.monthlySales);
  return { ...c, monthlyRevenue: revenue || c.monthlyRevenue || '' };
};

/**
 * ライバル情報入力フォームリストコンポーネント
 */
export const CompetitorFormList = ({ competitors, onUpdate, onAdd, onRemove }) => {
  const handleChange = (index, field, value) => {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value };
    // 販売価格または月間販売数が変わったら、月間販売額を自動入力
    if (field === 'price' || field === 'monthlySales') {
      updated[index].monthlyRevenue = calcMonthlyRevenue(
        field === 'price' ? value : updated[index].price,
        field === 'monthlySales' ? value : updated[index].monthlySales
      );
    }
    onUpdate(updated);
  };

  return (
    <div className="competitor-form-list">
      <h3>ライバル情報</h3>
      {competitors.map((competitor, index) => (
        <CompetitorForm
          key={index}
          competitor={competitor}
          index={index}
          onChange={handleChange}
          onRemove={onRemove}
          canRemove={competitors.length > 1}
        />
      ))}
      <button type="button" className="btn btn-secondary" onClick={onAdd}>
        + ライバルを追加
      </button>
    </div>
  );
};

export default CompetitorForm;
