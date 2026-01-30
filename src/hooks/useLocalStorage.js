import { useState, useEffect, useCallback } from 'react';

/**
 * LocalStorageを使用するカスタムフック
 * @param {string} key - LocalStorageのキー
 * @param {any} initialValue - 初期値
 * @returns {[any, Function, Function]} [値, 設定関数, 削除関数]
 */
export const useLocalStorage = (key, initialValue) => {
  // 初期値を取得
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`LocalStorage読み込みエラー (${key}):`, error);
      return initialValue;
    }
  });

  // 値を設定
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`LocalStorage保存エラー (${key}):`, error);
    }
  }, [key, storedValue]);

  // 値を削除
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`LocalStorage削除エラー (${key}):`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * 履歴管理用カスタムフック
 * @returns {Object} 履歴操作オブジェクト
 */
export const useHistory = () => {
  const [history, setHistory] = useLocalStorage('amazon_research_history', []);

  // 新しい履歴を追加
  const addHistory = useCallback((item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHistory(prev => [newItem, ...prev]);
    return newItem.id;
  }, [setHistory]);

  // 履歴を更新
  const updateHistory = useCallback((id, updates) => {
    setHistory(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));
  }, [setHistory]);

  // 履歴を削除
  const deleteHistory = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, [setHistory]);

  // 履歴をクリア
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  // IDで履歴を取得
  const getHistoryById = useCallback((id) => {
    return history.find(item => item.id === id);
  }, [history]);

  return {
    history,
    addHistory,
    updateHistory,
    deleteHistory,
    clearHistory,
    getHistoryById,
  };
};

/**
 * 設定管理用カスタムフック
 * @returns {Object} 設定操作オブジェクト
 */
export const useSettings = () => {
  const defaultSettings = {
    optionCost: 2.5,       // オプション費用（元）
    shippingRate: 7,       // 国際配送単価（元/kg）
    tariffRate: 0.18,      // 関税率
    exchangeRate: 23.5,    // 為替レート（円/元）
    profitThreshold: 30,   // 粗利益率基準（%）
  };

  const [settings, setSettings] = useLocalStorage('amazon_calculator_settings', defaultSettings);

  // 設定を更新
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  // 設定をリセット
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, [setSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    defaultSettings,
  };
};

export default useLocalStorage;
