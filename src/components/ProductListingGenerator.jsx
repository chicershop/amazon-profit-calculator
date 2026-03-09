import React, { useState } from 'react';
import { copyToClipboard } from '../utils/extractProductName';

const LISTING_RULES = `【0. 大前提（絶対厳守）】
日本の Amazon.co.jp 向け商品ページ
薬機法・景表法に抵触する表現は禁止
断定・誇大表現は禁止 ❌「必ず」「絶対」「100%」「完全に」「最強」 ⭕「〜しやすい」「〜をサポート」「〜設計」

【1. Amazonタイトル作成ルール（最重要）】
■ 文字数: 80〜120文字を厳守
■ タイトルの先頭に必ず「Chicer」を入れる
■ 構成順（必ずこの順）
1. Chicer（先頭）
2. 主要キーワードのメインキーワード（完全一致）
3. 商品カテゴリ・商品名
4. 仕様・特徴（サイズ／セット数／カラー等から2〜3点）
5. サブキーワード（自然な日本語で）
■ 禁止事項: 記号の乱用、価格・割引・保証・ランキング表現、主観・感情表現

【2. 商品仕様（箇条書き5点）ルール】
■ 出力フォーマット: 各行の先頭は必ず「✅」、箇条書きは必ず5点
■ 構成ルール
1行目：使用シーン・ベネフィット
2〜4行目：仕様・素材・構造・セット内容
5行目：サイズ・カラー・注意点
■ 1文100文字以内、各項目に主要キーワードまたは関連語を自然に含める

【3. 検索キーワード（バックエンド）ルール】
■ 全角250バイト以内、スペース区切り
■ タイトルに入れきれなかった主要キーワード、言い換え・俗称・表記ゆれ
■ 禁止: ブランド名、型番、販促語、重複ワード

【4. BADレビュー対策】
■ ライバルASINから分析: サイズ違い、セット数の勘違い、カラーの見え方違い、用途・使用条件の誤認
■ 「向いていない人」を事前に明記、数値・具体表現を最優先

【5. 出力フォーマット】
タイトルをA1、仕様5点をB1〜F1、検索キーワードG1に入れるため、タブ区切りで1行にまとめて出力`;

/**
 * 商品ページ作成支援コンポーネント
 * 完了ステータスの商品向けにClaude Code用プロンプトを生成
 */
