const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Подключение к MongoDB Atlas
mongoose.connect("mongodb+srv://darhanalexeev1:YP9pCRpd4kCqu7Wt@cluster0.rbegw0n.mongodb.net/crypto_wallet?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔖 Схема пользователя
const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    first_name: String,
    balance: {
        USDT: { type: Number, default: 0 }
    },
    transactions: {
        USDT: [
            {
                type: String,
                address: String,
                amount: Number,
                usd: Number,
                date: String
            }
        ]
    }
});

const User = mongoose.model("User", userSchema);

// 📥 Принимаем данные от WebApp
app.post("/userdata", async (req, res) => {
    const { id, username, first_name } = req.body;

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
                        address: `Referral: ${username || "N/A"}`,
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
});

// 📤 Получить баланс
app.get("/balance/:userId", async (req, res) => {
    const { userId } = req.params;
    const user = await User.findOne({ id: userId });

    if (!user) return res.json({ USDT: 0 });
    res.json(user.balance);
});

// 📤 Получить историю транзакций
app.get("/transactions/:userId/:token", async (req, res) => {
    const { userId, token } = req.params;
    const user = await User.findOne({ id: userId });

    if (!user) return res.json([]);
    res.json(user.transactions[token] || []);
});

// 🔍 Проверка
app.get("/", (req, res) => {
    res.send("✅ Backend is live with MongoDB Atlas");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
