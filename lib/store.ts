'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { Networks, Horizon, TransactionBuilder, Operation, Asset, Memo } from '@stellar/stellar-sdk';

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Under Review';
  upvotes: number;
  creator: string;
  voters: string[]; // List of public keys that voted
  txHash?: string;
  createdAt: string;
}

export interface WalletTransaction {
  hash: string;
  type: 'submit_request' | 'upvote';
  description: string;
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
}

interface WalletState {
  publicKey: string | null;
  balance: string;
  isFunded: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  transactions: WalletTransaction[];
  requests: FeatureRequest[];
  
  // Actions
  initializeKit: () => any;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  fetchBalance: () => Promise<void>;
  fundWithFriendbot: () => Promise<void>;
  submitRequest: (title: string, description: string) => Promise<void>;
  upvoteRequest: (id: string) => Promise<void>;
  addTransaction: (tx: WalletTransaction) => void;
}

const DEFAULT_REQUESTS: FeatureRequest[] = [
  {
    id: 'req_1',
    title: 'Dark Mode Auto-switching based on OS theme',
    description: 'Provide an option to automatically match system-wide OS light/dark preferences for a seamless transitions between daytime and night environments.',
    status: 'Planned',
    upvotes: 42,
    creator: 'GB3RKNOCWWST7R6PWCO6YF67STKAI4Z6ZGCVUTL65H6P6XU7Y4N56DMC',
    voters: [],
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_2',
    title: 'Stellar Expert Explorer transaction detail links',
    description: 'Add direct, high-contrast links to StellarExpert Explorer for all submitted transactions and upvote actions so they can be verified on-chain.',
    status: 'Completed',
    upvotes: 56,
    creator: 'GB3RKNOCWWST7R6PWCO6YF67STKAI4Z6ZGCVUTL65H6P6XU7Y4N56DMC',
    voters: [],
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_3',
    title: 'Freighter Wallet Auto-connect on page refresh',
    description: 'Persist the session state so that if a user has already allowed the connection, they do not need to click "Connect Wallet" again after reloading.',
    status: 'In Progress',
    upvotes: 28,
    creator: 'GB3RKNOCWWST7R6PWCO6YF67STKAI4Z6ZGCVUTL65H6P6XU7Y4N56DMC',
    voters: [],
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_4',
    title: 'Real-time WebSocket events for on-chain state sync',
    description: 'Incorporate a WebSocket stream from Horizon to auto-refresh the feature lists and upvote numbers instantly when ledger transactions are confirmed.',
    status: 'Under Review',
    upvotes: 11,
    creator: 'GB3RKNOCWWST7R6PWCO6YF67STKAI4Z6ZGCVUTL65H6P6XU7Y4N56DMC',
    voters: [],
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  }
];

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);

