# 🏯 CryptoTemple (大加密寺)

> **Where Blockchain Destiny Meets Taoist Wisdom.**
> 链上算卦，指点迷津。

![Project Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Tech Stack](https://img.shields.io/badge/Stack-React%20|%20TypeScript%20|%20Tailwind-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Introduction (项目介绍)

**CryptoTemple** is a decentralized application (dApp) that provides a unique "On-chain Divination" experience. By connecting their Web3 wallet, users can generate a personalized fortune reading based on their unique wallet address hash.

Unlike the dark, moody aesthetics often found in crypto gaming (e.g., Black Myth), CryptoTemple embraces a **traditional, auspicious (吉利)** Taoist art style, aiming to bring good fortune and peace of mind to the volatile world of cryptocurrency.

**Key Features:**
* **Immersive Entry:** Features a "Temple Descending" animation and interactive temple doors that open upon wallet connection.
* **Address-Based Divination:** Unique algorithm that interprets wallet addresses to provide spiritual guidance.
* **Auspicious UI:** Designed with traditional colors and motifs to evoke a sense of blessing.
* **Donation System:** Users can offer crypto donations to the temple for good karma.

## 🛠 Tech Stack (技术栈)

* **Frontend Framework:** React 18
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion (Complex enter/exit animations)
* **Build Tool:** Vite
* **Package Manager:** npm

## 🚀 Getting Started (快速开始)

Follow these steps to set up the project locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/simonliuliu/crypto-temple.git](https://github.com/simonliuliu/crypto-temple.git)
    cd crypto-temple
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to view the application.

## 📂 Project Structure (目录结构)

```text
crypto-temple/
├── public/              # Static assets (images, icons)
│   └── images/          # Temple assets (temple-main.png, etc.)
├── src/
│   ├── components/      # React components (LandingPage, DivinationModal)
│   ├── animations/      # Framer Motion variants
│   ├── utils/           # Helper functions (Divination logic)
│   ├── App.tsx          # Main entry component
│   └── main.tsx         # DOM renderer
├── index.html           # HTML entry point
├── tailwind.config.js   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration