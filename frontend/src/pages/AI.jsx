import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import api from '../api';

function AI() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Smart Inventory AI Assistant. I can help with demand forecasting, low stock alerts, and general inventory summaries. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ask-ai', { query: input });
      setMessages([...newMessages, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      console.error('Error asking AI', err);
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">AI Inventory Assistant</h1>
      
      <div className="card chat-container">
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                {msg.role === 'ai' ? <Bot size={20} style={{color: 'var(--azure-blue)', marginTop: '2px'}}/> : null}
                <div>{msg.content}</div>
                {msg.role === 'user' ? <User size={20} style={{marginTop: '2px'}}/> : null}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message ai">
              <Bot size={20} style={{color: 'var(--azure-blue)', display: 'inline', verticalAlign: 'middle', marginRight: '8px'}}/> 
              <em>Thinking...</em>
            </div>
          )}
        </div>
        
        <form className="chat-input" onSubmit={handleSend}>
          <input 
            type="text" 
            className="input-control" 
            placeholder="Ask about stock levels, forecasts, or summaries..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default AI;
