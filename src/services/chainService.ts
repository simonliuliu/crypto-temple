import { createPublicClient, http, formatEther } from 'viem';
import { mainnet } from 'viem/chains';
import type { WalletInfo, FiveElements } from '../types';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

// 读取 Key 并清理空格
const API_KEY = (import.meta.env.VITE_ETHERSCAN_API_KEY || "").trim();

// 🟢 内存缓存：防止重复请求
const dataCache: Record<string, { timestamp: number; data: any }> = {};
const CACHE_DURATION = 60 * 1000; // 60秒缓存

// 辅助函数：计算日期差
function calculateAge(dateString: string): string {
  if (!dateString || dateString === "未知" || dateString.includes("1970")) return "未知";
  const start = new Date(dateString);
  const now = new Date();
  if (isNaN(start.getTime())) return "未知";

  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;
  
  if (years > 0) return `${years}年${days}天`;
  return `${days}天`;
}

// 辅助函数：生成赛博八字
function getCyberBazi(dateString: string): string {
  if (!dateString || dateString === "未知" || dateString.includes("1970")) return "混沌纪元";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "混沌纪元";

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const sky = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earth = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const yearIndex = (year - 4) % 60;
  const safeIndex = yearIndex < 0 ? yearIndex + 60 : yearIndex;
  
  return `${sky[safeIndex % 10]}${earth[safeIndex % 12]}年 · 农历${month}月 · 链上降世`;
}

// 辅助函数：计算先天五行
function calculateAddressElements(address: string): FiveElements {
  const cleanAddr = address.replace('0x', '').toLowerCase();
  const elements = { gold: 0, wood: 0, water: 0, fire: 0, earth: 0 };
  
  for (const char of cleanAddr) {
    const code = char.charCodeAt(0);
    if (code % 5 === 0) elements.gold += 1;
    else if (code % 5 === 1) elements.wood += 1;
    else if (code % 5 === 2) elements.water += 1;
    else if (code % 5 === 3) elements.fire += 1;
    else elements.earth += 1;
  }
  
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  return {
    gold: Math.round((elements.gold / total) * 100),
    wood: Math.round((elements.wood / total) * 100),
    water: Math.round((elements.water / total) * 100),
    fire: Math.round((elements.fire / total) * 100),
    earth: Math.round((elements.earth / total) * 100),
  };
}

// 🟢 核心：多线路获取第一笔交易时间
async function fetchFirstTxDate(address: string): Promise<string> {
  
  // --- 线路 1: Etherscan (需要 Key) ---
  if (API_KEY) {
    try {
      console.log("📡 [1/2] 尝试 Etherscan...");
      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === "1" && data.result.length > 0) {
        console.log("✅ Etherscan 获取成功");
        return new Date(parseInt(data.result[0].timeStamp) * 1000).toISOString().split('T')[0];
      } else {
        console.warn(`⚠️ Etherscan 失败: ${data.message}。尝试切换线路...`);
      }
    } catch (e) {
      console.warn("⚠️ Etherscan 连接错误，切换线路...");
    }
  } else {
    console.log("ℹ️ 未检测到 Etherscan Key，直接使用免费线路...");
  }

  // --- 线路 2: Blockscout (免费，无需 Key，Etherscan 兼容) ---
  try {
    console.log("📡 [2/2] 尝试 Blockscout (免费线路)...");
    // Blockscout 的 API 格式和 Etherscan 几乎一样
    const url = `https://eth.blockscout.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "1" && data.result && data.result.length > 0) {
       console.log("✅ Blockscout 获取成功");
       return new Date(parseInt(data.result[0].timeStamp) * 1000).toISOString().split('T')[0];
    }
    
    // 如果 result 是空的，说明可能是新账号，或者 API 结构微调
    if (data.message === "No transactions found") {
        return "新晋账号"; // 确实没交易
    }

  } catch (e) {
    console.error("❌ 所有线路均无法连接:", e);
  }

  return "未知";
}

export const getWalletData = async (address: string): Promise<WalletInfo> => {
  const now = Date.now();
  // 检查缓存
  if (dataCache[address] && (now - dataCache[address].timestamp < CACHE_DURATION)) {
    console.log(`⚡ 使用本地缓存数据: ${address}`);
    return dataCache[address].data;
  }

  try {
    console.log(`🔍 开始扫描: ${address}`);

    // 并行获取：余额和交易数 (通过 RPC，最稳)
    const [balanceWei, transactionCount] = await Promise.all([
      publicClient.getBalance({ address: address as `0x${string}` }),
      publicClient.getTransactionCount({ address: address as `0x${string}` })
    ]);

    const balanceEth = parseFloat(formatEther(balanceWei)).toFixed(4);
    
    // 获取日期 (通过多线路 API)
    const firstTxDate = await fetchFirstTxDate(address);

    // 打标签逻辑
    const tags = [];
    const ethNum = parseFloat(balanceEth);
    if (ethNum > 10) tags.push("大户");
    else if (ethNum < 0.01) tags.push("丐帮");
    if (transactionCount > 1000) tags.push("肝帝");
    
    if (firstTxDate !== "未知" && firstTxDate !== "新晋账号") {
      const year = new Date(firstTxDate).getFullYear();
      if (year <= 2017) tags.push('上古巨鲸');
      else if (year <= 2020) tags.push('DeFi老兵');
      else if (year >= 2024) tags.push('鲜嫩韭菜');
      else tags.push('Web3中坚');
    }

    const result: WalletInfo = {
      address,
      firstTxDate: firstTxDate === "新晋账号" ? new Date().toISOString().split('T')[0] : firstTxDate,
      walletAge: calculateAge(firstTxDate),
      balance: `${balanceEth} ETH`,
      transactionCount,
      pnlStatus: Math.random() > 0.5 ? '盈利' : '亏损',
      tags,
      cyberBazi: getCyberBazi(firstTxDate),
      elementalBase: calculateAddressElements(address)
    };

    // 写入缓存
    dataCache[address] = { timestamp: now, data: result };
    
    return result;

  } catch (error) {
    console.error("获取数据失败:", error);
    return {
      address,
      firstTxDate: '未知',
      walletAge: '未知',
      balance: '读取中...',
      transactionCount: 0,
      pnlStatus: '混沌',
      tags: ['连接不稳定'],
      cyberBazi: '无法探测',
      elementalBase: calculateAddressElements(address)
    };
  }
};