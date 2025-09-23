import React, { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebaseConfig";
import Layout from "./_layout";

const Collab = () => {
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [isOnline, setIsOnline] = useState(false);

	useEffect(() => {
		// Get current user from localStorage
		const user = JSON.parse(localStorage.getItem("currentUser"));
		setCurrentUser(user);

		// Listen to online users
		const usersRef = ref(db, "onlineUsers");
		onValue(usersRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const users = Object.values(data);
				setOnlineUsers(users);
			} else {
				setOnlineUsers([]);
			}
		});

		// Set user as online when component mounts
		if (user) {
			const userRef = ref(db, `onlineUsers/${user.username || user.email}`);
			set(userRef, {
				username: user.username || user.email,
				email: user.email,
				lastSeen: Date.now(),
				status: "online"
			});
			setIsOnline(true);

			// Set user as offline when component unmounts
			return () => {
				set(userRef, {
					username: user.username || user.email,
					email: user.email,
					lastSeen: Date.now(),
					status: "offline"
				});
			};
		}
	}, []);

	const formatLastSeen = (timestamp) => {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
		if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		return 'Just now';
	};

	return (
		<Layout>
			<div style={{ maxWidth: "800px", margin: "2rem auto" }}>
				<div style={{ textAlign: "center", marginBottom: "2rem" }}>
					<h2>Community</h2>
					<p>Connect with other chat users</p>
				</div>

				{/* Current User Status */}
				{currentUser && (
					<div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px #ccc", marginBottom: "2rem" }}>
						<h3>Your Status</h3>
						<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
							<div style={{
								width: "12px",
								height: "12px",
								borderRadius: "50%",
								backgroundColor: isOnline ? "#4CAF50" : "#ccc"
							}}></div>
							<span>
								<strong>{currentUser.username || currentUser.email}</strong>
								{isOnline ? " (Online)" : " (Offline)"}
							</span>
						</div>
					</div>
				)}

				{/* Online Users */}
				<div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px #ccc" }}>
					<h3>Online Users ({onlineUsers.filter(user => user.status === 'online').length})</h3>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
						{onlineUsers.length === 0 ? (
							<p style={{ color: "#888", textAlign: "center", gridColumn: "1 / -1" }}>
								No users online right now.
							</p>
						) : (
							onlineUsers.map((user, idx) => (
								<div key={idx} style={{
									padding: "1rem",
									border: "1px solid #eee",
									borderRadius: "6px",
									display: "flex",
									alignItems: "center",
									gap: "1rem"
								}}>
									<div style={{
										width: "12px",
										height: "12px",
										borderRadius: "50%",
										backgroundColor: user.status === 'online' ? "#4CAF50" : "#ccc"
									}}></div>
									<div>
										<div style={{ fontWeight: "bold" }}>{user.username}</div>
										<div style={{ fontSize: "0.9rem", color: "#666" }}>
											{user.status === 'online' ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Collab;
