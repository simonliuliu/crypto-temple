export const ProjectType = {
    PRIMARY_MARKET: '一级市场 (土狗/Meme)',
    SECONDARY_MARKET: '二级市场 (主流币)',
    OTC: 'OTC / 场外',
    AIRDROP: '空投交互',
    STAKING: '质押 / DeFi',
    NFT: 'NFT 铸造'
  } as const;
  
  export type ProjectType = typeof ProjectType[keyof typeof ProjectType];
  
  // 五行基础结构
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