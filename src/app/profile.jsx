import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./_layout";


const defaultUser = {
	username: "ChatUser123",
	avatar: "/assets/images/default_avatar.png",
	email: "chatuser123@example.com",
	messagesSent: 156,
	timeOnline: "24h 32m",
	joinedDate: "2024-01-15",
	favoriteRoom: "General",
};

const Profile = () => {
	const navigate = useNavigate();
	const currentUser = JSON.parse(localStorage.getItem("currentUser"));
	const user = currentUser || defaultUser;

	const handleLogout = () => {
		localStorage.removeItem("currentUser");
		navigate("/login");
	};

	return (
		<Layout>
			<div style={{ maxWidth: "500px", margin: "3rem auto", background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px #ccc" }}>
				<div style={{ textAlign: "center" }}>
					<img src={user.avatar} alt="Avatar" style={{ width: "100px", borderRadius: "50%", marginBottom: "1rem" }} />
					<h2>{user.username}</h2>
					<p style={{ color: "#888" }}>{user.email}</p>
					{currentUser && (
						<button onClick={handleLogout} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#222", color: "#fff", border: "none", borderRadius: "4px" }}>
							Log Out
						</button>
					)}
				</div>
				<hr style={{ margin: "2rem 0" }} />
				<div>
					<h3>Chat Stats</h3>
					<ul style={{ listStyle: "none", padding: 0 }}>
						<li>Messages Sent: {user.messagesSent}</li>
						<li>Time Online: {user.timeOnline}</li>
						<li>Joined: {new Date(user.joinedDate).toLocaleDateString()}</li>
						<li>Favorite Room: {user.favoriteRoom}</li>
					</ul>
				</div>
			</div>
		</Layout>
	);
};

export default Profile;
