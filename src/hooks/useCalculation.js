import { useState, useCallback } from 'react';
import { calculateProfit, meetsProfitThreshold } from '../utils/calculator';

/**
 * 利益計算用カスタムフック
 * @param {Object} settings - 設定値
 * @returns {Object} 計算操作オブジェクト
 */
export const useCalculation = (settings) => {
  const [inputs, setInputs] = useState({
    asin: '',
    productLink: '',
    productName: '',
    productCost: '',
    sellingPrice: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    salesFee: '',
    storageFee: '',
    fbaFee: '',
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 入力値を更新
  const updateInput = useCallback((field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // 複数の入力値を一括更新
  const updateInputs = useCallback((updates) => {
    setInputs(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  // 入力値をリセット
  const resetInputs = useCallback(() => {
    setInputs({
      asin: '',
      productLink: '',
      productName: '',
      productCost: '',
      sellingPrice: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      salesFee: '',
      storageFee: '',
      fbaFee: '',
    });
    setResult(null);
    setError(null);
  }, []);

  // 入力値を検証
  const validateInputs = useCallback(() => {
    const required = ['productCost', 'sellingPrice', 'length', 'width', 'height', 'weight'];
    for (const field of required) {
      if (!inputs[field] || isNaN(parseFloat(inputs[field]))) {
        return { valid: false, message: `${getFieldLabel(field)}を入力してください` };
      }
    }

    // 数値が0以上であることを確認
    const numericFields = ['productCost', 'sellingPrice', 'length', 'width', 'height', 'weight', 'salesFee', 'storageFee', 'fbaFee'];
    for (const field of numericFields) {
      if (inputs[field] && parseFloat(inputs[field]) < 0) {
        return { valid: false, message: `${getFieldLabel(field)}は0以上で入力してください` };
      }
    }

    return { valid: true };
  }, [inputs]);

  // 計算を実行
  const calculate = useCallback(() => {
    const validation = validateInputs();
    if (!validation.valid) {
      setError(validation.message);
      return null;
    }

    try {
      const params = {
        productCost: parseFloat(inputs.productCost) || 0,
        sellingPrice: parseFloat(inputs.sellingPrice) || 0,
        length: parseFloat(inputs.length) || 0,
        width: parseFloat(inputs.width) || 0,
        height: parseFloat(inputs.height) || 0,
        weight: parseFloat(inputs.weight) || 0,
        salesFee: parseFloat(inputs.salesFee) || 0,
        storageFee: parseFloat(inputs.storageFee) || 0,
        fbaFee: parseFloat(inputs.fbaFee) || 0,
        optionCost: settings.optionCost,
        shippingRate: settings.shippingRate,
        tariffRate: settings.tariffRate,
        exchangeRate: settings.exchangeRate,
      };

      const calculationResult = calculateProfit(params);
      calculationResult.meetsThreshold = meetsProfitThreshold(
        calculationResult.grossProfitRate,
        settings.profitThreshold
      );

      setResult(calculationResult);
      setError(null);
      return calculationResult;
    } catch (err) {
      setError('計算中にエラーが発生しました');
      return null;
    }
  }, [inputs, settings, validateInputs]);

  return {
    inputs,
    result,
    error,
    updateInput,
    updateInputs,
    resetInputs,
    calculate,
    validateInputs,
  };
};

// フィールドラベルを取得
const getFieldLabel = (field) => {
  const labels = {
    asin: 'ASIN',
    productLink: '商品リンク',
    productName: '商品名',
    productCost: '商品原価',
    sellingPrice: '販売価格',
    length: '縦',
    width: '横',
    height: '高さ',
    weight: '重量',
    salesFee: '販売手数料',
    storageFee: '在庫保管手数料',
    fbaFee: 'FBA配送代行手数料',
  };
  return labels[field] || field;
};

export default useCalculation;
