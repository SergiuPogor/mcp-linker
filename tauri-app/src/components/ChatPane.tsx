import { useChatStore, useCurrentMessages } from "@/hooks/useChatStore";
import { useConversationStore } from "@/hooks/useConversationStore";
import { useProvider } from "@/hooks/useProvider";
import { formatDate } from "@/utils/date";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { FileText, Heart, MessageSquare, PanelLeft, PanelLeftClose, Plus, Search, Settings, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { ChatInput } from "./chat/ChatInput";
import { MessageList } from "./chat/MessageList";
import { SettingsDialog } from "./chat/SettingsDialog";
import { WelcomeMessage } from "./chat/WelcomeMessage";
import { NoteEditor } from "./notes/NoteEditor";
import { NoteList } from "./notes/NoteList";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";


interface ChatRequest extends Record<string, unknown> {
  message: string;
  provider: string;
  api_key: string;
  model: string;
  base_url?: string;
}

interface StreamingMessage {
  content: string;
  finished: boolean;
}

export function ChatPane() {
  const { inputMessage, setInputMessage, addMessage, updateLastMessage } = useChatStore();
  const { createConversation, setCurrentConversation, currentConversationId, conversations, deleteConversation, toggleFavorite } = useConversationStore();
  const messages = useCurrentMessages();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorite">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [mainContentTab, setMainContentTab] = useState<"chat" | "notes">("chat");
  const { selectedProvider, apiKey, selectedModel, baseUrl } = useProvider();

  // Filter conversations based on active tab and search query
  const filteredConversations = conversations
    .filter(conv => activeTab === "favorite" ? conv.isFavorite : true)
    .filter(conv => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      
      // Search in title
      if (conv.title.toLowerCase().includes(query)) return true;
      
      // Search in message content
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(query)
      );
    });

  const handleSend = async () => {
    if (!inputMessage.trim() || !apiKey || !selectedModel) return;
    
    setIsLoading(true);
    
    try {
      // Create new conversation if none exists
      if (!currentConversationId) {
        const newConvId = createConversation();
        setCurrentConversation(newConvId);
      }

      // Add user message
      const userMessage = {
        role: "user" as const,
        content: inputMessage,
        timestamp: Date.now(),
      };
      
      addMessage(userMessage);
      
      // Clear input
      const messageToSend = inputMessage;
      setInputMessage("");
      
      // Add initial assistant message
      const assistantMessage = {
        role: "assistant" as const,
        content: "",
        timestamp: Date.now(),
        model: selectedModel,
      };
      addMessage(assistantMessage);

      // Set up streaming listener
      let accumulatedContent = "";
      const unlisten = await listen<StreamingMessage>("chat_stream", (event) => {
        const { content, finished } = event.payload;
        
        if (finished) {
          setIsLoading(false);
        } else {
          // Accumulate content and update the last assistant message
          accumulatedContent += content;
          updateLastMessage(accumulatedContent);
        }
      });

      // Send request to backend
      const chatRequest: ChatRequest = {
        message: messageToSend,
        provider: selectedProvider,
        api_key: apiKey,
        model: selectedModel,
        base_url: baseUrl || undefined,
      };

      try {
        await invoke("send_message_stream", { request: chatRequest });
      } catch (backendError) {
        console.error("Backend error:", backendError);
        // Update the last message with error
        updateLastMessage(`Error: ${backendError}`);
        setIsLoading(false);
      } finally {
        unlisten();
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const handleEditMessage = (index: number, newContent: string) => {
    // Implementation for editing messages
    console.log("Edit message:", index, newContent);
  };

  const handleCreateNewConversation = () => {
    const newConvId = createConversation();
    setCurrentConversation(newConvId);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar */}
      {sidebarVisible && (
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          {mainContentTab === "chat" ? (
            /* Conversations Sidebar */
            <>
              {/* Sidebar Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Conversations</h3>
                  <Button
                    onClick={handleCreateNewConversation}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </Button>
                </div>
                
                {/* Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Conversation Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "favorite")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      All ({conversations.length})
                    </TabsTrigger>
                    <TabsTrigger value="favorite" className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Favorite ({conversations.filter(c => c.isFavorite).length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {searchQuery.trim() 
                      ? "No conversations found" 
                      : activeTab === "favorite" 
                        ? "No favorite conversations" 
                        : "No conversations yet"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                          currentConversationId === conversation.id
                            ? "bg-blue-100 border-blue-200 border"
                            : "bg-white hover:bg-gray-100"
                        }`}
                        onClick={() => setCurrentConversation(conversation.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {conversation.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(conversation.updatedAt)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {conversation.messages.length} messages
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(conversation.id);
                              }}
                            >
                              {conversation.isFavorite ? (
                                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                              ) : (
                                <Heart className="w-3 h-3 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Notes Sidebar */
            <NoteList />
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="flex items-center gap-2"
            >
              {sidebarVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>
            
            {/* Content Tabs */}
            <Tabs value={mainContentTab} onValueChange={(value) => setMainContentTab(value as "chat" | "notes")}>
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <SettingsDialog>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </SettingsDialog>
          </div>
        </div>

        {/* Content Area */}
        {mainContentTab === "chat" ? (
          <>
            {/* Model Selector */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                {!apiKey && (
                  <span className="text-sm text-red-500">API Key Required</span>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <WelcomeMessage />
              ) : (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  onEditMessage={handleEditMessage}
                />
              )}
            </div>

            {/* Input Area */}
            <div className="border-t bg-white">
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </>
        ) : (
          /* Notes Content */
          <div className="flex-1">
            <NoteEditor />
          </div>
        )}
      </div>
    </div>
  );
}