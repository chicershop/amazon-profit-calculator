/**
 * 商品名抽出ユーティリティ
 */

/**
 * Amazon商品タイトルから商品名を抽出
 * 一般的なパターン:
 * - ブランド名 + 商品名 + 詳細説明
 * - 最初の20-30文字程度を抽出
 *
 * @param {string} title - 商品タイトル全文
 * @returns {string} 抽出された商品名
 */
export const extractProductName = (title) => {
  if (!title || typeof title !== 'string') {
    return '';
  }

  // 全角スペースを半角に統一
  let cleanTitle = title.replace(/　/g, ' ').trim();

  // 「【】」内の文字を除去（プロモーション文言など）
  cleanTitle = cleanTitle.replace(/【[^】]*】/g, '').trim();

  // 「[]」内の文字を除去
  cleanTitle = cleanTitle.replace(/\[[^\]]*\]/g, '').trim();

  // 複数のスペースを1つに
  cleanTitle = cleanTitle.replace(/\s+/g, ' ');

  // 最初の部分を抽出（カンマや「、」で区切られる前の部分）
  const firstPart = cleanTitle.split(/[,、]/)[0];

  // 長すぎる場合は最初の30文字程度で切る
  if (firstPart.length > 40) {
    // スペースで区切って、40文字以内に収まるところで切る
    const words = firstPart.split(' ');
    let result = '';
    for (const word of words) {
      if ((result + ' ' + word).trim().length <= 40) {
        result = (result + ' ' + word).trim();
      } else {
        break;
      }
    }
    return result || firstPart.substring(0, 40);
  }

  return firstPart;
};

/**
 * チャットワーク依頼テキストを生成
 * @param {string} productName - 商品名
 * @param {string} amazonLink - Amazonライバル商品リンク
 * @returns {string} チャットワーク用テキスト
 */
export const generateChatworkText = (productName, amazonLink) => {
  return `【${productName}】について

品質の条件内で最安値の商品を選定してください
最安値以外にもおすすめ商品があれば提案してください

・リンク先の類似仕様の商品を選定してください
・品質★4以上

${amazonLink}`;
};

/**
 * テキストをクリップボードにコピー
 * @param {string} text - コピーするテキスト
 * @returns {Promise<boolean>} コピー成功かどうか
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // フォールバック: 古いブラウザ用
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error('クリップボードへのコピーに失敗しました:', fallbackErr);
      return false;
    }
  }
};
