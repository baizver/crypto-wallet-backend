const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Разрешаем CORS для фронта
app.use(cors({
    origin: "https://crypto-wallet-web.onrender.com", // или '*' если хочешь открыть для всех
    methods: ["GET", "POST"],
    credentials: false
}));

app.use(express.json());

// ✅ Подключение к MongoDB Atlas
mongoose.connect("mongodb+srv://darhanalexeev1:YP9pCRpd4kCqu7Wt@cluster0.rbegw0n.mongodb.net/crypto_wallet?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// 📄 Схема одной транзакции
const transactionSchema = new mongoose.Schema({
    type: String,
    address: String,
    amount: Number,
    usd: Number,
    date: String
});

// 🔖 Схема пользователя
const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    first_name: String,
    balance: {
        USDT: { type: Number, default: 0 }
    },
    transactions: {
        USDT: { type: [transactionSchema], default: [] }
    }
});

const User = mongoose.model("User", userSchema);

// 📄 Схема чеков
const checkSchema = new mongoose.Schema({
    code: String,
    amount: Number,
    used: { type: Boolean, default: false }
});
const Check = mongoose.model("Check", checkSchema);

// 👤 Создание или обновление пользователя
app.post("/userdata", async (req, res) => {
    const { id, username = "", first_name = "" } = req.body;

    try {
        let user = await User.findOne({ id });

        if (!user) {
            user = new User({
                id,
                username,
                first_name,
                balance: { USDT: 3.00 },
                transactions: {
                    USDT: [
                        {
                            type: "receive",
                            address: `Referral: ${username || "Anonymous"}`,
                            amount: 3.00,
                            usd: 3.00,
                            date: new Date().toISOString().split("T")[0]
                        }
                    ]
                }
            });
            await user.save();
        }

        console.log("📥 Получены данные:", { id, username, first_name });
        res.json({ status: "ok", received: { id, username, first_name } });
    } catch (err) {
        console.error("❌ Error in /userdata:", err);
        res.status(500).json({ error: "Server error in /userdata" });
    }
});

// 💰 Баланс
app.get("/balance/:userId", async (req, res) => {
    const { userId } = req.params;
    const user = await User.findOne({ id: userId });

    if (!user) return res.json({ USDT: 0 });
    res.json(user.balance);
});

// 📜 История транзакций
app.get("/transactions/:userId/:token", async (req, res) => {
    const { userId, token } = req.params;
    const user = await User.findOne({ id: userId });

    if (!user) return res.json([]);
    res.json(user.transactions[token] || []);
});

// 🔍 Проверка сервера
app.get("/", (req, res) => {
    res.send("✅ Backend is live with MongoDB Atlas");
});

// 🧾 Создание чека
app.post("/create-check", async (req, res) => {
    const { code, amount } = req.body;

    try {
        await Check.create({ code, amount });
        res.json({ success: true, code, amount });
    } catch (err) {
        console.error("❌ Error creating check:", err);
        res.status(500).json({ success: false });
    }
});

// ✅ Применение чека
app.post("/apply-check", async (req, res) => {
    const { userId, username, first_name, code } = req.body;

    const check = await Check.findOne({ code, used: false });
    if (!check) return res.json({ error: "Invalid or already used check" });

    let user = await User.findOne({ id: userId });

    if (!user) {
        user = new User({
            id: userId,
            username,
            first_name,
            balance: { USDT: check.amount },
            transactions: {
                USDT: [{
                    type: "receive",
                    address: `Check: ${code}`,
                    amount: check.amount,
                    usd: check.amount,
                    date: new Date().toISOString().split("T")[0]
                }]
            }
        });
    } else {
        user.balance.USDT += check.amount;
        user.transactions.USDT.push({
            type: "receive",
            address: `Check: ${code}`,
            amount: check.amount,
            usd: check.amount,
            date: new Date().toISOString().split("T")[0]
        });
    }

    await user.save();
    check.used = true;
    await check.save();

    res.json({
        success: true,
        added: check.amount,
        newBalance: user.balance,
        newTxs: user.transactions.USDT
    });
});

// 🚀 Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
