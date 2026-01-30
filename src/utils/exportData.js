/**
 * データエクスポート機能
 */

/**
 * オブジェクトの配列をCSV形式に変換
 * @param {Array} data - エクスポートするデータ配列
 * @param {Array} headers - CSVヘッダー（オプション）
 * @returns {string} CSV文字列
 */
export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);

  // ヘッダー行
  const headerRow = keys.join(',');

  // データ行
  const dataRows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      // カンマや改行を含む場合はダブルクォートで囲む
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * ステータスを日本語に変換
 * @param {string} status - ステータス値
 * @returns {string} 日本語ステータス
 */
const getStatusLabel = (status) => {
  const labels = {
    'pending': '進行中',
    'awaiting_approval': '承認待ち',
    'in_progress': '進行中',
    'ok': '詳細リサーチ中',
    'ng': 'NG',
    'completed': '完了',
  };
  return labels[status] || status;
};

/**
 * 履歴データをCSV形式でエクスポート
 * @param {Array} history - 履歴データ
 * @returns {string} CSV文字列
 */
export const exportHistoryToCSV = (history) => {
  const exportData = history.map(item => ({
    日付: new Date(item.createdAt).toLocaleString('ja-JP'),
    商品名: item.productName || item.inputs?.productName || '',
    ASIN: item.asin || '',
    商品リンク: item.productLink || '',
    商品原価_元: item.inputs?.productCost || '',
    販売価格_円: item.inputs?.sellingPrice || '',
    粗利益_円: item.result?.grossProfit || '',
    粗利益率: item.result?.grossProfitRate ? `${item.result.grossProfitRate.toFixed(2)}%` : '',
    ステータス: getStatusLabel(item.status),
    ライバルASIN1: item.detailResearch?.competitors?.[0]?.asin || '',
    ライバルレビュー数1: item.detailResearch?.competitors?.[0]?.reviewCount || '',
    ライバル評価1: item.detailResearch?.competitors?.[0]?.reviewRate || '',
    ライバル価格1: item.detailResearch?.competitors?.[0]?.price || '',
    ライバルASIN2: item.detailResearch?.competitors?.[1]?.asin || '',
    ライバルレビュー数2: item.detailResearch?.competitors?.[1]?.reviewCount || '',
    ライバル評価2: item.detailResearch?.competitors?.[1]?.reviewRate || '',
    ライバル価格2: item.detailResearch?.competitors?.[1]?.price || '',
    キーワード: item.detailResearch?.sellerSpriteData?.keywords?.map(k => k.keyword).join('、') || '',
  }));

  return convertToCSV(exportData);
};

/**
 * データをJSON形式でエクスポート
 * @param {any} data - エクスポートするデータ
 * @returns {string} JSON文字列
 */
export const exportToJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

/**
 * ファイルをダウンロード
 * @param {string} content - ファイル内容
 * @param {string} filename - ファイル名
 * @param {string} mimeType - MIMEタイプ
 */
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * CSVファイルとしてダウンロード
 * @param {Array} data - エクスポートするデータ
 * @param {string} filename - ファイル名
 */
export const downloadCSV = (data, filename = 'amazon_research_history.csv') => {
  const csv = exportHistoryToCSV(data);
  // BOMを追加してExcelで文字化けを防ぐ
  const csvWithBOM = '\uFEFF' + csv;
  downloadFile(csvWithBOM, filename, 'text/csv;charset=utf-8');
};

/**
 * JSONファイルとしてダウンロード
 * @param {any} data - エクスポートするデータ
 * @param {string} filename - ファイル名
 */
export const downloadJSON = (data, filename = 'amazon_research_history.json') => {
  const json = exportToJSON(data);
  downloadFile(json, filename, 'application/json;charset=utf-8');
};
