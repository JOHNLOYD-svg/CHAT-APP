import React, { useState, useEffect } from "react";
import Layout from "./_layout";
import { useNavigate } from "react-router-dom";

const Signup = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		// Check if user is already logged in
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		if (currentUser) {
			navigate("/profile");
		}
	}, [navigate]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			setSuccess("");
			return;
		}
		// Save user to localStorage
		const users = JSON.parse(localStorage.getItem("users") || "[]");
		// Check if email or username already exists
		if (users.some(u => u.email === email || u.username === username)) {
			setError("Username or email already exists.");
			setSuccess("");
			return;
		}
		users.push({ username, email, password });
		localStorage.setItem("users", JSON.stringify(users));
		// Simulate auto-login by saving current user
		localStorage.setItem("currentUser", JSON.stringify({ username, email }));
		// Dispatch custom event to update layout
		window.dispatchEvent(new Event("authChange"));
		setError("");
		setSuccess("Signup successful! Logging you in...");
		setTimeout(() => {
			navigate("/profile");
		}, 1200);
	};

	return (
		<Layout>
			<div style={{ maxWidth: "400px", margin: "3rem auto", background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px #ccc" }}>
				<h2 style={{ textAlign: "center" }}>Sign Up</h2>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "1rem" }}>
						<label htmlFor="username">Username:</label>
						<input
							type="text"
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
						/>
					</div>
					<div style={{ marginBottom: "1rem" }}>
						<label htmlFor="email">Email:</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
						/>
					</div>
					<div style={{ marginBottom: "1rem" }}>
						<label htmlFor="password">Password:</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
						/>
					</div>
					<div style={{ marginBottom: "1rem" }}>
						<label htmlFor="confirmPassword">Confirm Password:</label>
						<input
							type="password"
							id="confirmPassword"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
						/>
					</div>
					{error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
					{success && <div style={{ color: "green", marginBottom: "1rem" }}>{success}</div>}
					<button type="submit" style={{ width: "100%", padding: "0.75rem", background: "#222", color: "#fff", border: "none", borderRadius: "4px" }}>
						Sign Up
					</button>
				</form>
			</div>
		</Layout>
	);
};

export default Signup;
