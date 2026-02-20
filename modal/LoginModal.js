"use client";

import React, { useState } from "react";
import { useAuth } from "../components/providers/AuthProvider";
import Modal from "react-modal";
import { useTranslations } from "next-intl";

if(typeof window !== "undefined") {
    Modal.setAppElement("body");
}

export default function LoginModal({ isOpen, onClose }) {
    const t = useTranslations("LoginModal");
    const { telegramLogin, githubLogin, discordLogin } = useAuth();
    const [isDataModalOpen, setIsDataModalOpen] = useState(false);

    const handleTelegramClick = () => {
        const botName = "8388910351";
        const redirectUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_BASE}/auth/telegram-callback`);
        const url = `https://oauth.telegram.org/auth?bot_id=${botName}&origin=${encodeURIComponent(window.location.origin)}&return_to=${redirectUrl}`;

        const popup = window.open(url, "TelegramLogin", "width=600,height=400");
        window.addEventListener(
            "message",
            (event) => {
                console.log("Received Telegram message:", event.data);
                try {
                    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

                    if(data && data.event === "auth_result" && data.result && data.origin === "https://modifold.com") {
                        const telegramData = data.result;
                        telegramLogin(telegramData).then(() => {
                            onClose();
                            window.location.reload();
                        }).catch((error) => {
                            alert(error.message || t("errors.telegram"));
                        });

                        popup.close();
                    } else if(data && data.event === "auth_error" && data.origin === "https://modifold.com") {
                        alert(data.error || t("errors.telegram"));
                        popup.close();
                    } else {
                        console.warn("Unexpected Telegram message format:", data);
                        popup.close();
                    }
                } catch (error) {
                    console.error("Error processing Telegram message:", error);
                    alert(t("errors.telegramProcessing"));
                    popup.close();
                }
            },
            { once: true }
        );
    };

    const handleGitHubClick = () => {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_BASE}/auth/github-callback`);
        const scope = "user:email";
        const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

        const popup = window.open(url, "GitHubLogin", "width=600,height=400");
        window.addEventListener(
            "message",
            (event) => {
                try {
                    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

                    if(data && data.event === "auth_result" && data.result && data.origin === "https://modifold.com") {
                        const { token, user } = data.result;
                        githubLogin({ token, user }).then(() => {
                            onClose();
                            window.location.reload();
                        }).catch((error) => {
                            alert(error.message || t("errors.github"));
                        });

                        popup.close();
                    } else if(data && data.event === "auth_error" && data.origin === "https://modifold.com") {
                        console.error("GitHub auth error:", data.error);
                        alert(data.error || t("errors.github"));
                        popup.close();
                    } else {
                        console.warn("Unexpected GitHub message format:", data);
                        popup.close();
                    }
                } catch (error) {
                    console.error("Error processing GitHub message:", error);
                    alert(t("errors.githubProcessing"));
                    popup.close();
                }
            },
            { once: true }
        );
    };

    const handleDiscordClick = () => {
        const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
        const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_BASE}/auth/discord-callback`);
        const scope = encodeURIComponent("identify email");
        const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

        const popup = window.open(url, "DiscordLogin", "width=600,height=600");
        window.addEventListener(
            "message",
            (event) => {
                try {
                    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

                    if(data && data.event === "auth_result" && data.result && data.origin === "https://modifold.com") {
                        const { token, user } = data.result;
                        discordLogin({ token, user }).then(() => {
                            onClose();
                            window.location.reload();
                        }).catch((error) => {
                            alert(error.message || t("errors.discord"));
                        });

                        popup.close();
                    } else if(data && data.event === "auth_error" && data.origin === "https://modifold.com") {
                        console.error("Discord auth error:", data.error);
                        alert(data.error || t("errors.discord"));
                        popup.close();
                    } else {
                        console.warn("Unexpected Discord message format:", data);
                        popup.close();
                    }
                } catch (error) {
                    console.error("Error processing Discord message:", error);
                    alert(t("errors.discordProcessing"));
                    popup.close();
                }
            },
            { once: true }
        );
    };

    const openDataModal = () => {
        setIsDataModalOpen(true);
    };

    const closeDataModal = () => {
        setIsDataModalOpen(false);
    };

    return (
        <>
            <Modal isOpen={isOpen} onRequestClose={onClose} className="modal active" overlayClassName="modal-overlay">
                <div className="modal-window">
                    <div className="modal-window__header">
                        <button className="icon-button modal-window__close" type="button" onClick={onClose} aria-label={t("close")}>
                            <svg className="icon icon--cross" height="24" width="24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="modal-window__content">
                        <div className="auth will-be-animated">
                            <div className="logreg__logo-container logreg__logo-container--padding">
                                <svg width="130" height="40" viewBox="0 0 287 73" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M76.51 52V23.92H81.154L82.288 27.916C83.044 26.584 84.088 25.504 85.42 24.676C86.752 23.812 88.354 23.38 90.226 23.38C92.098 23.38 93.772 23.83 95.248 24.73C96.724 25.63 97.822 26.872 98.542 28.456C99.226 27.052 100.306 25.864 101.782 24.892C103.294 23.884 105.076 23.38 107.128 23.38C109.072 23.38 110.8 23.884 112.312 24.892C113.86 25.864 115.048 27.232 115.876 28.996C116.74 30.724 117.172 32.704 117.172 34.936V52H110.962V35.53C110.962 33.586 110.458 32.002 109.45 30.778C108.442 29.554 107.128 28.942 105.508 28.942C103.888 28.942 102.556 29.572 101.512 30.832C100.468 32.056 99.946 33.622 99.946 35.53V52H93.736V35.53C93.736 33.586 93.232 32.002 92.224 30.778C91.216 29.554 89.902 28.942 88.282 28.942C86.662 28.942 85.33 29.572 84.286 30.832C83.242 32.056 82.72 33.622 82.72 35.53V52H76.51ZM134.61 52.54C131.73 52.54 129.138 51.928 126.834 50.704C124.566 49.444 122.784 47.716 121.488 45.52C120.228 43.288 119.598 40.768 119.598 37.96C119.598 35.152 120.228 32.65 121.488 30.454C122.784 28.222 124.566 26.494 126.834 25.27C129.138 24.01 131.73 23.38 134.61 23.38C137.49 23.38 140.064 24.01 142.332 25.27C144.636 26.494 146.418 28.222 147.678 30.454C148.974 32.65 149.622 35.152 149.622 37.96C149.622 40.768 148.974 43.288 147.678 45.52C146.418 47.716 144.636 49.444 142.332 50.704C140.064 51.928 137.49 52.54 134.61 52.54ZM134.61 46.87C137.13 46.87 139.182 46.06 140.766 44.44C142.35 42.784 143.142 40.624 143.142 37.96C143.142 35.296 142.35 33.154 140.766 31.534C139.182 29.878 137.13 29.05 134.61 29.05C132.09 29.05 130.038 29.878 128.454 31.534C126.87 33.154 126.078 35.296 126.078 37.96C126.078 40.624 126.87 42.784 128.454 44.44C130.038 46.06 132.09 46.87 134.61 46.87ZM164.417 52.54C161.789 52.54 159.431 51.928 157.343 50.704C155.255 49.444 153.617 47.716 152.429 45.52C151.277 43.288 150.701 40.768 150.701 37.96C150.701 35.152 151.277 32.65 152.429 30.454C153.617 28.222 155.255 26.494 157.343 25.27C159.431 24.01 161.789 23.38 164.417 23.38C166.685 23.38 168.701 23.848 170.465 24.784C172.229 25.684 173.669 26.818 174.785 28.186V13.93H180.995V52H176.351L175.055 47.464C173.903 48.868 172.427 50.074 170.627 51.082C168.827 52.054 166.757 52.54 164.417 52.54ZM165.929 46.978C168.557 46.978 170.681 46.15 172.301 44.494C173.957 42.802 174.785 40.624 174.785 37.96C174.785 35.296 173.957 33.136 172.301 31.48C170.681 29.788 168.557 28.942 165.929 28.942C163.337 28.942 161.231 29.788 159.611 31.48C157.991 33.136 157.181 35.296 157.181 37.96C157.181 40.624 157.991 42.802 159.611 44.494C161.231 46.15 163.337 46.978 165.929 46.978ZM192.066 52H185.856V23.92H192.066V52ZM188.988 19.924C187.836 19.924 186.9 19.582 186.18 18.898C185.46 18.178 185.1 17.26 185.1 16.144C185.1 15.028 185.46 14.11 186.18 13.39C186.936 12.67 187.872 12.31 188.988 12.31C190.104 12.31 191.022 12.67 191.742 13.39C192.462 14.11 192.822 15.028 192.822 16.144C192.822 17.26 192.462 18.178 191.742 18.898C191.022 19.582 190.104 19.924 188.988 19.924ZM204.749 23.92H213.119V29.32H204.749V52H198.539V29.32H193.949V23.92H198.539V22.462C198.539 19.69 199.331 17.584 200.915 16.144C202.535 14.668 204.857 13.93 207.881 13.93H213.119L213.659 19.33H207.881C205.793 19.33 204.749 20.374 204.749 22.462V23.92ZM226.22 52.54C223.34 52.54 220.748 51.928 218.444 50.704C216.176 49.444 214.394 47.716 213.098 45.52C211.838 43.288 211.208 40.768 211.208 37.96C211.208 35.152 211.838 32.65 213.098 30.454C214.394 28.222 216.176 26.494 218.444 25.27C220.748 24.01 223.34 23.38 226.22 23.38C229.1 23.38 231.674 24.01 233.942 25.27C236.246 26.494 238.028 28.222 239.288 30.454C240.584 32.65 241.232 35.152 241.232 37.96C241.232 40.768 240.584 43.288 239.288 45.52C238.028 47.716 236.246 49.444 233.942 50.704C231.674 51.928 229.1 52.54 226.22 52.54ZM226.22 46.87C228.74 46.87 230.792 46.06 232.376 44.44C233.96 42.784 234.752 40.624 234.752 37.96C234.752 35.296 233.96 33.154 232.376 31.534C230.792 29.878 228.74 29.05 226.22 29.05C223.7 29.05 221.648 29.878 220.064 31.534C218.48 33.154 217.688 35.296 217.688 37.96C217.688 40.624 218.48 42.784 220.064 44.44C221.648 46.06 223.7 46.87 226.22 46.87ZM250.411 52H244.201V13.93H250.411V52ZM267.091 52.54C264.463 52.54 262.105 51.928 260.017 50.704C257.929 49.444 256.291 47.716 255.103 45.52C253.951 43.288 253.375 40.768 253.375 37.96C253.375 35.152 253.951 32.65 255.103 30.454C256.291 28.222 257.929 26.494 260.017 25.27C262.105 24.01 264.463 23.38 267.091 23.38C269.359 23.38 271.375 23.848 273.139 24.784C274.903 25.684 276.343 26.818 277.459 28.186V13.93H283.669V52H279.025L277.729 47.464C276.577 48.868 275.101 50.074 273.301 51.082C271.501 52.054 269.431 52.54 267.091 52.54ZM268.603 46.978C271.231 46.978 273.355 46.15 274.975 44.494C276.631 42.802 277.459 40.624 277.459 37.96C277.459 35.296 276.631 33.136 274.975 31.48C273.355 29.788 271.231 28.942 268.603 28.942C266.011 28.942 263.905 29.788 262.285 31.48C260.665 33.136 259.855 35.296 259.855 37.96C259.855 40.624 260.665 42.802 262.285 44.494C263.905 46.15 266.011 46.978 268.603 46.978Z" fill="currentColor"/>
                                    <path d="M30.8414 1.17779C31.2484 0.940732 31.7515 0.94074 32.1585 1.17779L62.3522 18.7702C62.7533 19.0039 63 19.4325 63 19.8961V53.2961C63 53.762 62.7509 54.1925 62.3468 54.4253L32.1531 71.8253C31.7489 72.0582 31.251 72.0583 30.8468 71.8253L0.653107 54.4253C0.248963 54.1925 0 53.762 0 53.2961V19.8961C8.9039e-06 19.4325 0.246626 19.0039 0.64771 18.7702L30.8414 1.17779ZM3.48082 21.1032V52.0932L31.5001 68.2903L59.5194 52.0932V21.1032L31.5001 4.70553L3.48082 21.1032ZM56.2998 22.7078V50.5889L31.5001 64.6798L6.70042 50.5889V22.7078L31.5001 8.31602L56.2998 22.7078ZM9.99776 48.9341L30.1938 60.4676V37.7014L9.99776 26.2682V48.9341ZM33.1077 37.7346V60.3673L53.2033 48.9015V26.1679L33.1077 37.7346ZM28.0838 52.7454V56.3729L25.0695 54.651V51.0405L28.0838 52.7454ZM38.1316 54.6509L35.1173 56.3728V52.7453L38.1316 51.0404V54.6509ZM15.2226 45.5245V49.1349L12.1078 47.43V43.8195L15.2226 45.5245ZM51.0933 47.4299L47.9784 49.1348V45.5244L51.0933 43.8194V47.4299ZM22.658 40.3093V47.0288L17.0312 43.9198V37.2003L22.658 40.3093ZM46.1698 43.9197L40.5431 47.0287V40.3092L46.1698 37.2002V43.9197ZM28.1843 39.4067V43.2177L25.0695 41.5128V37.7017L28.1843 39.4067ZM38.1316 41.5127L35.0168 43.2176V39.4066L38.1316 37.7016V41.5127ZM15.2226 32.3863V35.9968L12.1078 34.2918V30.6813L15.2226 32.3863ZM51.0933 34.2917L47.9784 35.9967V32.3862L51.0933 30.6812V34.2917Z" fill="#2041DA"/>
                                </svg>
                            </div>

                            <div className="auth__content auth__content--stretched" style={{ gap: "10px" }}>
                                <button className="button button--size-xl button--type-minimal button--with-icon" type="button" onClick={handleGitHubClick}>
                                    <svg className="icon icon--github" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.932 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="#181717" />
                                    </svg>

                                    {t("continueWith", { provider: "GitHub" })}
                                </button>

                                <button className="button button--size-xl button--type-minimal button--with-icon" type="button" onClick={handleDiscordClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="icon">
                                        <path fill="#5865F2" d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 13 13 0 0 0-.617-1.25.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.1.1 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13 13 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10 10 0 0 0 .372-.292.07.07 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03M8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418"></path>
                                    </svg>

                                    {t("continueWith", { provider: "Discord" })}
                                </button>

                                <button className="button button--size-xl button--type-minimal button--with-icon" type="button" onClick={handleTelegramClick}>
                                    <svg className="icon icon--google_day" width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="16" cy="16" r="14" fill="url(#paint0_linear_5_16430)"></circle>
                                        <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white"></path>
                                        <defs>
                                            <linearGradient id="paint0_linear_5_16430" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#37BBFE" />
                                                <stop offset="1" stopColor="#007DBB" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    {t("continueWith", { provider: "Telegram" })}
                                </button>
                            </div>

                            <div className="auth__footer">
                                <span className="link-button link-button--default" onClick={openDataModal} style={{ cursor: "pointer" }}>
                                    {t("dataModal.title")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDataModalOpen} onRequestClose={closeDataModal} className="modal active" overlayClassName="modal-overlay">
                <div className="modal-window">
                    <div className="modal-window__header">
                        <button className="icon-button modal-window__close" type="button" onClick={closeDataModal} aria-label={t("close")}>
                            <svg className="icon icon--cross" height="24" width="24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="modal-window__content">
                        <h2 style={{ fontSize: "18px", marginBottom: "15px", fontWeight: "500" }}>{t("dataModal.title")}</h2>

                        <p style={{ marginBottom: "15px" }}>{t("dataModal.intro")}</p>

                        <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
                            <li>{t("dataModal.items.usernameAvatar")}</li>
                            <li>{t("dataModal.items.email")}</li>
                        </ul>

                        <p>{t("dataModal.outro")}</p>
                    </div>
                </div>
            </Modal>
        </>
    );
}