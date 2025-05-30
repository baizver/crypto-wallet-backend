const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/userdata", (req, res) => {
    const { id, username, first_name } = req.body;
    console.log("📥 Получены данные:", { id, username, first_name });

    // можно сюда добавить сохранение в БД или отправку куда-либо
    res.json({ status: "ok", received: { id, username, first_name } });
});

app.get("/", (req, res) => {
    res.send("✅ Backend is live");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
