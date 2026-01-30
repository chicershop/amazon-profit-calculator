import React, { useState } from 'react';
import { CompetitorFormList } from './CompetitorForm';
import SellerSpriteInput from './SellerSpriteInput';

/**
 * 詳細リサーチ入力コンポーネント
 */
const DetailResearch = ({ initialData, onSave, onCancel }) => {
  const emptyCompetitor = {
    asin: '',
    reviewCount: '',
    reviewRate: '',
    price: '',
    salePrice: '',
    monthlySales: '',
    monthlyRevenue: '',
  };

  const [competitors, setCompetitors] = useState(
    initialData?.competitors?.length > 0 ? initialData.competitors : [{ ...emptyCompetitor }]
  );

  const [sellerSpriteData, setSellerSpriteData] = useState(
    initialData?.sellerSpriteData || {
      rawText: '',
      keywords: [],
      parsedData: null,
    }
  );

  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleAddCompetitor = () => {
    setCompetitors([...competitors, { ...emptyCompetitor }]);
  };

  const handleRemoveCompetitor = (index) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    onSave({
      competitors,
      sellerSpriteData,
      notes,
    });
  };

  return (
    <div className="detail-research">
      <h2>詳細リサーチ</h2>

      <CompetitorFormList
        competitors={competitors}
        onUpdate={setCompetitors}
        onAdd={handleAddCompetitor}
        onRemove={handleRemoveCompetitor}
      />

      <SellerSpriteInput
        sellerSpriteData={sellerSpriteData}
        onUpdate={setSellerSpriteData}
      />

      <div className="form-section">
        <h3>メモ</h3>
        <div className="form-group">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="リサーチに関するメモを入力"
            rows={4}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          保存して次へ
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default DetailResearch;
