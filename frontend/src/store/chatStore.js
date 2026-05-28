import { create } from "zustand";
import { api } from "@/lib/api";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getTitle(messages) {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  const text = first.content.slice(0, 40);
  return text.length < first.content.length ? text + "…" : text;
}

function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("chat_history") || "[]");
  } catch { return []; }
}

function saveHistory(history) {
  if (typeof window === "undefined") return;
  localStorage.setItem("chat_history", JSON.stringify(history.slice(0, 50)));
}

function _saveCurrentChat(chatId, messages, history) {
  if (!messages.length) return history;
  const title = getTitle(messages);
  const existing = history.findIndex((c) => c.id === chatId);
  const entry = { id: chatId, title, messages, updatedAt: Date.now() };
  if (existing >= 0) {
    const updated = [...history];
    updated[existing] = entry;
    return updated;
  }
  return [entry, ...history];
}

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  abortController: null,
  currentChatId: null,
  history: [],
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return;
    set({ history: loadHistory(), _hydrated: true });
  },

  newChat: () => {
    const { messages, currentChatId, history } = get();
    // Save current chat before starting new
    let updatedHistory = history;
    if (messages.length > 0) {
      updatedHistory = _saveCurrentChat(currentChatId, messages, history);
    }
    const id = generateId();
    set({ messages: [], currentChatId: id, history: updatedHistory });
    saveHistory(updatedHistory);
  },

  loadChat: (chatId) => {
    const { history, messages, currentChatId } = get();
    // Save current first
    let updatedHistory = history;
    if (messages.length > 0 && currentChatId) {
      updatedHistory = _saveCurrentChat(currentChatId, messages, history);
    }
    const chat = updatedHistory.find((c) => c.id === chatId);
    if (chat) {
      set({ messages: chat.messages, currentChatId: chatId, history: updatedHistory });
    }
  },

  deleteChat: (chatId) => {
    const { history, currentChatId } = get();
    const updatedHistory = history.filter((c) => c.id !== chatId);
    saveHistory(updatedHistory);
    if (chatId === currentChatId) {
      set({ history: updatedHistory, messages: [], currentChatId: null });
    } else {
      set({ history: updatedHistory });
    }
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isLoading: false, abortController: null });
    }
  },

  sendMessage: async (query) => {
    const controller = new AbortController();
    let { currentChatId } = get();
    if (!currentChatId) {
      currentChatId = generateId();
    }
    const userMsg = { role: "user", content: query };
    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
      abortController: controller,
      currentChatId,
    }));

    try {
      const response = await api.streamQuery(query, null, controller.signal);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let answer = "";
      let sources = [];

      const assistantMsg = { role: "assistant", content: "", sources: [] };
      set((state) => ({
        messages: [...state.messages, assistantMsg],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "sources") {
              sources = data.data;
            } else if (data.type === "token") {
              answer += data.data;
              set((state) => {
                const msgs = [...state.messages];
                msgs[msgs.length - 1] = {
                  role: "assistant",
                  content: answer,
                  sources,
                };
                return { messages: msgs };
              });
            }
          } catch {}
        }
      }

      set((state) => {
        const msgs = [...state.messages];
        msgs[msgs.length - 1] = { role: "assistant", content: answer, sources };
        const updatedHistory = _saveCurrentChat(currentChatId, msgs, state.history);
        saveHistory(updatedHistory);
        return { messages: msgs, isLoading: false, abortController: null, history: updatedHistory };
      });
    } catch (err) {
      if (err.name === "AbortError") {
        set({ isLoading: false, abortController: null });
        return;
      }
      try {
        const data = await api.sendQuery(query);
        set((state) => {
          const msgs = [
            ...state.messages,
            { role: "assistant", content: data.answer, sources: data.sources },
          ];
          const updatedHistory = _saveCurrentChat(currentChatId, msgs, state.history);
          saveHistory(updatedHistory);
          return { messages: msgs, isLoading: false, abortController: null, history: updatedHistory };
        });
      } catch (fallbackErr) {
        set((state) => ({
          messages: [
            ...state.messages,
            { role: "assistant", content: "Sorry, something went wrong. Is the backend running?" },
          ],
          isLoading: false,
          abortController: null,
        }));
      }
    }
  },

  clearMessages: () => set({ messages: [] }),
}));
