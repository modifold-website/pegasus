"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ProjectMasthead from "../project/ProjectMasthead";
import ProjectTabs from "../project/ProjectTabs";
import ProjectSidebar from "../project/ProjectSidebar";

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
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        a: ({ href, children }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer">
                                                {children}
                                            </a>
                                        ),
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