export default function ProjectCardSkeleton() {
    return (
        <div className="new-project-card skeleton">
            <div className="skeleton-square" style={{ width: "100px", height: "100px" }}></div>

            <div className="new-project-info">
                <div className="new-project-header" style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                    <div className="skeleton-bar" style={{ width: "96px", height: "20px" }}></div>
                    <div className="skeleton-bar" style={{ width: "24px", height: "20px" }}></div>
                    <div className="skeleton-bar" style={{ width: "76px", height: "20px" }}></div>
                </div>

                <div className="skeleton-bar" style={{ width: "100%", height: "19px" }}></div>

                <div className="new-project-tags">
                    <div className="skeleton-bar" style={{ width: "16px", height: "16px" }}></div>
                    <div className="skeleton-bar" style={{ width: "111px", height: "24px" }}></div>
                    <div className="skeleton-bar" style={{ width: "111px", height: "24px" }}></div>
                    <div className="skeleton-bar" style={{ width: "111px", height: "24px" }}></div>
                </div>
            </div>

            <div className="new-project-stats">
                <div className="new-project-stats-top">
                    <div className="new-stat">
                        <div className="skeleton-bar" style={{ width: "20px", height: "20px" }}></div>
                        <div className="skeleton-bar" style={{ width: "30px", height: "19px" }}></div>
                    </div>

                    <div className="new-stat">
                        <div className="skeleton-bar" style={{ width: "20px", height: "20px" }}></div>
                        <div className="skeleton-bar" style={{ width: "19px", height: "19px" }}></div>
                    </div>
                </div>

                <div className="new-stat new-updated">
                    <div className="skeleton-bar" style={{ width: "20px", height: "20px" }}></div>
                    <div className="skeleton-bar" style={{ width: "103px", height: "19px" }}></div>
                </div>
            </div>
        </div>
    );
}