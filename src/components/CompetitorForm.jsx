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
            placeholder="0"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * ライバル情報入力フォームリストコンポーネント
 */
export const CompetitorFormList = ({ competitors, onUpdate, onAdd, onRemove }) => {
  const handleChange = (index, field, value) => {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value };
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
