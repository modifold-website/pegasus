import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import ProfilePage from "@/components/pages/ProfilePage";

export async function generateMetadata({ params }) {
    const { username } = await params;
    const resolvedLocale = await getLocale();
    const tProfile = await getTranslations({ locale: resolvedLocale, namespace: "ProfilePage" });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/${username}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`user:${username}`] },
    });

    if(!res.ok) {
        return { title: tProfile("metadata.notFound") };
    }

    const user = await res.json();

    const banRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bans/${user.id}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`user:${username}:ban`] },
    });

    const banData = banRes.ok ? await banRes.json() : { isBanned: false };

    return {
        title: banData.isBanned ? tProfile("metadata.frozen") : tProfile("metadata.title", { username: user.username }),
    };
}

export default async function Page({ params }) {
    const { username } = await params;
    const resolvedLocale = await getLocale();
    const tNotFound = await getTranslations({ locale: resolvedLocale, namespace: "NotFound" });
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/${username}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`user:${username}`] },
    });

    if(!userRes.ok) {
        return (
            <div className="layout">
                <div className="view">
                    <div className="not-found-page__dummy">{tNotFound("message")}</div>
                </div>
            </div>
        );
    }

    const user = await userRes.json();

    const banFetchOptions = {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`user:${username}:ban`] },
    };

    const postsFetchOptions = authToken ? {
        headers: { Accept: "application/json", Authorization: `Bearer ${authToken}` },
        cache: "no-store",
    } : {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`user:${username}:articles`] },
    };

    const [banRes, postsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bans/${user.id}`, banFetchOptions),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/articles?user=${username}&sort=latest&period=all`, postsFetchOptions),
    ]);

    const banData = banRes.ok ? await banRes.json() : { isBanned: false };
    const posts = postsRes.ok ? await postsRes.json() : { articles: [] };

    let isSubscribed = false;
    let subscriptionId = null;

    if(authToken) {
        const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/subscriptions/${user.id}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if(subRes.ok) {
            const subData = await subRes.json();
            isSubscribed = subData.isSubscribed;
            subscriptionId = subData.subscriptionId;
        }
    }

    return (
        <ProfilePage user={user} posts={posts.articles} isBanned={banData.isBanned} isSubscribed={isSubscribed} subscriptionId={subscriptionId} authToken={authToken} />
    );
}