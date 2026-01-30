import React, { useState } from 'react';

/**
 * セラースプライト情報入力コンポーネント
 * キーワードのみのシンプル表示、重複除去機能付き
 */
const SellerSpriteInput = ({ sellerSpriteData, onUpdate }) => {
  const [rawText, setRawText] = useState(sellerSpriteData.rawText || '');

  // テキストを解析してキーワードリストを抽出（重複除去）
  const parseKeywords = (text) => {
    if (!text.trim()) {
      return [];
    }

    const lines = text.split('\n').filter(line => line.trim());
    const keywordSet = new Set();

    lines.forEach((line) => {
      // タブ区切りまたはスペース区切りのデータを解析（最初の列がキーワード）
      const parts = line.split(/\t+|\s{2,}/);
      const keyword = parts[0].trim();

      // ヘッダー行や空行をスキップ
      if (keyword && !keyword.match(/^(キーワード|順位|検索|ランキング|No\.?)/i)) {
        keywordSet.add(keyword);
      }
    });

    return Array.from(keywordSet);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    const keywords = parseKeywords(text);
    onUpdate({
      rawText: text,
      keywords: keywords.map((keyword, index) => ({ rank: index + 1, keyword })),
    });
  };

  const uniqueKeywords = sellerSpriteData.keywords
    ? [...new Set(sellerSpriteData.keywords.map(kw => kw.keyword))].filter(Boolean)
    : [];

  return (
    <div className="seller-sprite-input">
      <h3>セラースプライト情報</h3>

      <div className="form-group">
        <label>キーワード（改行区切り）</label>
        <textarea
          value={rawText}
          onChange={handleTextChange}
          placeholder="キーワードを入力してください（1行に1キーワード）"
          rows={8}
        />
        <p className="help-text">
          改行区切りで入力すると、重複が自動的に除去されます
        </p>
      </div>

      <div className="keyword-summary">
        {uniqueKeywords.length > 0 ? (
          <>
            <div className="keyword-count">
              登録数: {uniqueKeywords.length}件（重複除去済み）
            </div>
            <div className="keyword-display">
              {uniqueKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="no-data">キーワードデータがありません</p>
        )}
      </div>
    </div>
  );
};

export default SellerSpriteInput;
