import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

// 1. 设置查询客户端
export const queryClient = new QueryClient();

// 2. Reown Cloud Project ID (这是公共测试ID，你可以先用着)
export const projectId = 'f9c06180352227d82531641048b17679';

// 3. 配置支持的网络
export const networks = [mainnet, arbitrum];

// 4. 创建适配器
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

// 5. 初始化模态框
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Crypto Temple',
    description: '大加密寺 - 链上算命',
    url: 'https://cryptotemple.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#d4af37', // 寺庙金
    '--w3m-border-radius-master': '2px'
  }
});

export { WagmiAdapter };