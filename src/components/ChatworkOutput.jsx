import React, { useState, useEffect } from 'react';
import { extractProductName, generateChatworkText, copyToClipboard } from '../utils/extractProductName';

/**
 * チャットワーク依頼テキスト生成コンポーネント
 * 特記する仕様はここで入力し、依頼テキストと商品ページ作成プロンプトの両方に反映されます。
 */
const ChatworkOutput = ({
  productTitle,
  productLink,
  initialSpecialSpecs = '',
  onComplete,
  onBack,
  onGoToProductListing,
}) => {
  const [productName, setProductName] = useState('');
  const [specialSpecs, setSpecialSpecs] = useState(initialSpecialSpecs || '');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  // 親から渡された特記仕様が変わったら同期（履歴から復元時など）
  useEffect(() => {
    setSpecialSpecs(initialSpecialSpecs || '');
  }, [initialSpecialSpecs]);

  // 商品タイトルから商品名を自動抽出
  useEffect(() => {
    if (productTitle) {
      const extracted = extractProductName(productTitle);
      setProductName(extracted);
    }
  }, [productTitle]);

  // 出力テキストを生成（特記する仕様を含む）
  useEffect(() => {
    const text = generateChatworkText(productName || '商品名', productLink || '', specialSpecs);
    setOutputText(text);
  }, [productName, productLink, specialSpecs]);

  const handleCopy = async () => {
    const success = await copyToClipboard(outputText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="chatwork-output">
      <h2>チャットワーク依頼テキスト</h2>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="productName">商品名</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="商品名を入力"
          />
          <p className="help-text">商品タイトルから自動抽出されます。必要に応じて編集してください。</p>
        </div>

        <div className="form-group">
          <label htmlFor="productLink">Amazonライバル商品リンク</label>
          <input
            type="url"
            id="productLink"
            value={productLink}
            readOnly
            className="readonly"
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialSpecs">特記する仕様</label>
          <textarea
            id="specialSpecs"
            value={specialSpecs}
            onChange={(e) => setSpecialSpecs(e.target.value)}
            placeholder="商品の特記すべき仕様（素材、サイズ詳細、使用上の注意など）。依頼テキストと商品ページ作成プロンプトの両方に反映されます。"
            rows={4}
          />
        </div>
      </div>

      <div className="output-section">
        <h3>生成テキスト</h3>
        <div className="output-box">
          <pre>{outputText}</pre>
        </div>
        <div className="output-actions">
          <button
            type="button"
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
            onClick={handleCopy}
          >
            {copied ? 'コピーしました!' : 'クリップボードにコピー'}
          </button>
        </div>
      </div>

      <div className="form-actions">
        {onBack && (
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            前に戻る
          </button>
        )}
        {onGoToProductListing && (
          <button type="button" className="btn btn-primary" onClick={() => onGoToProductListing(specialSpecs)}>
            商品ページ作成
          </button>
        )}
        <button type="button" className="btn btn-success" onClick={() => onComplete(specialSpecs)}>
          完了
        </button>
      </div>
    </div>
  );
};

export default ChatworkOutput;
