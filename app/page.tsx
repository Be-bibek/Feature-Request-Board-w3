'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWalletStore, FeatureRequest } from '@/lib/store';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronUp,
  Wallet,
  Coins,
  History,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
  FileCode,
  Flame,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'Planned': <Layers className="w-3.5 h-3.5" />,
  'In Progress': <Clock className="w-3.5 h-3.5" />,
  'Completed': <CheckCircle className="w-3.5 h-3.5" />,
  'Under Review': <HelpCircle className="w-3.5 h-3.5" />,
};

const STATUS_COLORS: Record<string, string> = {
  'Planned': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Completed': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  'Under Review': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const {
    publicKey,
    balance,
    isFunded,
    isLoading,
    isConnecting,
    transactions,
    requests,
    connectWallet,
    disconnectWallet,
    fetchBalance,
    fundWithFriendbot,
    upvoteRequest,
    submitRequest,
  } = useWalletStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  
  // Submit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccessHash, setModalSuccessHash] = useState<string | null>(null);

  // Handle client-side mounting
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Load balance when public key changes
  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey, fetchBalance]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter & Sort Feature Requests
  const filteredRequests = requests
    .filter((req) => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.upvotes - a.upvotes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleUpvote = async (id: string) => {
    if (!publicKey) {
      try {
        await connectWallet();
      } catch (err) {
        console.error(err);
      }
      return;
    }

    if (!isFunded) {
      alert('Your Testnet account is active but not funded yet. Please fund it first using Friendbot!');
      return;
    }

    try {
      await upvoteRequest(id);
    } catch (err: any) {
      alert(err?.message || 'Transaction was rejected or failed on the Stellar Testnet.');
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccessHash(null);

    if (!publicKey) {
      setModalError('Please connect your Stellar wallet first.');
      return;
    }

    if (!isFunded) {
      setModalError('Please fund your account via Friendbot before posting on-chain.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setModalError('Please fill in both title and description.');
      return;
    }

    try {
      await submitRequest(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      
      const latestTx = useWalletStore.getState().transactions[0];
      if (latestTx && latestTx.type === 'submit_request') {
        setModalSuccessHash(latestTx.hash);
      }
    } catch (err: any) {
      setModalError(err?.message || 'The Stellar transaction was canceled or failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative">
      
      {/* Background aurora blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 h-14 backdrop-blur-md bg-background/80 border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded bg-primary/10 border border-primary/20 text-primary">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <span className="text-foreground">Stellar</span>
                <span className="text-primary">Feature</span>
                <span className="text-foreground">Board</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-mono font-medium lowercase tracking-normal">testnet</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Wallet Integration Button */}
            {!publicKey ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-3.5 py-1.5 bg-primary text-primary-foreground font-mono text-[11px] font-bold uppercase tracking-wider rounded hover:opacity-95 transition-all flex items-center space-x-2 shadow-[0_0_12px_rgba(99,102,241,0.2)] cursor-pointer"
                id="connect-wallet-btn"
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
            ) : (
              <div className="hidden sm:flex items-center space-x-2 bg-secondary border border-border px-3 py-1 rounded font-mono text-xs text-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Connected:</span>
                <span className="font-medium">
                  {publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="ml-2 text-destructive hover:underline text-[10px] cursor-pointer font-bold uppercase tracking-wider"
                >
                  Disconnect
                </button>
              </div>
            )}

            {/* Light/Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded bg-secondary text-secondary-foreground border border-border hover:opacity-85 transition-all font-mono text-sm"
              title="Toggle theme mode"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Board Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 md:p-8 z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Bento: Wallet Status and On-Chain activity */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Mobile Connected Wallet Bar */}
          {publicKey && (
            <div className="sm:hidden p-3.5 rounded-lg bg-secondary border border-border flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="uppercase text-[10px] tracking-wider text-muted-foreground">Wallet:</span>
                <span className="font-medium text-foreground">
                  {publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 4)}
                </span>
              </div>
              <button onClick={disconnectWallet} className="text-destructive font-bold uppercase tracking-wider text-[10px]">
                Disconnect
              </button>
            </div>
          )}

          {/* Wallet and Network specs */}
          <div className="p-5 rounded-lg bg-card border border-border space-y-4 shadow-sm">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center space-x-2 border-b border-border pb-3">
              <Coins className="w-4 h-4 text-primary" />
              <span>Wallet & Stellar Node</span>
            </h2>

            {!publicKey ? (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect your Stellar wallet to vote on ideas or submit your own request. Submitting feature requests triggers an automated micro-metadata payment to record details securely on-chain.
                </p>
                <button
                  onClick={connectWallet}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider rounded shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Connect Stellar Wallet</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                {/* Balance Row */}
                <div className="flex justify-between items-center p-3 bg-secondary rounded border border-border">
                  <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Coins className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Balance</span>
                  </div>
                  <span className="font-bold text-foreground text-sm">{balance} XLM</span>
                </div>

                {/* Account status on Testnet */}
                {!isFunded ? (
                  <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 space-y-3 rounded">
                    <p className="text-[11px] text-yellow-600 dark:text-yellow-400 leading-normal">
                      ⚠️ This public key is not yet funded on the Stellar Testnet ledger. Click below to receive 10,000 test XLM instantly.
                    </p>
                    <button
                      onClick={fundWithFriendbot}
                      disabled={isLoading}
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {isLoading ? 'Requesting...' : '🎁 Fund 10,000 XLM'}
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 text-[11px] font-mono">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="uppercase tracking-wider">Ledger Active on Testnet</span>
                  </div>
                )}

                <div className="pt-3 text-[10px] text-muted-foreground leading-normal border-t border-border space-y-1">
                  <div><strong>NETWORK:</strong> Horizon Testnet</div>
                  <div className="truncate"><strong>WALLET KIT:</strong> Freighter SDK v2</div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Activity Bento */}
          <div className="p-5 rounded-lg bg-card border border-border space-y-4 shadow-sm">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center space-x-2 border-b border-border pb-3">
              <History className="w-4 h-4 text-primary" />
              <span>On-Chain Activity Logs</span>
            </h2>

            {transactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground font-mono uppercase tracking-wider">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="p-3 bg-secondary rounded border border-border flex flex-col space-y-1.5 font-mono text-[11px] hover:border-primary/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'submit_request' ? 'text-primary' : 'text-emerald-500'
                      }`}>
                        {tx.type === 'submit_request' ? '💡 Request' : '👍 Upvote'}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-foreground line-clamp-1">{tx.description}</p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center space-x-1 text-[10px] pt-1.5 border-t border-border/40 font-bold uppercase tracking-wider"
                    >
                      <span>Verify Tx</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help box */}
          <div className="p-4 rounded-lg bg-secondary/40 border border-border space-y-2.5">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-foreground flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-primary" />
              <span>How it works</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Submitting a request or voting prompts a micro-metadata payment (0.0001 XLM) via Freighter. This anchors the unique transaction payload securely into the Stellar ledger as verified public states.
            </p>
          </div>

        </div>

        {/* Right Bento (Col-span-2): Main request list */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Header block with "Add Request" button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border p-5 rounded-lg shadow-sm">
            <div>
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Feature Requests Backlog
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Explore community-submitted developer suggestions or post your own on-chain.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 bg-primary text-primary-foreground font-mono text-[11px] font-bold uppercase tracking-wider rounded hover:opacity-95 transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(99,102,241,0.25)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Request</span>
              </button>
              
              <Link
                href="/submit"
                className="p-2 bg-secondary text-secondary-foreground border border-border rounded font-mono text-xs font-medium hover:opacity-80 transition-all sm:hidden"
                title="Dedicated submission page"
              >
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="p-3.5 rounded-lg bg-card border border-border flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search suggestions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-secondary text-foreground rounded border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
              {['All', 'Planned', 'In Progress', 'Completed', 'Under Review'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-primary text-primary-foreground border-primary font-bold uppercase tracking-wider text-[10px]'
                      : 'bg-secondary text-muted-foreground border-border hover:text-foreground text-[10px]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-border w-full md:w-auto justify-between md:justify-end">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Sort:</span>
              <div className="flex bg-secondary border border-border rounded p-0.5">
                <button
                  onClick={() => setSortBy('votes')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    sortBy === 'votes'
                      ? 'bg-card text-foreground font-bold uppercase tracking-wider'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Upvotes
                </button>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    sortBy === 'newest'
                      ? 'bg-card text-foreground font-bold uppercase tracking-wider'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Newest
                </button>
              </div>
            </div>

          </div>

          {/* Feature Requests List */}
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="p-10 text-center rounded-lg bg-card border border-border shadow-sm space-y-2.5">
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">No matching feature requests found.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedStatus('All'); }}
                  className="text-xs text-primary font-mono hover:underline cursor-pointer uppercase tracking-wider font-bold text-[10px]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredRequests.map((req) => {
                    const hasVoted = publicKey ? req.voters.includes(publicKey) : false;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        whileHover={{ scale: 1.002 }}
                        transition={{ duration: 0.2 }}
                        key={req.id}
                        className="group p-4 rounded-lg bg-card border border-border flex items-start gap-4 shadow-sm hover:border-primary/50 hover:bg-primary/[0.01] transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Glow indicator on voted cards */}
                        {hasVoted && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500" />
                        )}

                        {/* Upvote Button Column */}
                        <motion.button
                          onClick={() => handleUpvote(req.id)}
                          disabled={isLoading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center justify-center min-w-[52px] h-13 rounded border transition-all cursor-pointer ${
                            hasVoted
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                              : 'bg-secondary text-muted-foreground border-border hover:border-primary/30 hover:text-primary group-hover:border-primary/30'
                          }`}
                        >
                          <ChevronUp className={`w-4 h-4 ${hasVoted ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                          <span className="text-xs font-mono font-bold mt-0.5">{req.upvotes}</span>
                        </motion.button>

                        {/* Middle Info Column */}
                        <div className="flex-grow space-y-1.5">
                          <div className="space-y-0.5">
                            <h3 className="font-sans font-bold text-sm tracking-tight text-foreground flex items-center space-x-2 flex-wrap">
                              <span>{req.title}</span>
                              {req.txHash && (
                                <a
                                  href={`https://stellar.expert/explorer/testnet/tx/${req.txHash}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-[9px] uppercase tracking-wider font-mono text-primary hover:underline ml-1.5"
                                  title="Verify on Stellar"
                                >
                                  <span>⛓️ Verified</span>
                                </a>
                              )}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              Requested by:{' '}
                              <span className="text-foreground">
                                {req.creator.substring(0, 8)}...{req.creator.substring(req.creator.length - 8)}
                              </span>
                            </p>
                          </div>

                          <p className="text-xs text-foreground/80 leading-relaxed font-sans pr-4">
                            {req.description}
                          </p>

                          <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                            <span>Posted {new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Right Status badge column */}
                        <div className="shrink-0 flex items-center self-center sm:self-start">
                          <div className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 font-bold uppercase tracking-wider border ${STATUS_COLORS[req.status]}`}>
                            {STATUS_ICONS[req.status]}
                            <span className="hidden sm:inline">{req.status}</span>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

        </div>

      </main>

      {/* Developer Real-Time Status Rail */}
      <div className="border-t border-border bg-card/60 backdrop-blur-md py-3 px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-muted-foreground font-mono tracking-wider">
        <div className="flex items-center gap-6">
          <span className="flex items-center">
            STATUS:&nbsp;
            <span className="text-emerald-500 font-bold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </span>
          <span className="hidden sm:inline">PROTOCOL: SOROBAN-V2</span>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
          <span>LEDGER BLOCK #52,891,021</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-2">
          <p className="text-xs text-muted-foreground font-mono">
            Feature Request Board • High-fidelity Web3 Demo on Stellar Testnet
          </p>
          <p className="text-[11px] text-muted-foreground/60 font-mono">
            React 19 • Next.js 15 • Tailwind v4 • Stellar SDK
          </p>
        </div>
      </footer>

      {/* Floating Submit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border w-full max-w-lg rounded-lg shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-4.5 border-b border-border flex justify-between items-center bg-[#0c0c0e]">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                  <span>Submit Feature Request</span>
                  <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono uppercase tracking-normal">Testnet</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modalSuccessHash ? (
                <div className="p-5 space-y-4">
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded flex items-start space-x-2 text-xs">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-[11px]">Transaction Confirmed on-chain!</h4>
                      <p className="mt-1 text-muted-foreground leading-relaxed">
                        Your request was successfully submitted as a metadata payment inside the Stellar ledger.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-secondary border border-border rounded font-mono text-[11px] flex justify-between items-center">
                    <span className="text-muted-foreground">Tx hash:</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${modalSuccessHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline max-w-[280px] truncate"
                    >
                      {modalSuccessHash}
                    </a>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setModalSuccessHash(null);
                        setIsModalOpen(false);
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider rounded hover:opacity-95"
                    >
                      Close Board Panel
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="p-5 space-y-4">
                  
                  {modalError && (
                    <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                      ⚠️ {modalError}
                    </div>
                  )}

                  {!publicKey ? (
                    <div className="p-5 rounded bg-secondary border border-border text-center space-y-3">
                      <p className="text-xs text-muted-foreground font-sans">
                        You must connect your Stellar wallet first to register requests on-chain.
                      </p>
                      <button
                        type="button"
                        onClick={connectWallet}
                        className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider rounded hover:opacity-95"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  ) : !isFunded ? (
                    <div className="p-4 rounded bg-yellow-500/10 border border-yellow-500/20 text-center space-y-3">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-sans leading-relaxed">
                        Your account is not funded on the Testnet ledger. Fund it first with 10,000 free XLM using Friendbot.
                      </p>
                      <button
                        type="button"
                        onClick={fundWithFriendbot}
                        className="px-4 py-2 bg-yellow-500 text-black font-mono text-xs font-bold uppercase tracking-wider rounded"
                      >
                        🎁 Fund Account via Friendbot
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-bold">
                          Feature Request Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Integrate Stellar Assets transfer logs"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          maxLength={80}
                          required
                          disabled={isLoading}
                          className="w-full px-3 py-2 bg-secondary text-foreground rounded border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
                        />
                        <div className="text-[10px] text-right font-mono text-muted-foreground">
                          {title.length}/80 chars
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-bold">
                          Description & Value
                        </label>
                        <textarea
                          placeholder="Provide details about the requested feature..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          required
                          disabled={isLoading}
                          className="w-full px-3 py-2 bg-secondary text-foreground rounded border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs resize-none"
                        />
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center space-x-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>On-chain cost: 0.0001 XLM</span>
                        </span>

                        <div className="flex space-x-2.5">
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-3.5 py-1.5 bg-secondary text-secondary-foreground border border-border rounded font-mono text-xs font-bold uppercase tracking-wider hover:opacity-80"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading || !title.trim() || !description.trim()}
                            className="px-4 py-1.5 bg-primary text-primary-foreground rounded font-mono text-xs font-bold uppercase tracking-wider hover:opacity-95 disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <span>Post On-Chain</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
