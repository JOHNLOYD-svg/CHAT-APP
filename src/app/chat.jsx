import React, { useState, useEffect, useRef } from "react";
import { chatUtils } from "../firebaseConfig";
import Layout from "./_layout";

const chatRooms = [
	{ id: "general", name: "General", description: "General discussion" },
	{ id: "random", name: "Random", description: "Random conversations" },
	{ id: "tech", name: "Tech Talk", description: "Technology discussions" },
];

const Chat = () => {
	const [selectedRoom, setSelectedRoom] = useState("general");
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [lastSendTime, setLastSendTime] = useState(0);
	const [error, setError] = useState("");
	const [isInitialized, setIsInitialized] = useState(false);
	const messagesEndRef = useRef(null);
	const unsubscribeRef = useRef(null);

	useEffect(() => {
		// Get current user from localStorage
		const user = JSON.parse(localStorage.getItem("currentUser"));
		setCurrentUser(user);

		// Add immediate demo message to show the system is working
		const immediateDemoMessage = {
			id: "immediate-demo",
			user: "System",
			text: "💬 Chat system is loading...",
			timestamp: Date.now(),
			status: 'demo'
		};
		setMessages([immediateDemoMessage]);

		// Initialize chat room and set up message listener
		const initializeChat = async () => {
			try {
				setIsLoading(true);
				setError("");

				// Initialize the chat room
				await chatUtils.initializeChatRoom(selectedRoom);

				// Set up message listener
				unsubscribeRef.current = chatUtils.listenToMessages(selectedRoom, (newMessages) => {
					setMessages(newMessages);
					setIsLoading(false);
					setIsInitialized(true);
				});

				// Add a demo message after initialization
				setTimeout(() => {
					const demoMessage = {
						id: Date.now().toString(),
						user: "Chat System",
						text: "🎉 Welcome to ChatAPP! Your conversations, your way. Start chatting, share moments, or explore new connections. It's all just a message away.",
						timestamp: Date.now(),
						status: 'demo'
					};
					setMessages([demoMessage]);
				}, 500);

			} catch (err) {
				console.error("Error initializing chat:", err);
				setError("Failed to initialize chat. Please refresh the page.");
				setIsLoading(false);
				setIsInitialized(true); // Allow interaction even if initialization fails

				// Add demo message even on error
				setTimeout(() => {
					const demoMessage = {
						id: Date.now().toString(),
						user: "Chat System",
						text: "⚠️ Chat initialized in offline mode. You can still send messages - they'll be saved locally!",
						timestamp: Date.now(),
						status: 'demo'
					};
					setMessages([demoMessage]);
				}, 500);
			}
		};

		// Add a small delay to ensure DOM is ready
		const timer = setTimeout(() => {
			initializeChat();
		}, 100);

		// Cleanup function
		return () => {
			clearTimeout(timer);
			if (unsubscribeRef.current) {
				unsubscribeRef.current();
			}
		};
	}, [selectedRoom]);

	// Scroll to bottom when new messages arrive
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSend = async (e) => {
		e.preventDefault();

		// Enhanced validation to prevent empty message sending
		const trimmedMessage = message.trim();
		if (!trimmedMessage) {
			console.log("=== MESSAGE SEND BLOCKED ===");
			console.log("Reason: Empty message");
			setError("Please enter a message.");
			return;
		}

		if (trimmedMessage.length > 500) {
			console.log("=== MESSAGE SEND BLOCKED ===");
			console.log("Reason: Message too long");
			setError("Message is too long (max 500 characters).");
			return;
		}

		if (!currentUser) {
			console.log("=== MESSAGE SEND BLOCKED ===");
			console.log("Reason: No user logged in");
			setError("Please log in to send messages.");
			return;
		}

		if (isLoading) {
			console.log("=== MESSAGE SEND BLOCKED ===");
			console.log("Reason: Already sending");
			return;
		}

		// Rate limiting: prevent sending messages too quickly (minimum 1 second between sends)
		const now = Date.now();
		if (now - lastSendTime < 1000) {
			console.log("=== MESSAGE SEND BLOCKED ===");
			console.log("Reason: Rate limit - too many messages");
			setError("Please wait a moment before sending another message.");
			return;
		}
		setLastSendTime(now);

		console.log("=== MESSAGE SEND DEBUG ===");
		console.log("Message text:", trimmedMessage);
		console.log("Message length:", trimmedMessage.length);
		console.log("Current user:", currentUser);
		console.log("Selected room:", selectedRoom);
		console.log("Is loading:", isLoading);

		// Clear the input immediately to prevent double-sending
		setMessage("");
		setIsLoading(true);
		setError("");

		try {
			console.log("Attempting to send via Firebase...");
			await chatUtils.sendMessage(selectedRoom, {
				user: currentUser.username || currentUser.email || "Anonymous",
				text: trimmedMessage
			});
			console.log("Firebase send successful!");
			setIsLoading(false);
		} catch (err) {
			console.error("Firebase send failed:", err);
			console.log("Error details:", err.message, err.code);

			// Fallback: Store message locally if Firebase fails
			console.log("Falling back to local storage...");
			const localMessage = {
				id: Date.now().toString(),
				user: currentUser.username || currentUser.email || "Anonymous",
				text: trimmedMessage,
				timestamp: Date.now(),
				status: 'local'
			};

			setMessages(prev => [...prev, localMessage]);
			setError("Message saved locally. Firebase may be unavailable.");
			setIsLoading(false);
		}
	};

	// Test Firebase connection
	const testConnection = async () => {
		try {
			setError("");
			setIsLoading(true);
			await chatUtils.initializeChatRoom("general");
			setError("Firebase connection successful!");
			setIsLoading(false);
		} catch (err) {
			console.error("Connection test failed:", err);
			setError("Firebase connection failed. Using local storage.");
			setIsLoading(false);
		}
	};

	// Add a demo message for testing
	const addDemoMessage = () => {
		const demoMessage = {
			id: Date.now().toString(),
			user: "Demo User",
			text: "Hello! This is a test message. If you can see this, the chat is working!",
			timestamp: Date.now(),
			status: 'demo'
		};

		setMessages(prev => [...prev, demoMessage]);
		setError("Demo message added successfully!");
	};

	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const handleRoomChange = async (roomId) => {
		// Clean up previous listener
		if (unsubscribeRef.current) {
			unsubscribeRef.current();
		}

		setSelectedRoom(roomId);
		setMessages([]);
		setIsLoading(true);
		setError("");
		setIsInitialized(false);

		try {
			// Initialize new room
			await chatUtils.initializeChatRoom(roomId);

			// Set up new listener
			unsubscribeRef.current = chatUtils.listenToMessages(roomId, (newMessages) => {
				setMessages(newMessages);
				setIsLoading(false);
			});

			setIsInitialized(true);
		} catch (err) {
			console.error("Error switching room:", err);
			setError("Failed to switch chat room. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<div style={{
				display: "flex",
				height: "75vh",
				gap: "1rem",
				flexDirection: window.innerWidth < 768 ? "column" : "row"
			}}>
				{/* Chat Rooms Sidebar */}
				<div style={{
					width: window.innerWidth < 768 ? "100%" : "250px",
					background: "#fff",
					borderRadius: "8px",
					padding: "1rem",
					boxShadow: "0 2px 8px #ccc",
					minHeight: window.innerWidth < 768 ? "auto" : "400px"
				}}>
					<h3>Chat Rooms</h3>
					<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
						{chatRooms.map((room) => (
							<div
								key={room.id}
								onClick={() => handleRoomChange(room.id)}
								style={{
									padding: "0.75rem",
									background: selectedRoom === room.id ? "#222" : "#f5f5f5",
									color: selectedRoom === room.id ? "#fff" : "#222",
									border: "none",
									borderRadius: "4px",
									cursor: isLoading ? "not-allowed" : "pointer",
									textAlign: "left",
									opacity: isLoading ? 0.6 : 1,
									transition: "all 0.2s ease"
								}}
								onMouseEnter={(e) => {
									if (selectedRoom !== room.id && !isLoading) {
										e.target.style.background = "#e9ecef";
									}
								}}
								onMouseLeave={(e) => {
									if (selectedRoom !== room.id && !isLoading) {
										e.target.style.background = "#f5f5f5";
									}
								}}
							>
								<div style={{ fontWeight: "bold" }}>{room.name}</div>
								<div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{room.description}</div>
							</div>
						))}
					</div>
				</div>

				{/* Chat Area */}
				<div style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					background: "#fff",
					borderRadius: "8px",
					boxShadow: "0 2px 8px #ccc",
					maxHeight: "70vh",
					minHeight: "500px"
				}}>
					{/* Chat Header */}
					<div style={{
						padding: "1rem",
						borderBottom: "1px solid #eee",
						background: "#f8f9fa"
					}}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<div>
								<h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>
									{chatRooms.find(room => room.id === selectedRoom)?.name} Chat
								</h3>
								<p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
									{chatRooms.find(room => room.id === selectedRoom)?.description}
								</p>
								<div style={{
									marginTop: "0.5rem",
									fontSize: "0.8rem",
									color: "#888",
									display: "flex",
									alignItems: "center",
									gap: "1rem"
								}}>
									<span>Messages: {messages.length}</span>
									<span>Room: {selectedRoom}</span>
									{currentUser && <span>User: {currentUser.username || currentUser.email}</span>}
								</div>
							</div>
							<div style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem"
							}}>
								<button
									onClick={testConnection}
									disabled={isLoading}
									style={{
										padding: "0.5rem 1rem",
										background: "#6c757d",
										color: "#fff",
										border: "none",
										borderRadius: "4px",
										cursor: isLoading ? "not-allowed" : "pointer",
										fontSize: "0.8rem"
									}}
								>
									Test Connection
								</button>
								<button
									onClick={addDemoMessage}
									disabled={isLoading}
									style={{
										padding: "0.5rem 1rem",
										background: "#17a2b8",
										color: "#fff",
										border: "none",
										borderRadius: "4px",
										cursor: isLoading ? "not-allowed" : "pointer",
										fontSize: "0.8rem"
									}}
								>
									Add Demo Message
								</button>
								<button
									onClick={() => {
										console.log("=== USER DEBUG ===");
										console.log("Current user:", currentUser);
										console.log("LocalStorage user:", JSON.parse(localStorage.getItem("currentUser") || "null"));
										console.log("LocalStorage users:", JSON.parse(localStorage.getItem("users") || "[]"));
										alert(`Current user: ${currentUser ? currentUser.username || currentUser.email : "Not logged in"}`);
									}}
									style={{
										padding: "0.5rem 1rem",
										background: "#ffc107",
										color: "#000",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
										fontSize: "0.8rem"
									}}
								>
									Debug User
								</button>
								<button
									onClick={() => {
										if (!currentUser) {
											alert("Please log in first to send messages!");
											return;
										}
										const testMessage = {
											id: Date.now().toString(),
											user: currentUser.username || currentUser.email || "Anonymous",
											text: "🧪 Test message - UI is working!",
											timestamp: Date.now(),
											status: 'local'
										};
										setMessages(prev => [...prev, testMessage]);
										alert("Test message added! If you can see this, the UI is working.");
									}}
									style={{
										padding: "0.5rem 1rem",
										background: "#28a745",
										color: "#fff",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
										fontSize: "0.8rem"
									}}
								>
									Test UI
								</button>
								<div style={{
									fontSize: "0.8rem",
									color: "#666",
									display: "flex",
									alignItems: "center",
									gap: "0.5rem"
								}}>
									<div style={{
										width: "8px",
										height: "8px",
										borderRadius: "50%",
										background: error ? "#dc3545" : "#28a745"
									}}></div>
									<span>{error ? "Offline Mode" : "Online"}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Messages Area */}
					<div style={{
						flex: 1,
						padding: "1rem",
						overflowY: "auto",
						background: "#fafafa",
						position: "relative",
						minHeight: "300px",
						maxHeight: "calc(70vh - 200px)"
					}}>
						{error && (
							<div style={{
								background: "#ffebee",
								color: "#c62828",
								padding: "0.75rem",
								borderRadius: "4px",
								marginBottom: "1rem",
								textAlign: "center"
							}}>
								{error}
							</div>
						)}

						{isLoading && !isInitialized ? (
							<div style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>
								<p>Loading chat...</p>
							</div>
						) : messages.length === 0 && isInitialized ? (
							<div style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>
								<p>No messages yet. Start the conversation!</p>
							</div>
						) : (
							<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
								{messages.map((msg, idx) => (
									<div key={msg.id || idx} style={{
										background: msg.status === 'local' ? "#fff3cd" :
													msg.status === 'demo' ? "#d1ecf1" : "#fff",
										padding: "1rem",
										borderRadius: "12px",
										boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
										border: msg.status === 'local' ? "2px solid #ffc107" :
												msg.status === 'demo' ? "2px solid #17a2b8" : "1px solid #e0e0e0",
										maxWidth: "85%",
										wordWrap: "break-word",
										position: "relative"
									}}>
										<div style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "0.5rem"
										}}>
											<strong style={{
												color: "#222",
												fontSize: "1rem",
												fontWeight: "600"
											}}>
												{msg.user}
											</strong>
											<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
												{msg.status === 'local' && (
													<span style={{
														fontSize: "0.7rem",
														color: "#856404",
														background: "#fff3cd",
														padding: "4px 8px",
														borderRadius: "12px",
														fontWeight: "500"
													}}>
														Local
													</span>
												)}
												{msg.status === 'demo' && (
													<span style={{
														fontSize: "0.7rem",
														color: "#0c5460",
														background: "#d1ecf1",
														padding: "4px 8px",
														borderRadius: "12px",
														fontWeight: "500"
													}}>
														Demo
													</span>
												)}
												<span style={{
													fontSize: "0.8rem",
													color: "#888",
													fontWeight: "400"
												}}>
													{formatTime(msg.timestamp)}
												</span>
											</div>
										</div>
										<div style={{
											color: "#333",
											fontSize: "0.95rem",
											lineHeight: "1.5",
											margin: 0
										}}>
											{msg.text}
										</div>
									</div>
								))}
								<div ref={messagesEndRef} />
							</div>
						)}
					</div>

					{/* Message Input */}
					{currentUser ? (
						<form noValidate style={{
							padding: "1.5rem",
							borderTop: "2px solid #e0e0e0",
							display: "flex",
							gap: "1rem",
							background: "#f8f9fa",
							alignItems: "center"
						}}>
							<input
								type="text"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								onKeyDown={(e) => {
									// Prevent Enter key from submitting if message is empty
									if (e.key === 'Enter' && !message.trim()) {
										e.preventDefault();
										setError("Please enter a message before pressing Enter.");
									}
								}}
								placeholder={`Type your message for ${chatRooms.find(room => room.id === selectedRoom)?.name}...`}
								disabled={false} // Always allow typing
								style={{
									flex: 1,
									padding: "1rem",
									border: "2px solid #ddd",
									borderRadius: "8px",
									fontSize: "1rem",
									outline: "none",
									transition: "border-color 0.2s ease"
								}}
								onFocus={(e) => e.target.style.borderColor = "#007bff"}
								onBlur={(e) => e.target.style.borderColor = "#ddd"}
							/>
							<button
								type="button"
								disabled={!message.trim() || isLoading}
								onClick={handleSend}
								style={{
									padding: "1rem 2rem",
									background: !message.trim() || isLoading ? "#ccc" : "#007bff",
									color: "#fff",
									border: "none",
									borderRadius: "8px",
									cursor: !message.trim() || isLoading ? "not-allowed" : "pointer",
									fontSize: "1rem",
									fontWeight: "600",
									transition: "background-color 0.2s ease",
									minWidth: "100px"
								}}
							>
								{isLoading ? "Sending..." : "Send"}
							</button>
						</form>
					) : (
						<div style={{
							padding: "1.5rem",
							borderTop: "2px solid #e0e0e0",
							textAlign: "center",
							color: "#888",
							background: "#f8f9fa"
						}}>
							<p style={{ fontSize: "1.1rem", margin: 0 }}>
								Please <a href="/login" style={{
									color: "#007bff",
									textDecoration: "none",
									fontWeight: "600"
								}}>login</a> to start chatting
							</p>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
};

export default Chat;