const ProductListingGenerator = ({ historyItem, onBack, onSaveManualAdWords }) => {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [showManualWordPicker, setShowManualWordPicker] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [selectedManualWords, setSelectedManualWords] = useState(
    () => historyItem?.detailResearch?.manualAdWords || []
  );

  const competitors = historyItem?.detailResearch?.competitors || [];
  const keywords = historyItem?.detailResearch?.sellerSpriteData?.keywords || [];
  const productName = historyItem?.productName || historyItem?.inputs?.productName || '';
  const specialSpecs = historyItem?.detailResearch?.specialSpecs ?? '';

  // 履歴が変わったときに保存済みのマニュアル広告ワードを反映
  React.useEffect(() => {
    const saved = historyItem?.detailResearch?.manualAdWords;
    if (Array.isArray(saved)) setSelectedManualWords(saved);
  }, [historyItem?.detailResearch?.manualAdWords]);

  // 重複除去済みキーワード一覧（表示・選択用）
  const uniqueKeywords = React.useMemo(() => {
    const seen = new Set();
    return (keywords || [])
      .map((k) => (typeof k === 'string' ? k : k?.keyword))
      .filter(Boolean)
      .filter((kw) => {
        const n = String(kw).trim();
        if (!n || seen.has(n)) return false;
        seen.add(n);
        return true;
      });
  }, [keywords]);

  const toggleManualWord = (word) => {
    setSelectedManualWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const applyManualWordSelection = () => {
    setShowManualWordPicker(false);
  };

  const handleSaveManualWords = () => {
    if (typeof onSaveManualAdWords === 'function') {
      onSaveManualAdWords(selectedManualWords);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  const generatePrompt = () => {
    const competitorInfo = competitors.map(c =>
      `- ASIN: ${c.asin}, レビュー数: ${c.reviewCount}件, 評価: ★${c.reviewRate}, 価格: ${c.price}円`
    ).join('\n');

    const keywordList = keywords.map(k => k.keyword).join(', ');

    const generatedPrompt = `以下の情報を元に、Amazon商品ページを作成してください。

【商品名】
${productName}

【ライバルASIN情報】
${competitorInfo || 'なし'}

【検索キーワード（セラースプライト）】
${keywordList || 'なし'}

【特記する仕様】
${specialSpecs || 'なし'}

${LISTING_RULES}`;

    setPrompt(generatedPrompt);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="product-listing-generator">
      <h2>商品ページ作成支援</h2>

      <div className="form-section">
        <h3>商品情報</h3>
        <p><strong>商品名:</strong> {productName || '未設定'}</p>
      </div>

      <div className="form-section">
        <h3>ライバルASIN情報</h3>
        {competitors.length > 0 ? (
          <ul className="competitor-list">
            {competitors.map((c, i) => (
              <li key={i}>ASIN: {c.asin} / レビュー: {c.reviewCount}件 / ★{c.reviewRate}</li>
            ))}
          </ul>
        ) : <p className="no-data">データなし</p>}
      </div>

      <div className="form-section">
        <h3>キーワード情報</h3>
        {keywords.length > 0 ? (
          <>
            <div className="keyword-display">
              {keywords.map((k, i) => <span key={i} className="keyword-tag">{k.keyword}</span>)}
            </div>
            <p className="help-text">重複除去済み: {uniqueKeywords.length} ワード</p>
            <div className="form-actions" style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowManualWordPicker(true)}
              >
                マニュアル広告ワード選択
              </button>
            </div>
          </>
        ) : <p className="no-data">データなし</p>}
      </div>

      {selectedManualWords.length > 0 && (
        <div className="form-section">
          <h3>選択したマニュアル広告ワード</h3>
          <div className="keyword-display">
            {selectedManualWords.map((w, i) => (
              <span key={i} className="keyword-tag keyword-tag-selected">{w}</span>
            ))}
          </div>
          {onSaveManualAdWords && (
            <div className="form-actions" style={{ marginTop: '0.75rem' }}>
              <button type="button" className="btn btn-primary" onClick={handleSaveManualWords}>
                保存
              </button>
              {savedFeedback && <span className="save-feedback">保存しました</span>}
            </div>
          )}
        </div>
      )}

      {showManualWordPicker && (
        <div className="manual-word-picker-overlay" onClick={() => setShowManualWordPicker(false)}>
          <div className="manual-word-picker-box" onClick={(e) => e.stopPropagation()}>
            <h3>マニュアル広告ワード選択</h3>
            <p className="help-text">追加するワードにチェックを入れてください（重複除去済み・{uniqueKeywords.length}件）</p>
            <div className="manual-word-picker-list">
              {uniqueKeywords.map((word) => (
                <label key={word} className="manual-word-picker-item">
                  <input
                    type="checkbox"
                    checked={selectedManualWords.includes(word)}
                    onChange={() => toggleManualWord(word)}
                  />
                  <span>{word}</span>
                </label>
              ))}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={applyManualWordSelection}>
                選択を反映
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowManualWordPicker(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-section">
        <h3>特記する仕様</h3>
        <p className="special-specs-display">{specialSpecs || '（チャットワーク依頼テキストページで入力した内容が反映されます）'}</p>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={generatePrompt}>
          プロンプトを生成
        </button>
      </div>

      {prompt && (
        <div className="output-section">
          <h3>Claude Code用プロンプト</h3>
          <div className="output-box">
            <pre>{prompt}</pre>
          </div>
          <div className="output-actions">
            <button
              className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
              onClick={handleCopy}
            >
              {copied ? 'コピーしました!' : 'クリップボードにコピー'}
            </button>
          </div>
          <p className="help-text">
            プロンプトをクリップボードにコピーし、Claudeの画面に貼り付けて送信すると、商品タイトル・仕様・検索キーワード・BADレビュー対策がタブ区切りで出力されます。
          </p>
        </div>
      )}

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onBack}>戻る</button>
      </div>
    </div>
  );
};

export default ProductListingGenerator;
