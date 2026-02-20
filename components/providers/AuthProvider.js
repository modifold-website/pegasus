"use client";

import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children, isLoggedIn, userData }) {
    const [isLoggedInState, setIsLoggedIn] = useState(isLoggedIn);
    const [user, setUser] = useState(userData);

    const telegramLogin = async (telegramData) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/telegram-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(telegramData),
            });

            const data = await response.json();
            if(!data.success) {
                throw new Error(data.message);
            }

            Cookies.set("authToken", data.token, { expires: 30 });
            localStorage.setItem("authToken", data.token);

            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/user`, {
                headers: { Authorization: `Bearer ${data.token}` },
            });

            const userData = await userResponse.json();
            if(userData.success) {
                setIsLoggedIn(true);
                setUser(userData.user);
            } else {
                throw new Error("Не удалось получить данные пользователя");
            }
        } catch (error) {
            console.error("Telegram Login Error:", error);
            throw error;
        }
    };

    const githubLogin = async ({ token, user }) => {
        try {
            Cookies.set("authToken", token, { expires: 30 });
            localStorage.setItem("authToken", token);

            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const userData = await userResponse.json();
            if(userData.success) {
                setIsLoggedIn(true);
                setUser(userData.user);
            } else {
                throw new Error("Не удалось получить данные пользователя");
            }
        } catch (error) {
            console.error("GitHub Login Error:", error);
            throw error;
        }
    };

    const discordLogin = async ({ token, user }) => {
        try {
            Cookies.set("authToken", token, { expires: 30 });
            localStorage.setItem("authToken", token);

            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const userData = await userResponse.json();
            if(userData.success) {
                setIsLoggedIn(true);
                setUser(userData.user);
            } else {
                throw new Error("Не удалось получить данные пользователя");
            }
        } catch (error) {
            console.error("Discord Login Error:", error);
            throw error;
        }
    };

    const logout = () => {
        Cookies.remove("authToken");
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        setUser(null);
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn: isLoggedInState, user, setUser, setIsLoggedIn, telegramLogin, githubLogin, discordLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};