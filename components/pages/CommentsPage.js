import React from "react";
import ProjectComments from "../comments/ProjectComments";
import ProjectMasthead from "../project/ProjectMasthead";
import ProjectTabs from "../project/ProjectTabs";
import ProjectSidebar from "../project/ProjectSidebar";

export default function CommentsPage({ project, authToken, initialComments, initialCanModerate, initialCommentsLoaded }) {

    const featuredImage = project.gallery?.find(image => image.featured === 1);

    return (
        <>
            {featuredImage && (
                <img src={featuredImage.url} className="fixed-background-teleport"></img>
            )}

            <div className="layout">
                <div className="project-page">
                    <ProjectMasthead project={project} authToken={authToken} />

                    <div className="project__general">
                        <div>
                            <ProjectTabs project={project} />

                            <ProjectComments
                                project={project}
                                authToken={authToken}
                                initialComments={initialComments}
                                initialCanModerate={initialCanModerate}
                                initialCommentsLoaded={initialCommentsLoaded}
                            />
                        </div>

                        <ProjectSidebar project={project} showLicense={true} showLinks={false} />
                    </div>
                </div>
            </div>
        </>
    );
}