import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./_layout";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
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
		// Check credentials against localStorage
		const users = JSON.parse(localStorage.getItem("users") || "[]");
		const user = users.find(u => (u.email === email || u.username === email) && u.password === password);
		if (user) {
			setError("");
			// Store current user in localStorage
			localStorage.setItem("currentUser", JSON.stringify(user));
			// Dispatch custom event to update layout
			window.dispatchEvent(new Event("authChange"));
			// Redirect to profile
			navigate("/profile");
		} else {
			setError("Invalid username/email or password.");
		}
	};

	return (
		<Layout>
			<div style={{ maxWidth: "400px", margin: "3rem auto", background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px #ccc" }}>
				<h2 style={{ textAlign: "center" }}>Login</h2>
				<form onSubmit={handleSubmit}>
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
					{error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
					<button type="submit" style={{ width: "100%", padding: "0.75rem", background: "#222", color: "#fff", border: "none", borderRadius: "4px" }}>
						Login
					</button>
				</form>
			</div>
		</Layout>
	);
};

export default Login;
