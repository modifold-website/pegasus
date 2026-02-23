"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProjectMasthead from "../project/ProjectMasthead";
import ProjectTabs from "../project/ProjectTabs";
import ProjectSidebar from "../project/ProjectSidebar";

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

export default function ProjectPage({ project, authToken }) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: project.title,
        description: project.summary,
        applicationCategory: "Game",
        operatingSystem: "Hytale",
        author: {
            "@type": "Person",
            name: project.owner.username,
            url: `https://modifold.com/user/${project.owner.slug}`,
        },
        datePublished: project.created_at,
        image: project.icon_url,
        url: `https://modifold.com/mod/${project.slug}`,
    };

    const featuredImage = project.gallery?.find(image => image.featured === 1);

    return (
        <>
            {featuredImage && project.showProjectBackground === 1 && (
                <img src={featuredImage.url} className="fixed-background-teleport"></img>
            )}

            <div className="layout">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
                
                <div className="project-page">
                    <ProjectMasthead project={project} authToken={authToken} />

                    <div className="project__general">
                        <div>
                            <ProjectTabs project={project} />

                            <div className="content content--padding markdown-body">
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
                                    {project.description}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <ProjectSidebar project={project} />
                    </div>
                </div>
            </div>
        </>
    );
}
