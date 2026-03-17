import { useState, useCallback, useMemo } from 'react';
import { calculateProfit, meetsProfitThreshold } from '../utils/calculator';
import { calculateFbaFee } from '../utils/fbaFees';

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
      memo: '',
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

  // FBA配送代行手数料の自動計算結果（サイズ・重量・販売価格から算出）
  const fbaFeeResult = useMemo(() => {
    const l = parseFloat(inputs.length);
    const w = parseFloat(inputs.width);
    const h = parseFloat(inputs.height);
    const wgt = parseFloat(inputs.weight);
    const price = parseFloat(inputs.sellingPrice);
    if ([l, w, h, wgt].some(v => isNaN(v) || v < 0)) return null;
    return calculateFbaFee(l, w, h, wgt, price);
  }, [inputs.length, inputs.width, inputs.height, inputs.weight, inputs.sellingPrice]);

  // 計算を実行
  const calculate = useCallback(() => {
    const validation = validateInputs();
    if (!validation.valid) {
      setError(validation.message);
      return null;
    }

    try {
      const fbaFee = fbaFeeResult?.fee ?? (parseFloat(inputs.fbaFee) || 0);
      const params = {
        productCost: parseFloat(inputs.productCost) || 0,
        sellingPrice: parseFloat(inputs.sellingPrice) || 0,
        length: parseFloat(inputs.length) || 0,
        width: parseFloat(inputs.width) || 0,
        height: parseFloat(inputs.height) || 0,
        weight: parseFloat(inputs.weight) || 0,
        salesFee: parseFloat(inputs.salesFee) || 0,
        storageFee: parseFloat(inputs.storageFee) || 0,
        fbaFee,
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
  }, [inputs, settings, validateInputs, fbaFeeResult]);

  return {
    inputs,
    result,
    error,
    fbaFeeResult,
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
    memo: 'メモ',
  };
  return labels[field] || field;
};

export default useCalculation;
