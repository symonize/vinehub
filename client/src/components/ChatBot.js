import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from 'react-query';
import { wineriesAPI, winesAPI, vintagesAPI } from '../utils/api';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can help you find wines, wineries, and vintages in your collection. I can also update data for you. Try asking:\n• "Show me all wineries"\n• "Find wines from 2020"\n• "Update all Cabernet wines to add award"\n• "Set region for Napa wineries"'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch all data for context
  const { data: wineriesData, refetch: refetchWineries } = useQuery('chatbot-wineries', () => wineriesAPI.getAll());
  const { data: winesData, refetch: refetchWines } = useQuery('chatbot-wines', () => winesAPI.getAll());
  const { data: vintagesData, refetch: refetchVintages } = useQuery('chatbot-vintages', () => vintagesAPI.getAll());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUpdate = async (query, lowerQuery, wines, wineries, vintages) => {
    try {
      let updatedCount = 0;
      let itemsToUpdate = [];
      let updateType = '';

      // Parse awards updates (e.g., "Update all white wines to have a 92 award from james suckling")
      const awardMatch = lowerQuery.match(/(\d+)\s+(?:point\s+)?award\s+from\s+([\w\s]+)/i);
      const ratingMatch = lowerQuery.match(/rating.*?(\d+)/i);

      // Identify what to update
      if (lowerQuery.includes('wine')) {
        itemsToUpdate = wines;
        updateType = 'wines';

        // Filter wines based on criteria
        if (lowerQuery.includes('white')) {
          itemsToUpdate = wines.filter(w => w.style?.toLowerCase().includes('white'));
        } else if (lowerQuery.includes('red')) {
          itemsToUpdate = wines.filter(w => w.style?.toLowerCase().includes('red'));
        } else if (lowerQuery.includes('cabernet')) {
          itemsToUpdate = wines.filter(w => w.varietal?.toLowerCase().includes('cabernet'));
        } else if (lowerQuery.includes('pinot')) {
          itemsToUpdate = wines.filter(w => w.varietal?.toLowerCase().includes('pinot'));
        } else if (lowerQuery.includes('chardonnay')) {
          itemsToUpdate = wines.filter(w => w.varietal?.toLowerCase().includes('chardonnay'));
        }

        // Perform the update
        if (awardMatch) {
          const [, rating, publication] = awardMatch;
          const award = {
            publication: publication.trim(),
            rating: parseInt(rating),
            year: new Date().getFullYear()
          };

          for (const wine of itemsToUpdate) {
            await winesAPI.addAward(wine._id, award);
            updatedCount++;
          }

          await refetchWines();
          queryClient.invalidateQueries(['chatbot-wines', 'wines-all', 'wines-count']);

          return {
            type: 'success',
            message: `✓ Successfully added ${rating} point award from ${publication} to ${updatedCount} wine(s)!`,
            count: updatedCount
          };
        }
      }

      // Handle winery updates
      if (lowerQuery.includes('winer')) {
        itemsToUpdate = wineries;
        updateType = 'wineries';

        // Filter wineries
        if (lowerQuery.includes('napa')) {
          itemsToUpdate = wineries.filter(w => w.region?.toLowerCase().includes('napa'));
        } else if (lowerQuery.includes('sonoma')) {
          itemsToUpdate = wineries.filter(w => w.region?.toLowerCase().includes('sonoma'));
        }

        // Update region
        const setRegionMatch = lowerQuery.match(/set region to ([\w\s]+)/i);
        if (setRegionMatch) {
          const newRegion = setRegionMatch[1].trim();

          for (const winery of itemsToUpdate) {
            await wineriesAPI.update(winery._id, { region: newRegion });
            updatedCount++;
          }

          await refetchWineries();
          queryClient.invalidateQueries(['chatbot-wineries', 'wineries-all', 'wineries-count']);

          return {
            type: 'success',
            message: `✓ Successfully updated region to "${newRegion}" for ${updatedCount} winery/wineries!`,
            count: updatedCount
          };
        }
      }

      return {
        type: 'text',
        message: 'I can help you update wines and wineries! Try:\n• "Add 92 point award from James Suckling to all white wines"\n• "Set region to Napa Valley for all California wineries"\n• "Update all Cabernet wines with 95 rating from Wine Spectator"'
      };

    } catch (error) {
      console.error('Update error:', error);
      return {
        type: 'error',
        message: `Sorry, I encountered an error while updating: ${error.message}`
      };
    }
  };

  const processQuery = async (query) => {
    const lowerQuery = query.toLowerCase();

    // Get data arrays from correct response structure
    const wineries = wineriesData?.data?.data || [];
    const wines = winesData?.data?.data || [];
    const vintages = vintagesData?.data?.data || [];

    // Handle UPDATE operations
    if (lowerQuery.includes('update') || lowerQuery.includes('set') || (lowerQuery.includes('add') && (lowerQuery.includes('award') || lowerQuery.includes('rating'))) || lowerQuery.includes('change')) {
      return await handleUpdate(query, lowerQuery, wines, wineries, vintages);
    }

    // Search for wineries
    if (lowerQuery.includes('winer')) {
      if (lowerQuery.includes('all') || lowerQuery.includes('show') || lowerQuery.includes('list')) {
        return {
          type: 'list',
          data: wineries,
          category: 'wineries',
          message: `I found ${wineries.length} wineries in your collection:`
        };
      }
      const matches = wineries.filter(w =>
        w.name?.toLowerCase().includes(lowerQuery.split('winer')[1]?.trim() || '') ||
        w.region?.toLowerCase().includes(lowerQuery)
      );
      if (matches.length > 0) {
        return {
          type: 'list',
          data: matches,
          category: 'wineries',
          message: `I found ${matches.length} matching wineries:`
        };
      }
    }

    // Search for wines
    if (lowerQuery.includes('wine')) {
      if (lowerQuery.includes('all') || lowerQuery.includes('show') || lowerQuery.includes('list')) {
        return {
          type: 'list',
          data: wines,
          category: 'wines',
          message: `I found ${wines.length} wines in your catalog:`
        };
      }
      const matches = wines.filter(w =>
        w.name?.toLowerCase().includes(lowerQuery.split('wine')[1]?.trim() || '') ||
        w.varietal?.toLowerCase().includes(lowerQuery) ||
        w.style?.toLowerCase().includes(lowerQuery)
      );
      if (matches.length > 0) {
        return {
          type: 'list',
          data: matches,
          category: 'wines',
          message: `I found ${matches.length} matching wines:`
        };
      }
    }

    // Search for vintages by year
    const yearMatch = lowerQuery.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      const matches = vintages.filter(v => v.year === year);
      if (matches.length > 0) {
        return {
          type: 'list',
          data: matches,
          category: 'vintages',
          message: `I found ${matches.length} vintages from ${year}:`
        };
      }
    }

    // Count queries
    if (lowerQuery.includes('how many') || lowerQuery.includes('count')) {
      if (lowerQuery.includes('winer')) {
        return {
          type: 'text',
          message: `You have ${wineries.length} wineries in your collection.`
        };
      }
      if (lowerQuery.includes('wine')) {
        return {
          type: 'text',
          message: `You have ${wines.length} wines in your catalog.`
        };
      }
      if (lowerQuery.includes('vintage')) {
        return {
          type: 'text',
          message: `You have ${vintages.length} vintages tracked.`
        };
      }
    }

    // Search by region
    if (lowerQuery.includes('region') || lowerQuery.includes('from')) {
      const regionKeywords = ['napa', 'sonoma', 'bordeaux', 'tuscany', 'rioja', 'mendoza'];
      const foundRegion = regionKeywords.find(r => lowerQuery.includes(r));
      if (foundRegion) {
        const matches = wineries.filter(w =>
          w.region?.toLowerCase().includes(foundRegion)
        );
        if (matches.length > 0) {
          return {
            type: 'list',
            data: matches,
            category: 'wineries',
            message: `I found ${matches.length} wineries in ${foundRegion}:`
          };
        }
      }
    }

    // Default help message
    return {
      type: 'text',
      message: `I can help you with:
• "Show all wineries" - List all wineries
• "Find wines from 2020" - Search by vintage year
• "How many wines" - Get counts
• "Wineries in Napa" - Search by region
• Search by name: "Cabernet" or "Opus One"

What would you like to know?`
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const queryText = input;
    setInput('');
    setIsTyping(true);

    // Process query
    try {
      const response = await processQuery(queryText);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', ...response }]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          type: 'error',
          message: 'Sorry, I encountered an error processing your request.'
        }]);
        setIsTyping(false);
      }, 500);
    }
  };

  const renderMessage = (msg, index) => {
    if (msg.type === 'list') {
      return (
        <div key={index} className={`chat-message ${msg.role}`}>
          <div className="message-content">
            <p>{msg.message}</p>
            <div className="chat-results">
              {msg.data.slice(0, 5).map((item, i) => (
                <a
                  key={i}
                  href={`/${msg.category}/${item._id}`}
                  className="chat-result-item"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="result-name">{item.name}</div>
                  {item.region && <div className="result-detail">{item.region}</div>}
                  {item.varietal && <div className="result-detail">{item.varietal}</div>}
                  {item.year && <div className="result-detail">Vintage: {item.year}</div>}
                </a>
              ))}
              {msg.data.length > 5 && (
                <div className="result-more">
                  And {msg.data.length - 5} more...
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === 'success') {
      return (
        <div key={index} className={`chat-message ${msg.role}`}>
          <div className="message-content success-message">
            <p style={{ whiteSpace: 'pre-line' }}>{msg.message}</p>
          </div>
        </div>
      );
    }

    if (msg.type === 'error') {
      return (
        <div key={index} className={`chat-message ${msg.role}`}>
          <div className="message-content error-message">
            <p style={{ whiteSpace: 'pre-line' }}>{msg.message}</p>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={`chat-message ${msg.role}`}>
        <div className="message-content">
          <p style={{ whiteSpace: 'pre-line' }}>{msg.content || msg.message}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`chat-fab ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <Sparkles size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-content">
              <Sparkles size={20} />
              <div>
                <h3>WineHub Assistant</h3>
                <span className="chat-status">Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="chat-close">
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => renderMessage(msg, index))}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="message-content typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about wines, wineries, or vintages..."
              className="chat-input"
            />
            <button type="submit" className="chat-send" disabled={!input.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
