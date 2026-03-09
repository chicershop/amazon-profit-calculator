import React, { useState } from 'react';
import { CompetitorFormList, normalizeCompetitorMonthlyRevenue } from './CompetitorForm';
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
    memo: '',
  };

  // 履歴から開いた場合も月間販売額＝販売価格×月間販売数で自動反映
  const [competitors, setCompetitors] = useState(() => {
    const list = initialData?.competitors?.length > 0 ? initialData.competitors : [{ ...emptyCompetitor }];
    return list.map(normalizeCompetitorMonthlyRevenue);
  });

  const [sellerSpriteData, setSellerSpriteData] = useState(
    initialData?.sellerSpriteData || {
      rawText: '',
      keywords: [],
      parsedData: null,
    }
  );

  const [notes, setNotes] = useState(initialData?.notes || '');
  const [buyUrl1688, setBuyUrl1688] = useState(initialData?.buyUrl1688 || '');
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchResult, setResearchResult] = useState(initialData?.researchResult || null);

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
      buyUrl1688,
      researchResult,
    });
  };

  const handleResearch = async () => {
    const withAsin = competitors.filter(c => c.asin?.trim());
    if (withAsin.length === 0) {
      window.alert('ライバル情報にASINを1件以上入力してください。');
      return;
    }
    setResearchLoading(true);
    setResearchResult(null);
    try {
      await new Promise(r => setTimeout(r, 800));
      setResearchResult({
        placeholder: true,
        message: 'ライバルASINのリサーチ結果エリアです。外部API連携でレビュー要約・画像構成案を実装できます。',
        competitorsChecked: withAsin.map(c => c.asin),
      });
    } finally {
      setResearchLoading(false);
    }
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
        <h3>1688購入サイトURL</h3>
        <div className="form-group">
          <input
            type="url"
            value={buyUrl1688}
            onChange={(e) => setBuyUrl1688(e.target.value)}
            placeholder="https://detail.1688.com/..."
            className="full-width"
          />
        </div>
      </div>

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

      <div className="form-section">
        <h3>ライバルリサーチ</h3>
        <p className="help-text">
          ライバル情報入力後、ボタンを押すとリサーチ結果エリアを表示します。
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleResearch}
          disabled={researchLoading}
        >
          {researchLoading ? 'リサーチ中…' : 'リサーチ実行'}
        </button>
      </div>

      {researchResult && (
        <div className="form-section research-result">
          <h3>リサーチ結果</h3>
          {researchResult.placeholder ? (
            <div className="research-placeholder">
              <p>{researchResult.message}</p>
              <p className="help-text">対象ASIN: {researchResult.competitorsChecked?.join(', ') || '—'}</p>
              <p className="help-text">実装時は以下を表示します: レビューの良い点・悪い点、CVR向上のための画像構成案（枚数・順序・訴求ポイント）。</p>
            </div>
          ) : (
            <>
              {researchResult.reviewSummary && (
                <div className="research-block">
                  <h4>レビュー要約</h4>
                  <div className="review-good"><strong>良い点:</strong> {researchResult.reviewSummary.good}</div>
                  <div className="review-bad"><strong>悪い点:</strong> {researchResult.reviewSummary.bad}</div>
                </div>
              )}
              {researchResult.imagePlan && (
                <div className="research-block">
                  <h4>画像構成案（CVR向上）</h4>
                  <pre className="image-plan">{researchResult.imagePlan}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
