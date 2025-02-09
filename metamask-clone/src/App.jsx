import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Container, Typography, Button, TextField, Paper, Box, MenuItem, Select } from "@mui/material";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [privateKey, setPrivateKey] = useState("");
  const [balance, setBalance] = useState("0.0");
  const [prices, setPrices] = useState({});
  const [selectedToken, setSelectedToken] = useState("bitcoin");
  const [chartData, setChartData] = useState(null);
  const [swapAmount, setSwapAmount] = useState("");
  const [swapFrom, setSwapFrom] = useState("ethereum");
  const [swapTo, setSwapTo] = useState("bitcoin");

  // Token List
  const tokenList = ["ethereum", "bitcoin", "solana", "polygon", "cardano", "dogecoin"];

  // Fetch Live Prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${tokenList.join(",")}&vs_currencies=usd`
        );
        setPrices(response.data);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Token Chart Data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedToken}/market_chart?vs_currency=usd&days=7&interval=daily`
        );
        const data = response.data.prices.map(([timestamp, price]) => ({
          time: new Date(timestamp).toLocaleDateString(),
          price,
        }));

        setChartData({
          labels: data.map((entry) => entry.time),
          datasets: [
            {
              label: `${selectedToken.toUpperCase()} Price`,
              data: data.map((entry) => entry.price),
              borderColor: "#ffcc80",
              backgroundColor: "rgba(255, 204, 128, 0.2)",
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

  // Generate New Wallet
  const generateWallet = () => {
    const newWallet = ethers.Wallet.createRandom();
    setWallet(newWallet);
    setBalance("0.0");
  };

  // Import Existing Wallet
  const importWallet = () => {
    try {
      const importedWallet = new ethers.Wallet(privateKey);
      setWallet(importedWallet);
      fetchBalance(importedWallet);
    } catch (error) {
      alert("Invalid Private Key");
    }
  };

  // Fetch User Balance
  const fetchBalance = async (walletInstance) => {
    try {
      const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
      const balanceWei = await provider.getBalance(walletInstance.address);
      setBalance(ethers.formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Swap Tokens (Mock Function)
  const swapTokens = () => {
    if (!wallet) {
      alert("Please connect a wallet first.");
      return;
    }

    if (!swapAmount || isNaN(swapAmount) || swapAmount <= 0) {
      alert("Enter a valid amount to swap.");
      return;
    }

    alert(`Swapping ${swapAmount} ${swapFrom.toUpperCase()} to ${swapTo.toUpperCase()} (Demo Functionality)`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: "center", backgroundColor: "#212121", color: "#fff" }}>
        <Typography variant="h4" gutterBottom>
          MetaMask Clone
        </Typography>

        {/* Token Price Chart */}
        <Box sx={{ textAlign: "left", mt: 2, p: 2, backgroundColor: "#333", borderRadius: 2 }}>
          <Typography variant="h6">Price Chart ({selectedToken.toUpperCase()})</Typography>
          <Select
            fullWidth
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            sx={{ backgroundColor: "#444", color: "#fff", mt: 1 }}
          >
            {tokenList.map((token) => (
              <MenuItem key={token} value={token}>
                {token.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
          {chartData && <Line data={chartData} />}
        </Box>

        {/* Generate New Wallet */}
        <Button variant="contained" color="primary" fullWidth onClick={generateWallet} sx={{ mt: 2, backgroundColor: "#64b5f6" }}>
          Generate New Wallet
        </Button>

        {/* Import Wallet */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <TextField
            variant="outlined"
            label="Enter Private Key"
            fullWidth
            sx={{ input: { color: "#fff" } }}
            onChange={(e) => setPrivateKey(e.target.value)}
            InputLabelProps={{ style: { color: "#fff" } }}
          />
          <Button variant="contained" color="secondary" onClick={importWallet} sx={{ backgroundColor: "#e57373" }}>
            Import
          </Button>
        </Box>

        {/* Wallet Details */}
        {wallet && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Wallet Address:</Typography>
            <Typography variant="body1" sx={{ wordBreak: "break-all", color: "#ffcc80" }}>{wallet.address}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Private Key:</Typography>
            <Typography variant="body1" sx={{ wordBreak: "break-all", color: "#ffcc80" }}>{wallet.privateKey}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Balance:</Typography>
            <Typography variant="body1" sx={{ color: "#ffcc80" }}>{balance} ETH</Typography>
          </Box>
        )}

        {/* Swap Functionality */}
        {wallet && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Swap Tokens</Typography>
            <TextField
              variant="outlined"
              label="Amount"
              type="number"
              fullWidth
              sx={{ input: { color: "#fff" }, mt: 1 }}
              onChange={(e) => setSwapAmount(e.target.value)}
            />
            <Select fullWidth value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)} sx={{ mt: 1 }}>
              {tokenList.map((token) => <MenuItem key={token} value={token}>{token.toUpperCase()}</MenuItem>)}
            </Select>
            <Select fullWidth value={swapTo} onChange={(e) => setSwapTo(e.target.value)} sx={{ mt: 1 }}>
              {tokenList.map((token) => <MenuItem key={token} value={token}>{token.toUpperCase()}</MenuItem>)}
            </Select>
            <Button variant="contained" color="success" fullWidth onClick={swapTokens} sx={{ mt: 2 }}>
              Swap
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Wallet;






















