// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, off, get } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3O4dCO_q6TfkFaOSpZyD1D3FqUFEfLz8",
  authDomain: "chat-app-697c4.firebaseapp.com",
  databaseURL: "https://chat-app-697c4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-app-697c4",
  storageBucket: "chat-app-697c4.firebasestorage.app",
  messagingSenderId: "843161418200",
  appId: "1:843161418200:web:bde6dbbd548db8f7175aad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Chat utility functions
export const chatUtils = {
  // Initialize a chat room if it doesn't exist
  initializeChatRoom: async (roomId) => {
    try {
      const roomRef = ref(db, `chatRooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        await set(roomRef, {
          name: getRoomName(roomId),
          description: getRoomDescription(roomId),
          createdAt: Date.now(),
          messages: {}
        });
      }
    } catch (error) {
      console.error("Error initializing chat room:", error);
      throw error;
    }
  },

  // Send a message to a chat room
  sendMessage: async (roomId, messageData) => {
    try {
      const messagesRef = ref(db, `chatRooms/${roomId}/messages`);
      const newMessageRef = push(messagesRef);

      const message = {
        id: newMessageRef.key,
        user: messageData.user,
        text: messageData.text,
        timestamp: Date.now(),
        status: 'sent'
      };

      await set(newMessageRef, message);
      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Listen to messages in a chat room
  listenToMessages: (roomId, callback) => {
    const messagesRef = ref(db, `chatRooms/${roomId}/messages`);

    const handleValueChange = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array and sort by timestamp
        const messages = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        callback(messages);
      } else {
        callback([]);
      }
    };

    onValue(messagesRef, handleValueChange);

    // Return unsubscribe function
    return () => off(messagesRef, 'value', handleValueChange);
  }
};

// Helper functions for room data
const getRoomName = (roomId) => {
  const rooms = {
    general: "General",
    random: "Random",
    tech: "Tech Talk"
  };
  return rooms[roomId] || "Unknown Room";
};

const getRoomDescription = (roomId) => {
  const descriptions = {
    general: "General discussion",
    random: "Random conversations",
    tech: "Technology discussions"
  };
  return descriptions[roomId] || "Chat room";
};

export { db };
