import React, { useState } from 'react';
import { downloadCSV, downloadJSON } from '../utils/exportData';

/**
 * 履歴一覧コンポーネント
 */
const HistoryList = ({ history, onSelect, onDelete, onClear }) => {
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  // フィルタリング
  const filteredHistory = history.filter(item => {
    // ステータスフィルター
    if (filter !== 'all' && item.status !== filter) {
      return false;
    }

    // テキスト検索
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        (item.asin && item.asin.toLowerCase().includes(searchLower)) ||
        (item.productName && item.productName.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

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

  const getStatusClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'awaiting_approval': 'status-awaiting',
      'in_progress': 'status-pending',
      'ok': 'status-ok',
      'ng': 'status-ng',
      'completed': 'status-completed',
    };
    return classes[status] || '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportCSV = () => {
    downloadCSV(filteredHistory);
  };

  const handleExportJSON = () => {
    downloadJSON(filteredHistory);
  };

  return (
    <div className="history-list">
      <h2>リサーチ履歴</h2>

      <div className="history-controls">
        <div className="filter-controls">
          <div className="form-group">
            <label>ステータス</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">すべて</option>
              <option value="pending">進行中</option>
              <option value="awaiting_approval">承認待ち</option>
              <option value="ok">詳細リサーチ中</option>
              <option value="ng">NG</option>
              <option value="completed">完了</option>
            </select>
          </div>
          <div className="form-group">
            <label>検索</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ASIN・商品名で検索"
            />
          </div>
        </div>

        <div className="export-controls">
          <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
            CSVダウンロード
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleExportJSON}>
            JSONダウンロード
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onClear}
            disabled={history.length === 0}
          >
            履歴をクリア
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="no-history">
          <p>履歴がありません</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>日時</th>
                <th>ASIN</th>
                <th>商品名</th>
                <th>粗利益</th>
                <th>粗利益率</th>
                <th>ステータス</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{item.asin || '-'}</td>
                  <td className="product-name-cell">
                    {item.productName || '-'}
                  </td>
                  <td className={item.result?.grossProfit >= 0 ? 'positive' : 'negative'}>
                    {item.result?.grossProfit?.toLocaleString() || '-'}円
                  </td>
                  <td className={
                    item.result?.grossProfitRate >= 30 ? 'positive' :
                    item.result?.grossProfitRate >= 20 ? 'neutral' : 'negative'
                  }>
                    {item.result?.grossProfitRate?.toFixed(2) || '-'}%
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn btn-small btn-primary"
                        onClick={() => onSelect(item)}
                      >
                        詳細
                      </button>
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => onDelete(item.id)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="history-summary">
        <p>全{history.length}件中 {filteredHistory.length}件表示</p>
      </div>
    </div>
  );
};

export default HistoryList;
