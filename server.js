const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { message, model } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Missing "message" field' });
    }

    try {
        let replyText;

        if (model === 'llama3') {
            //Llama 3 via Ollama
            const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3',  //must match the name you pulled with `ollama pull`
                    messages: [
                        { role: 'user', content: message }
                    ],
                    stream: false
                })
            });

            if (!ollamaResponse.ok) {
                const errText = await ollamaResponse.text();
                console.error('Ollama error:', errText);
                throw new Error('Ollama API error');
            }

            const ollamaJson = await ollamaResponse.json();
            //Ollama chat format: { message: { content: "..." }, ... }
            replyText = ollamaJson.message?.content || 'No reply from Llama 3.';
        } else {
            //GPT branch
            replyText = `GPT placeholder: you said "${message}".\n\n` +
                        `Click "Use Llama 3" to talk to the local Llama 3 model.`;
        }

        res.json({ reply: replyText });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error talking to model.' });
    }
});

app.listen(PORT, () => {
    console.log(`Chat backend listening on http://localhost:${PORT}`);
});
