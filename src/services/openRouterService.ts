import type { ProjectInfo, WalletInfo, DivinationResult } from '../types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
// 也可以尝试换成 "google/gemini-2.0-flash-exp:free" 如果 deepseek 不稳定
const MODEL_ID = "deepseek/deepseek-chat"; 

export const getDivination = async (
  wallet: WalletInfo,
  project: ProjectInfo
): Promise<DivinationResult> => {
  // 增加一点等待时间，防止请求过快
  await new Promise(resolve => setTimeout(resolve, 2000)); 

  if (!API_KEY) {
    console.warn("无 API Key，使用模拟数据");
    return mockDivination(project.name);
  }

  try {
    const prompt = `
      角色：你是一位居住在赛博空间的【大加密寺】财神，精通《周易》、梅花易数与 Web3 区块链技术。
      
      【施主命理 (链上八字)】
      - 钱包地址：${wallet.address}
      - 降世时辰：${wallet.firstTxDate} (${wallet.cyberBazi})
      - 修行道行：${wallet.walletAge}
      - 业力纠缠：${wallet.transactionCount} 次交互
      - 功德存量：${wallet.balance}
      - 先天五行：金${wallet.elementalBase?.gold}% 木${wallet.elementalBase?.wood}% 水${wallet.elementalBase?.water}% 火${wallet.elementalBase?.fire}% 土${wallet.elementalBase?.earth}% 
      
      【所问机缘】
      - 项目名称：${project.name} (${project.type})
      - 预计交易吉时：${project.transactionTime} (重点判断此时辰吉凶)
      - 背景信息：${project.founderInfo}

      【任务】
      请根据施主的"先天五行"是否与项目属性相生相克，并结合"交易时间"的时辰吉凶，预测吉凶。
      
      【重要要求】
      1. 必须只返回纯 JSON 字符串。
      2. 不要包含 markdown 标记 (如 \`\`\`json )。
      3. 不要有任何开场白或结束语，直接以 { 开始，以 } 结束。
      
      【JSON 格式模板】
      {
        "hexagramName": "卦象名",
        "probability": 88,
        "summary": "四字判词",
        "analysis": "详细分析...",
        "advice": "行动建议...",
        "fiveElements": { "gold": 20, "wood": 20, "water": 20, "fire": 20, "earth": 20 }
      }
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Crypto Temple"
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: "你是一个只输出标准 JSON 格式的 API 接口，严禁输出任何多余文本。" },
          { role: "user", content: prompt }
        ],
        // 🔴 关键修改：降低温度，让 AI 输出更稳定、格式更标准
        temperature: 0.7, 
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenRouter API 报错:", data.error);
      throw new Error(data.error.message);
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      let content = data.choices[0].message.content;
      
      // 🟢 关键修改：增强型 JSON 清洗逻辑
      // 1. 去掉 Markdown 代码块标记
      content = content.replace(/```json|```/g, "").trim();
      
      // 2. 强制截取第一个 { 和最后一个 } 之间的内容
      // 这能防止 AI 在 JSON 前后说废话导致解析失败
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        content = content.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("未找到有效的 JSON 结构");
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error("JSON 解析失败，原始内容:", content);
        throw parseError; // 抛出错误以触发 fallback
      }
    } else {
      throw new Error("API 响应格式错误");
    }

  } catch (error) {
    console.error("🔴 算卦失败 (启用模拟备用方案):", error);
    // 遇到错误时，为了用户体验，返回一个模拟的“系统维护”卦象，而不是让程序崩溃
    return mockDivination(project.name);
  }
};

const mockDivination = (projectName: string): DivinationResult => {
  return {
    probability: 50,
    hexagramName: "混沌卦",
    summary: "天机晦涩，稍后再试",
    analysis: `(系统提示) 财神殿信号受到 Web3 波动干扰（JSON解析错误）。贫道建议施主检查网络，或重新点击焚香。此为随机演示结果。`,
    advice: "静心等待，刷新页面再试。",
    fiveElements: { gold: 20, wood: 20, water: 20, fire: 20, earth: 20 }
  };
};