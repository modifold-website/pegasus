"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ProjectMasthead from "../project/ProjectMasthead";
import ProjectTabs from "../project/ProjectTabs";
import ProjectSidebar from "../project/ProjectSidebar";
import { getSafeMarkdownHref, getSafeMarkdownImageSrc, prepareProjectDescriptionMarkdown } from "@/utils/projectDescriptionContent";

export default function ProjectPage({ project, authToken }) {
    const safeDescription = prepareProjectDescriptionMarkdown(project.description);
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
                                    rehypePlugins={[rehypeRaw]}
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
                                        img: ({ src, alt, title }) => {
                                            const safeSrc = getSafeMarkdownImageSrc(src);
                                            if(!safeSrc) {
                                                return null;
                                            }

                                            return <img src={safeSrc} alt={alt || ""} title={title} loading="lazy" />;
                                        },
                                    }}
                                >
                                    {safeDescription}
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