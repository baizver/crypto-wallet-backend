const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Хранилище данных в оперативной памяти
const balances = {};
const transactions = {};

// Обработка получения данных пользователя
app.post("/userdata", (req, res) => {
    const { id, username, first_name } = req.body;

    // Если пользователь новый, инициализируем его баланс и историю
    if (!balances[id]) {
        balances[id] = { USDT: 3.00 };
        transactions[id] = {
            USDT: [
                {
                    type: "receive",
                    address: `Referral: ${username || "N/A"}`,
                    amount: 3.00,
                    usd: 3.00,
                    date: new Date().toISOString().split("T")[0]
                }
            ]
        };
    }

    console.log("📥 Получены данные:", { id, username, first_name });
    res.json({ status: "ok", received: { id, username, first_name } });
});

// Отдать баланс по userId
app.get("/balance/:userId", (req, res) => {
    const { userId } = req.params;
    const balance = balances[userId] || { USDT: 0 };
    res.json(balance);
});

// Отдать транзакции по userId и токену
app.get("/transactions/:userId/:token", (req, res) => {
    const { userId, token } = req.params;
    const history = transactions[userId]?.[token] || [];
    res.json(history);
});

// Тестовый маршрут
app.get("/", (req, res) => {
    res.send("✅ Backend is live");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
