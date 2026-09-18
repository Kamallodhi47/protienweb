const { OpenAI } = require('openai');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

let openai;
try {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (e) {
  console.log('⚠ OpenAI not configured yet.');
}

module.exports = function initWebSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to AI Socket: ${socket.id}`);

    // Receive audio blob from client
    socket.on('audio_message', async (audioBuffer) => {
      if (!openai) {
        socket.emit('ai_response', { text: 'OpenAI API key missing.', action: 'ERROR' });
        return;
      }

      console.log(`🎙️ Received audio blob from client`);
      
      try {
        // 1. Save audio to temp file for Whisper
        const tempFilePath = path.join(os.tmpdir(), `audio-${uuidv4()}.webm`);
        fs.writeFileSync(tempFilePath, Buffer.from(audioBuffer));

        // 2. STT: Whisper
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-1',
          language: 'hi' // optimize for Hindi/Hinglish
        });
        
        fs.unlinkSync(tempFilePath); // cleanup
        
        const text = transcription.text;
        console.log(`🗣️ Whisper recognized: ${text}`);
        socket.emit('stt_result', text); // tell frontend what we heard

        // 3. AI Brain: GPT-4o Function Calling
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: 'You are the AI Voice Assistant for a Protein E-commerce website. Help users navigate, add items to cart, and answer questions. You must speak in concise Hinglish (Hindi written in English alphabet, e.g., "Main aapka order cart mein daal diya hai"). Keep it very short.' 
            },
            { role: 'user', content: text }
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'navigate_page',
                description: 'Navigates the user to a specific page on the website. Allowed routes: /, /about, /contact, /juices, /bowl-builder, /subscription, /customer, /cart',
                parameters: {
                  type: 'object',
                  properties: { route: { type: 'string' } },
                  required: ['route']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'add_to_cart',
                description: 'Adds a product to the cart (Juice, Sprouts, etc.)',
                parameters: {
                  type: 'object',
                  properties: { productName: { type: 'string' } },
                  required: ['productName']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'click_button',
                description: 'Clicks any generic button or link on the screen (like Submit, Search, Next)',
                parameters: {
                  type: 'object',
                  properties: { label: { type: 'string' } },
                  required: ['label']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'scroll_page',
                description: 'Scrolls the page up or down',
                parameters: {
                  type: 'object',
                  properties: { direction: { type: 'string', enum: ['up', 'down'] } },
                  required: ['direction']
                }
              }
            }
          ]
        });

        const msg = response.choices[0].message;
        let aiTextResponse = msg.content || "Samajh gaya.";
        
        // 4. Handle Actions
        if (msg.tool_calls && msg.tool_calls.length > 0) {
          for (const call of msg.tool_calls) {
            const args = JSON.parse(call.function.arguments);
            
            if (call.function.name === 'navigate_page') {
              socket.emit('ai_command', { type: 'NAVIGATE', payload: args.route });
              aiTextResponse = `Main aapko ${args.route} par le ja raha hoon.`;
            } else if (call.function.name === 'add_to_cart') {
              socket.emit('ai_command', { type: 'ADD_TO_CART', payload: args.productName });
              aiTextResponse = `${args.productName} cart mein add kar diya hai.`;
            } else if (call.function.name === 'click_button') {
              socket.emit('ai_command', { type: 'CLICK_BUTTON', payload: args.label });
              aiTextResponse = `${args.label} pe click kar diya.`;
            } else if (call.function.name === 'scroll_page') {
              socket.emit('ai_command', { type: 'SCROLL', payload: args.direction });
              aiTextResponse = `Page ${args.direction} scroll kar raha hoon.`;
            }
          }
        }
        
        socket.emit('ai_response', { text: aiTextResponse });

        // 5. TTS: Generate Audio Voice
        const ttsResponse = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'alloy', // fast voice
          input: aiTextResponse
        });
        
        const ttsBuffer = Buffer.from(await ttsResponse.arrayBuffer());
        socket.emit('tts_audio', ttsBuffer);

      } catch (error) {
        console.error('OpenAI Error:', error);
        socket.emit('ai_response', { text: 'Sorry, AI server mein problem aa gayi.', action: 'ERROR' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
