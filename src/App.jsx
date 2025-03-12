import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Container, Typography, Button, TextField, Paper, Box, MenuItem, Select } from "@mui/material";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [privateKey, setPrivateKey] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [prices, setPrices] = useState({});
  const [balanceETH, setBalanceETH] = useState("0.0");
  const [balanceUSDC, setBalanceUSDC] = useState("0.0");
  const [selectedToken, setSelectedToken] = useState("bitcoin");
  const [chartData, setChartData] = useState(null);
  const [swapAmount, setSwapAmount] = useState("0");
  const [swapDirection, setSwapDirection] = useState("ETH_TO_USDC");

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana,polygon,cardano,dogecoin&vs_currencies=usd"
        );
        setPrices(response.data);
      } catch (error) {
        console.error("Error fetching token prices:", error);
      }
    };

    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedToken}/market_chart?vs_currency=usd&days=7&interval=daily`
        );
        const labels = response.data.prices.map((price) => new Date(price[0]).toLocaleDateString());
        const data = response.data.prices.map((price) => price[1]);

        setChartData({
          labels,
          datasets: [
            {
              label: `Price of ${selectedToken.toUpperCase()}`,
              data,
              borderColor: "orange",
              backgroundColor: "rgba(255, 165, 0, 0.2)",
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };
    fetchChartData();
  }, [selectedToken]);

  const generateRecoveryPhrase = () => {
    const words = [
      "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew",
      "kiwi", "lemon", "mango", "nectarine", "orange", "papaya", "quince", "raspberry",
      "strawberry", "tangerine", "ugli", "vanilla", "watermelon", "xigua", "yellow", "zucchini"
    ];
    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
  };

  const generateWallet = () => {
    const newWallet = ethers.Wallet.createRandom();
    setWallet(newWallet);
    setPrivateKey(newWallet.privateKey);
    setRecoveryPhrase(generateRecoveryPhrase());
  };

  const fetchBalances = async () => {
    if (!wallet) return;
    const provider = new ethers.providers.JsonRpcProvider("https://shape-sepolia.g.alchemy.com/v2/-GAKmb1tfiiZaXGWZJh-2gZNOCTGoGWj");
    const balance = await provider.getBalance(wallet.address);
    setBalanceETH(ethers.utils.formatEther(balance));
    
    const usdcContract = new ethers.Contract("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", ["function balanceOf(address owner) view returns (uint256)"], provider);
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    setBalanceUSDC(ethers.utils.formatUnits(usdcBalance, 6));
  };

  const swapTokens = async () => {
    if (!wallet) return;
    const provider = new ethers.providers.JsonRpcProvider("https://shape-sepolia.g.alchemy.com/v2/-GAKmb1tfiiZaXGWZJh-2gZNOCTGoGWj");
    const signer = wallet.connect(provider);

    if (swapDirection === "ETH_TO_USDC") {
      const uniswapRouter = new ethers.Contract(
        "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        ["function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable"],
        signer
      );
      await uniswapRouter.swapExactETHForTokens(
        0,
        ["0xC02aaa39b223FE8D0A0e5C4F27ead9083C756Cc2", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
        wallet.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: ethers.utils.parseEther(swapAmount) }
      );
    }
    fetchBalances();
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: "center", backgroundColor: "#212121", color: "#fff" }}>
        <Typography variant="h4">MetaMask Clone</Typography>
        <Select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} fullWidth sx={{ mt: 2 }}>
          {Object.keys(prices).map((token) => (
            <MenuItem key={token} value={token}>{token.toUpperCase()}</MenuItem>
          ))}
        </Select>
        {chartData && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
        <Button variant="contained" color="primary" fullWidth onClick={generateWallet} sx={{ mt: 2 }}>Generate New Wallet</Button>
        {wallet && (
          <Box sx={{ mt: 3 }}>
            <Typography>Wallet Address: {wallet.address}</Typography>
            <Typography>Balance: {balanceETH} ETH | {balanceUSDC} USDC</Typography>
            <Button onClick={swapTokens}>Swap {swapDirection === "ETH_TO_USDC" ? "ETH to USDC" : "USDC to ETH"}</Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Wallet;

























