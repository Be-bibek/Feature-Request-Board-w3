# 🚀 Stellar Feature Request Board

A modern, high-fidelity developer-tool-inspired board where users can submit and upvote feature ideas with real-world Web3 integrations. Built with Next.js 15, Tailwind CSS, Framer Motion, and the **Stellar Horizon Testnet**!


***Home Screen***

<img width="1280" height="637" alt="image" src="https://github.com/user-attachments/assets/a3ac6297-1308-446b-94ce-3efeb8139fa8" /> 

***Home Screen*** mobile view 
<img width="278" height="489" alt="image" src="https://github.com/user-attachments/assets/2344f384-0b5b-411e-b143-ad8ab8b38a48" />

---

## 🌟 Overview

The **Stellar Feature Request Board** is a Web3-native governance and feedback board. Instead of central databases, every single user action—whether submitting a new feature idea or casting an upvote—is built, signed, and recorded directly on the **Stellar Testnet blockchain** as metadata payment transactions. 

The application features a sleek, utilitarian, developer-tool-inspired UI featuring a gorgeous light/dark mode, fully responsive bento layouts, fluid Framer Motion list transitions, and on-chain verification links straight to the **StellarExpert explorer**!

---

## ✨ Key Features

- **🌐 Web3 Stellar Integration**: Connect and authenticate with the **Freighter Wallet** using the latest `stellar-wallets-kit` v2 API.
- **⛓️ On-Chain Submissions**: Building and submitting real operations on the Stellar Horizon Testnet. Each request costs a micro-metadata fee of 0.0001 XLM.
- **👍 Trustless Voting**: Cast upvotes as signed on-chain ledger actions. Voted items are securely tracked and verified via transaction hashes.
- **🎁 Instant Friendbot funding**: Integrated testnet faucet allowing newly created wallets to fund themselves with 10,000 XLM in a single tap.
- **🌓 Systematic Light/Dark Mode**: Seamless, system-connected light and dark themes using CSS variables with automatic system preference detection.
- **📊 Bento Box Dashboard**: A premium modular grid panel tracking wallet status, real-time balances, recent transaction logs, and the active request feed.
- **🎨 Custom Micro-animations**: Ultra-smooth page transitions, list staggering, hover scales, and interactive clicks powered by **Framer Motion**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://motion.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Stellar SDK**: [@stellar/stellar-sdk](https://www.npmjs.com/package/@stellar/stellar-sdk)
- **Wallet Connection**: [@creit.tech/stellar-wallets-kit](https://www.npmjs.com/package/@creit.tech/stellar-wallets-kit)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme Manager**: [Next Themes](https://github.com/pacocoursey/next-themes)

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Prerequisites
Ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher)
- **Freighter Wallet Extension** installed in your browser ([Get Freighter](https://www.freighter.app/))

### 2. Installation
Clone this repository and install dependencies:
```bash
npm install
```

### 3. Running the Development Server
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Setting up Freighter for Testnet
1. Open the **Freighter Wallet extension**.
2. Go to **Settings** (gear icon) > **Preferences** > **Select Network** and set it to **Testnet**.
3. Create or import an account.
4. Open the app, connect your wallet, and click **🎁 Fund with Friendbot** to seed your wallet with free testnet XLM.
5. Start submitting and upvoting on-chain!

---

Made with Love by **Stellar Developer Community** ❤️
