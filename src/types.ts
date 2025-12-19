// ==============================
// 1. UI 动画相关类型 (新加的)
// ==============================
export interface Deity {
    id: number;
    name: string;
    title: string;
    side: 'left' | 'right' | 'back';
    x: number; // Percent from center
    y: number; // Percent from bottom
    icon: string;
    color: string;
  }
  
  export interface DeityCardInfo {
    id: string;
    name: string;
    role: string;
    imageAlt: string;
    color: string;
    icon: string;
    isLocked?: boolean;
  }
  
  export type AppStage = 'ENTRANCE' | 'OPENING_GATE' | 'INNER_SANCTUM';
  
  // ==============================
  // 2. 核心业务逻辑类型 (原来的)
  // ==============================
  
  // 定义项目类型的常量对象 (用于逻辑判断)
  export const ProjectType = {
    PRIMARY_MARKET: '一级市场 (土狗/Meme)',
    SECONDARY_MARKET: '二级市场 (主流币)',
    OTC: 'OTC / 场外',
    AIRDROP: '空投交互',
    STAKING: '质押 / DeFi',
    NFT: 'NFT 铸造'
  } as const;
  
  // 定义项目类型的 Type (用于 TypeScript 类型检查)
  export type ProjectType = typeof ProjectType[keyof typeof ProjectType];
  
  export interface FiveElements {
    gold: number;
    wood: number;
    water: number;
    fire: number;
    earth: number;
  }
  
  export interface WalletInfo {
    address: string;
    firstTxDate: string;      
    walletAge: string;        
    balance: string;          
    transactionCount: number; 
    pnlStatus: '盈利' | '亏损' | '混沌';
    tags: string[];
    cyberBazi?: string;       
    elementalBase?: FiveElements; 
  }
  
  export interface ProjectInfo {
    name: string;
    type: string;
    transactionTime: string; 
    founderInfo: string;
  }
  
  export interface DivinationResult {
    probability: number;
    hexagramName: string;
    summary: string;
    analysis: string;
    advice: string;
    fiveElements: FiveElements;
  }
  
  export interface HistoryRecord {
    id: string; 
    timestamp: number; 
    project: ProjectInfo;
    result: DivinationResult;
    isNotified: boolean; 
    feedback?: 'accurate' | 'inaccurate'; 
  }