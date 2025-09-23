import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		// Check if user is logged in
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		setIsLoggedIn(!!currentUser);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("currentUser");
		setIsLoggedIn(false);
		navigate("/home");
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<header style={{ background: "#222", color: "#fff", padding: "1rem" }}>
				<nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
					{isLoggedIn ? (
						// Logged in navigation
						<>
							<Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
							<Link to="/chat" style={{ color: "#fff", textDecoration: "none" }}>Chat</Link>
							<Link to="/profile" style={{ color: "#fff", textDecoration: "none" }}>Profile</Link>
							<button
								onClick={handleLogout}
								style={{
									background: "transparent",
									border: "1px solid #fff",
									color: "#fff",
									padding: "0.5rem 1rem",
									borderRadius: "4px",
									cursor: "pointer"
								}}
							>
								Logout
							</button>
						</>
					) : (
						// Logged out navigation
						<>
							<Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>Login</Link>
							<Link to="/signup" style={{ color: "#fff", textDecoration: "none" }}>Signup</Link>
						</>
					)}
				</nav>
			</header>
			<main style={{ flex: 1, padding: "2rem", background: "#f5f5f5" }}>
				{children}
			</main>
			<footer style={{ background: "#222", color: "#fff", textAlign: "center", padding: "1rem" }}>
				&copy; {new Date().getFullYear()} Chat App. All rights reserved.
			</footer>
		</div>
	);
};

export default Layout;
