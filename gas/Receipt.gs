// ===== 收據 AI 辨識（Gemini API）=====

const RECEIPT_LOG_HEADERS = ['scanId','txnId','merchant','amount','status','createdAt'];

function getReceiptLogSheet() {
  return getSheet('ReceiptLog', RECEIPT_LOG_HEADERS);
}

function scanReceipt(imageBase64, mimeType) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY 未設定');

  const prompt = `你是一個收據辨識助手。請分析這張收據圖片（可能是台灣的雲端發票、紙本發票或一般收據），
以繁體中文回傳以下 JSON 格式（只回傳 JSON，不要多餘文字）：
{
  "merchant": "店名（繁體中文）",
  "amount": 金額數字（不含符號，整數或小數）,
  "items": "品項描述（繁體中文，多個品項用 · 分隔）",
  "taxType": "稅別（含稅/未稅/免稅，若不確定填空字串）",
  "invoiceNo": "發票號碼（若有）",
  "suggestedCategory": "建議分類（從以下選一個：訂婚戒指/結婚對戒/喜餅訂婚餅/婚宴飯店/聘金/嫁妝/喜帖/結婚小物/婚紗攝影/新娘秘書造型/婚禮布置花藝/蜜月旅遊/婚車/主持人音響/其他）"
}`;

  const models = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-pro-vision',
  ];

  let lastError;
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
      };

      const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      });

      const code = res.getResponseCode();
      if (code === 404 || code === 400) { lastError = new Error(`model ${model} 不可用`); continue; }
      if (code !== 200) { lastError = new Error(`HTTP ${code}`); continue; }

      const body = JSON.parse(res.getContentText());
      const text = (body.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
      const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      const data = JSON.parse(jsonStr);

      // 寫入 ReceiptLog
      appendRow(getReceiptLogSheet(), RECEIPT_LOG_HEADERS, {
        scanId: Utilities.getUuid(),
        txnId: '',
        merchant: data.merchant || '',
        amount: data.amount || 0,
        status: 'ok',
        createdAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
      });

      return { ok: true, data };
    } catch (e) {
      lastError = e;
    }
  }

  throw new Error('所有模型均失敗：' + (lastError?.message || '未知錯誤'));
}
