import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ProjectMasthead from "@/components/project/ProjectMasthead";
import ProjectTabs from "@/components/project/ProjectTabs";

export default async function Layout({ children, params }) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    const projectFetchOptions = authToken ? {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
    } : {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`project:${slug}`] },
    };

    let projectRes;
    try {
        projectRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, projectFetchOptions);
    } catch {
        notFound();
    }

    if(!projectRes.ok) {
        notFound();
    }

    const project = await projectRes.json();
    const featuredImage = project.gallery?.find((image) => image.featured === 1 || image.featured === true);

    return (
        <>
            {featuredImage && (
                <img src={featuredImage.url} className="fixed-background-teleport" alt="" />
            )}

            <div className="layout">
                <div className="project-page">
                    <ProjectMasthead project={project} authToken={authToken} />

                    <ProjectTabs project={project} />

                    {children}
                </div>
            </div>
        </>
    );
}