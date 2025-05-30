const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let users = {};

app.post('/api/register', (req, res) => {
    const { user_id, first_name } = req.body;
    if (!users[user_id]) {
        users[user_id] = { first_name, balance_usdt: 3.00, tx: [] };
        console.log(`✅ Registered new user: ${first_name} (${user_id})`);
    }
    res.json({ status: 'ok' });
});

app.get('/api/user/:id', (req, res) => {
    const user = users[req.params.id];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