// Destination address to accept votes/requests on Testnet (random valid testnet account)
const APP_DESTINATION_ADDRESS = 'GB3RKNOCWWST7R6PWCO6YF67STKAI4Z6ZGCVUTL65H6P6XU7Y4N56DMC';

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      publicKey: null,
      balance: '0.0000',
      isFunded: false,
      isLoading: false,
      isConnecting: false,
      transactions: [],
      requests: DEFAULT_REQUESTS,

      initializeKit: () => {
        if (typeof window === 'undefined') return null;
        return StellarWalletsKit.init({
          network: Networks.TESTNET,
          modules: [new FreighterModule()],
        });
      },

      connectWallet: async () => {
        set({ isConnecting: true });
        try {
          get().initializeKit();
          const response = await StellarWalletsKit.authModal();
          
          if (response && response.address) {
            set({ publicKey: response.address, isConnecting: false });
            await get().fetchBalance();
            return response.address;
          }
          set({ isConnecting: false });
          return null;
        } catch (error) {
          console.error('Wallet connection failed:', error);
          set({ isConnecting: false });
          return null;
        }
      },

      disconnectWallet: () => {
        set({ publicKey: null, balance: '0.0000', isFunded: false });
      },

      fetchBalance: async () => {
        const { publicKey } = get();
        if (!publicKey) return;

        set({ isLoading: true });
        try {
          const account = await server.loadAccount(publicKey);
          const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
          
          set({
            balance: nativeBalance ? parseFloat(nativeBalance.balance).toFixed(4) : '0.0000',
            isFunded: true,
            isLoading: false,
          });
        } catch (error: any) {
          // Account doesn't exist/not funded
          if (error.status === 404) {
            set({ balance: '0.0000', isFunded: false });
          } else {
            console.error('Failed to fetch balance:', error);
          }
          set({ isLoading: false });
        }
      },

      fundWithFriendbot: async () => {
        const { publicKey } = get();
        if (!publicKey) return;

        set({ isLoading: true });
        try {
          const response = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
          if (response.ok) {
            // Wait slightly for ledger ingestion
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await get().fetchBalance();
          } else {
            throw new Error('Friendbot funding request failed');
          }
        } catch (error) {
          console.error('Failed to fund account:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      submitRequest: async (title: string, description: string) => {
        const { publicKey, isFunded } = get();
        if (!publicKey) throw new Error('Connect your wallet first');
        if (!isFunded) throw new Error('Fund your account on the Testnet first');

        set({ isLoading: true });
        const requestTempId = 'req_' + Math.random().toString(36).substr(2, 9);

        try {
          // 1. Fetch source account from Horizon to get the active sequence number
          const sourceAccount = await server.loadAccount(publicKey);

          // 2. Build the on-chain transaction with a Memo linking the request
          // We make a micro-payment of 0.0001 XLM to the app's address, with a Memo identifying the request
          const tx = new TransactionBuilder(sourceAccount, {
            fee: '100',
            networkPassphrase: Networks.TESTNET,
          })
            .addOperation(
              Operation.payment({
                destination: APP_DESTINATION_ADDRESS,
                asset: Asset.native(),
                amount: '0.0001',
              })
            )
            .addMemo(Memo.text(`SUB:${requestTempId.substr(4)}`))
            .setTimeout(60)
            .build();

          // 3. Request signature from Freighter
          const signedResult = await StellarWalletsKit.signTransaction(tx.toXDR(), {
            networkPassphrase: Networks.TESTNET,
          });

          // 4. Submit to Horizon Testnet
          const submitResult = await server.submitTransaction(
            TransactionBuilder.fromXDR(signedResult.signedTxXdr, Networks.TESTNET)
          );

          if (submitResult.hash) {
            const newRequest: FeatureRequest = {
              id: requestTempId,
              title,
              description,
              status: 'Under Review',
              upvotes: 1,
              creator: publicKey,
              voters: [publicKey],
              txHash: submitResult.hash,
              createdAt: new Date().toISOString(),
            };

            const newTx: WalletTransaction = {
              hash: submitResult.hash,
              type: 'submit_request',
              description: `Submitted Request: "${title}"`,
              timestamp: new Date().toISOString(),
              status: 'success',
            };

            set((state) => ({
              requests: [newRequest, ...state.requests],
              transactions: [newTx, ...state.transactions],
            }));

            // Refresh balance
            await get().fetchBalance();
          }
        } catch (error) {
          console.error('Failed to submit request on-chain:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      upvoteRequest: async (id: string) => {
        const { publicKey, isFunded, requests } = get();
        if (!publicKey) throw new Error('Connect your wallet first');
        if (!isFunded) throw new Error('Fund your account on the Testnet first');

        const targetRequest = requests.find((r) => r.id === id);
        if (!targetRequest) return;
        if (targetRequest.voters.includes(publicKey)) {
          throw new Error('You have already upvoted this request');
        }

        set({ isLoading: true });

        try {
          // 1. Fetch source account from Horizon
          const sourceAccount = await server.loadAccount(publicKey);

          // 2. Build transaction with a Memo identifying the upvoted request
          const tx = new TransactionBuilder(sourceAccount, {
            fee: '100',
            networkPassphrase: Networks.TESTNET,
          })
            .addOperation(
              Operation.payment({
                destination: APP_DESTINATION_ADDRESS,
                asset: Asset.native(),
                amount: '0.0001',
              })
            )
            .addMemo(Memo.text(`VOTE:${id.substr(4)}`))
            .setTimeout(60)
            .build();

          // 3. Request signature from Freighter
          const signedResult = await StellarWalletsKit.signTransaction(tx.toXDR(), {
            networkPassphrase: Networks.TESTNET,
          });

          // 4. Submit to Horizon Testnet
          const submitResult = await server.submitTransaction(
            TransactionBuilder.fromXDR(signedResult.signedTxXdr, Networks.TESTNET)
          );

          if (submitResult.hash) {
            const newTx: WalletTransaction = {
              hash: submitResult.hash,
              type: 'upvote',
              description: `Upvoted: "${targetRequest.title}"`,
              timestamp: new Date().toISOString(),
              status: 'success',
            };

            set((state) => ({
              requests: state.requests.map((r) =>
                r.id === id
                  ? {
                      ...r,
                      upvotes: r.upvotes + 1,
                      voters: [...r.voters, publicKey],
                    }
                  : r
              ),
              transactions: [newTx, ...state.transactions],
            }));

            // Refresh balance
            await get().fetchBalance();
          }
        } catch (error) {
          console.error('Failed to upvote request on-chain:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      addTransaction: (tx: WalletTransaction) => {
        set((state) => ({
          transactions: [tx, ...state.transactions],
        }));
      },
    }),
    {
      name: 'stellar-feature-request-board',
      partialize: (state) => ({
        requests: state.requests,
        transactions: state.transactions,
      }),
    }
  )
);
