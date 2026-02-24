"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";
import Link from "next/link";

const getSafeMarkdownHref = (href) => {
    if(typeof href !== "string") {
        return null;
    }

    if(href.startsWith("/") || href.startsWith("#")) {
        return href;
    }

    try {
        const parsed = new URL(href);
        if(!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
};

const privacyPolicy = `
# Privacy Policy

**Last modified: February 22, 2026**

## Introduction

Modifold ("we", "us", "our") is a platform for discovering and publishing **Hytale** content.  
This privacy policy explains how we collect, process, and protect your data, as well as your rights regarding your personal information.

This policy applies to information we collect:
- On our website (\`modifold.com\` and \`api.modifold.com\`) and through the Modifold platform ("Service" or "Website")
- In email, text, and other electronic messages between you and this Website
- When you interact with our applications or services, including any links to this policy

This policy does **not** apply to:
- Information collected offline or through any other means
- Information collected by third-party websites or services that may link to or be accessible from our Website

Please read this policy carefully. By accessing or using our Website, you agree to this privacy policy.  
The policy may be updated from time to time (see *Changes to the Privacy Policy* section).

## Foreword

We comply with applicable data protection laws, including but not limited to:
- The legislation of the **Republic of Belarus** (country of primary legal registration and operation)
- The [General Data Protection Regulation (GDPR)](https://gdpr.eu) of the European Union
- The [California Consumer Privacy Act (CCPA)](https://oag.ca.gov) as applicable to California residents

Modifold acts as the **data controller** for personal data collected through our Service.

## What Data Do We Collect?

### User Account Data

When you create an account, we collect:
- Email address
- Username
- Display name
- Profile picture (optional)
- Social links (YouTube, Telegram, X/Twitter, Discord, etc. — optional)
- Profile description (optional)

### View & Download Statistics

When you view a project page or download any file we collect:
- IP-address
- User ID (if logged in)
- Project/file identifier
- Approximate country (derived from IP)
- Basic technical metadata (browser, HTTP headers, etc.)

### Analytics Data

When you consent to analytics cookies, we collect analytics data via **Yandex.Metrika** and **Google Analytics**, including:
- IP-address
- Anonymized user identifier (if logged in)
- Pages visited, time spent, clicks
- Device/browser information

### Cookies

We use necessary cookies for:
- Authentication (\`authToken\`)
- Saving user preferences (theme, language, etc.)

Analytics cookies (including Yandex.Metrika and Google Analytics) are placed **only after your consent** through our cookie banner.

## Data Retention Periods

- View/download logs → anonymized after **24 months**
- Account data → stored until you request deletion
- Analytics data → stored as long as necessary for improvement purposes (or until you withdraw consent)

## Third Parties & Data Sharing

- We use **Yandex.Metrika** and **Google Analytics** for website analytics (only with your consent)
- **We do not sell** your personal data to anyone
- No other third-party services currently receive your personal data

## Data Storage & Security

All personal data is stored in a secure data center within the **European Economic Area (EEA)**.  
Data is encrypted both at rest and in transit.

## Your Rights

Depending on applicable law (especially GDPR and Belarus legislation) you have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion ("right to be forgotten")
- Restrict processing
- Object to processing
- Data portability

To exercise these rights please write to: **support@modifold.com**  
We usually respond within 30 days.

## Children's Privacy

We do not knowingly collect personal data from children under the age of **13**.  
If you believe a child under 13 has provided us with personal information, please contact us immediately.

## California Privacy Rights (CCPA)

California residents have additional rights under the CCPA.  
We do not sell personal information.  
For more information see the official California Attorney General website: https://oag.ca.gov/privacy/ccpa

## Changes to This Privacy Policy

We may update this policy from time to time.  
The new version becomes effective immediately after posting on the website.  
We will try to notify users of **significant** changes via website announcement or email.

## Contact Us

Questions, requests, complaints → **support@modifold.com**

If you believe we process your data unlawfully, you may also contact the supervisory authority of the **Republic of Belarus** — the **National Data Protection Authority** (Оперативно-аналитический центр при Президенте Республики Беларусь) or any other relevant EU supervisory authority (depending on your location).
`;

export default function PrivacyPolicy() {
    const pathname = usePathname();
    const isActive = (href) => pathname === href;

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/legal/terms`} className={`sidebar-item ${isActive(`/legal/terms`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42"></path><path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3h0a2.13 2.13 0 0 0 3 0l2.26-2.21a3 3 0 0 1 4.22 0l2.4 2.4M18 15l-2-2M15 18l-2-2"></path></svg>

                            Terms of Use
                        </Link>

                        <Link href={`/legal/rules`} className={`sidebar-item ${isActive(`/legal/rules`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 6 3 1m0 0-3 9a5 5 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2 3-1m-3 1-3 9a5 5 0 0 0 6.001 0M18 7l3 9m-3-9-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>

                            Content Rules
                        </Link>

                        <Link href={`/legal/privacy`} className={`sidebar-item ${isActive(`/legal/privacy`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>

                            Privacy Policy
                        </Link>

                        <Link href={`/legal/copyright`} className={`sidebar-item ${isActive(`/legal/copyright`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M15 9.354a4 4 0 1 0 0 5.292"></path></svg>

                            Copyright Policy
                        </Link>
                    </div>
                </div>

                <div class="content content--padding markdown-body">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ href, children }) => {
                                const safeHref = getSafeMarkdownHref(href);
                                if(!safeHref) {
                                    return <>{children}</>;
                                }

                                const isExternal = /^https?:\/\//i.test(safeHref);
                                return (
                                    <a href={safeHref} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
                                        {children}
                                    </a>
                                );
                            },
                        }}
                    >
                        {privacyPolicy}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}