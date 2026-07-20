'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/lib/store';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Wallet, Coins, CheckCircle, Flame, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SubmitRequestPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const {
    publicKey,
    balance,
    isFunded,
    isLoading,
    isConnecting,
    connectWallet,
    fundWithFriendbot,
    submitRequest,
  } = useWalletStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [txSuccessHash, setTxSuccessHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxSuccessHash(null);

    if (!publicKey) {
      setError('Please connect your Stellar wallet first.');
      return;
    }

    if (!isFunded) {
      setError('Your Stellar account must be funded on the Testnet first.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please fill in all the fields.');
      return;
    }

    try {
      await submitRequest(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      
      // Get the hash of the latest transaction
      const latestTx = useWalletStore.getState().transactions[0];
      if (latestTx && latestTx.type === 'submit_request') {
        setTxSuccessHash(latestTx.hash);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Transaction was canceled or failed on the Stellar Testnet.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Background ambient auroras */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-mono text-sm">Back to Board</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-secondary text-secondary-foreground border border-border hover:opacity-80 transition-all font-mono text-xs flex items-center space-x-1"
              title="Toggle Theme"
              id="theme-toggle"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Stellar Horizon Testnet</span>
            </div>
            <h1 className="text-4xl font-display font-medium tracking-tight text-foreground">
              Submit a Feature Request 💡
            </h1>
            <p className="text-muted-foreground text-md max-w-xl">
              Describe your idea. Submissions are registered on the Stellar Testnet ledger as payment metadata transactions, making them fully transparent and verifiable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="md:col-span-2 space-y-6">
              {txSuccessHash ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-card border border-green-500/30 shadow-lg shadow-green-500/5 space-y-4"
                >
                  <div className="flex items-start space-x-3 text-green-500">
                    <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display font-medium text-lg text-foreground">
                        On-Chain Submission Successful!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your request has been successfully recorded in ledger transaction metadata on the Stellar Testnet.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-secondary rounded-xl border border-border space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-muted-foreground">Tx Hash:</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txSuccessHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline break-all block max-w-[180px] sm:max-w-xs truncate"
                      >
                        {txSuccessHash}
                      </a>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Link
                      href="/"
                      className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs rounded-xl font-medium shadow-md hover:opacity-95 transition-all text-center flex-1"
                    >
                      Go back to Board 📋
                    </Link>
                    <button
                      onClick={() => setTxSuccessHash(null)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground font-mono text-xs rounded-xl font-medium border border-border hover:opacity-80 transition-all flex-1"
                    >
                      Submit Another 💡
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-2xl bg-card border border-border space-y-6 shadow-xl">
                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Feature Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Multi-signature support for team accounts"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={80}
                      disabled={isLoading}
                      required
                      className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-sans"
                    />
                    <div className="text-[10px] text-right text-muted-foreground font-mono">
                      {title.length}/80 characters
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Description & Business Value
                    </label>
                    <textarea
                      placeholder="Explain the feature, how it works, and why it is beneficial for developers..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      disabled={isLoading}
                      required
                      className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-sans resize-y"
                    />
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <Link
                      href="/"
                      className="px-4 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-xl font-mono text-xs font-medium hover:opacity-80 transition-all"
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      disabled={isLoading || !title.trim() || !description.trim()}
                      className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-mono text-xs font-medium hover:opacity-95 disabled:opacity-50 transition-all flex items-center space-x-2 shadow-lg shadow-primary/25 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          <span>Signing & Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit On-Chain (0.0001 XLM)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-6">
              {/* Wallet Info Widget */}
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-md">
                <h3 className="font-display font-medium text-sm text-foreground flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span>Wallet Connection</span>
                </h3>

                {!publicKey ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Please connect your Stellar Freighter wallet to sign and submit feature requests on the network.
                    </p>
                    <button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      className="w-full py-2 bg-primary text-primary-foreground font-mono text-xs rounded-xl font-medium shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Connect Wallet</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                        Public Key
                      </div>
                      <div className="text-xs font-mono bg-secondary px-2.5 py-1.5 rounded-lg border border-border break-all text-foreground">
                        {publicKey.substring(0, 8)}...{publicKey.substring(publicKey.length - 8)}
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-secondary p-2.5 rounded-lg border border-border">
                      <div className="flex items-center space-x-1.5">
                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-xs font-mono uppercase text-muted-foreground">Balance:</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-foreground">{balance} XLM</span>
                    </div>

                    {!isFunded ? (
                      <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 space-y-2">
                        <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-mono">
                          ⚠️ Account is not active on Testnet. Fund it below to interact on-chain.
                        </p>
                        <button
                          onClick={fundWithFriendbot}
                          disabled={isLoading}
                          className="w-full py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black font-mono text-[10px] rounded-lg font-medium transition-all"
                        >
                          {isLoading ? 'Funding...' : '🎁 Fund with Friendbot'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-green-500 font-mono text-[10px]">
                        <CheckCircle className="w-3 h-3" />
                        <span>Ready for On-Chain interactions</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Developer info box */}
              <div className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  <span>Stellar Specs</span>
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Fee:</strong> Only 100 stroops (0.0001 XLM) network fee per request.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Memo Format:</strong> Text memo formatted with a unique transaction metadata payload.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>Ledger speed:</strong> Verified and recorded on-chain in 3-5 seconds.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground font-mono space-y-1">
          <p>Feature Request Board • Built with React 19, Next.js 15 & Stellar SDK</p>
          <p>Made with Love by Stellar Developer Community ❤️</p>
        </div>
      </footer>
    </div>
  );
}
