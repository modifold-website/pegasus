import React from "react";
import ProjectComments from "../comments/ProjectComments";
import ProjectSidebar from "../project/ProjectSidebar";

export default function CommentsPage({ project, authToken, initialComments, initialCanModerate, initialCommentsLoaded }) {
    return (
        <>
            <div className="project__general">
                <div>
                    <ProjectComments
                        project={project}
                        authToken={authToken}
                        initialComments={initialComments}
                        initialCanModerate={initialCanModerate}
                        initialCommentsLoaded={initialCommentsLoaded}
                    />
                </div>

                <ProjectSidebar project={project} showLicense={true} showLinks={true} />
            </div>
        </>
    );
}