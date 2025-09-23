import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./_layout";

const chatFeatures = [
	{ title: "Real-time Messaging", description: "Send and receive messages instantly with Firebase backend.", icon: "💬" },
	{ title: "User Authentication", description: "Secure login and signup system for personalized experience.", icon: "🔐" },
	{ title: "Profile Management", description: "Customize your profile and track your chat activity.", icon: "👤" },
];

const HomePage = () => {
	const navigate = useNavigate();

	useEffect(() => {
		// Check if user is already logged in
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		if (currentUser) {
			navigate("/chat");
		}
	}, [navigate]);

	return (
		<Layout>
			<section style={{ textAlign: "center", marginBottom: "2rem" }}>
				<h1>Welcome to Chat App!</h1>
				<p>Connect, communicate, and chat with friends in real-time.</p>
			</section>
			<section>
				<h2 style={{ marginBottom: "1rem" }}>Features</h2>
				<div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
					{chatFeatures.map((feature) => (
						<div key={feature.title} style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px #ccc", padding: "1rem", width: "220px", textAlign: "center" }}>
							<div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{feature.icon}</div>
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</div>
					))}
				</div>
			</section>
		</Layout>
	);
};

export default HomePage;
