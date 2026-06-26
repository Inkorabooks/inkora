import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Image,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Search,
  Check,
  CheckCheck,
  Clock,
  User,
} from 'lucide-react';
import { Button, Avatar, Badge, Input, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Conversation, Message, Profile, Book } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (data) {
        setConversations(data as Conversation[]);
      }
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.conversation_id === selected?.id) {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selected?.id]);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSelected(conv);
      fetchMessages(conversationId);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (id: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', id)
      .order('created_at');
    if (data) setMessages(data as Message[]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selected || !user) return;

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: selected.id,
        sender_id: user.id,
        content: newMessage.trim(),
      })
      .select('*, sender:profiles(*)')
      .single();

    if (data) {
      setMessages(prev => [...prev, data as Message]);
      setNewMessage('');
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selected.id);
    }
  };

  const getOther = (conv: Conversation): Profile | undefined => {
    return conv.buyer_id === user?.id
      ? (conv.seller as Profile)
      : (conv.buyer as Profile);
  };

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = searchQuery
    ? conversations.filter(c => {
        const other = getOther(c);
        return other?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <p className="text-dark-400 mb-4">Sign in to view messages</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Conversations List */}
      <div className={cn(
        'w-full md:w-80 lg:w-96 flex flex-col border-r border-dark-800/50 bg-dark-950',
        selected && 'hidden md:flex'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-dark-800/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <Badge variant="primary">{conversations.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 text-sm focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-full bg-dark-800" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-dark-800 rounded mb-2" />
                    <div className="h-3 w-32 bg-dark-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const other = getOther(conv);
              const isSelected = selected?.id === conv.id;

              return (
                <motion.button
                  key={conv.id}
                  onClick={() => {
                    setSelected(conv);
                    fetchMessages(conv.id);
                    navigate(`/chat/${conv.id}`);
                  }}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 transition-colors border-l-2',
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500'
                      : 'border-transparent hover:bg-dark-800/50'
                  )}
                  whileHover={{ x: 2 }}
                >
                  <Avatar src={other?.avatar_url} name={other?.full_name} size="md" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        'font-medium truncate',
                        isSelected ? 'text-primary-400' : 'text-white'
                      )}>
                        {other?.full_name}
                      </p>
                    </div>
                    <p className="text-sm text-dark-400 truncate">Tap to chat</p>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-sm text-dark-500 mt-2">
                Start a conversation from a book page
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        'flex-1 flex flex-col bg-dark-950',
        !selected && 'hidden md:flex'
      )}>
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-800/50 flex items-center justify-between glass">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelected(null);
                    navigate('/chat');
                  }}
                  className="md:hidden p-2 rounded-lg hover:bg-dark-800 text-dark-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar
                  src={getOther(selected)?.avatar_url}
                  name={getOther(selected)?.full_name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-white">
                    {getOther(selected)?.full_name}
                  </p>
                  <p className="text-xs text-dark-400">
                    {getOther(selected)?.is_verified ? 'Verified Seller' : 'Member'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg, i) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showDate = i === 0 ||
                    formatDate(messages[i - 1].created_at) !== formatDate(msg.created_at);

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 text-xs text-dark-500 bg-dark-900/50 rounded-full">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2.5',
                          isOwn
                            ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-md'
                            : 'glass text-dark-200 rounded-bl-md'
                        )}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className={cn(
                            'flex items-center justify-end gap-1 mt-1',
                            isOwn ? 'text-white/70' : 'text-dark-500'
                          )}>
                            <span className="text-xs">
                              {formatMessageTime(msg.created_at)}
                            </span>
                            {isOwn && (
                              msg.is_read
                                ? <CheckCheck className="w-3.5 h-3.5 text-primary-200" />
                                : <Check className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEnd} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-800/50 glass">
              <div className="flex items-center gap-3">
                <button className="p-3 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-3 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-colors">
                  <Image className="w-5 h-5" />
                </button>
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 resize-none"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="rounded-xl"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 mx-auto text-dark-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Conversation</h3>
              <p className="text-dark-400">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
