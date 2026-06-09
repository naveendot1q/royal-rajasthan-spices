import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@rrs/shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spice Stories — Blog",
  description: "Recipes, spice guides, and stories from the royal kitchens of Rajasthan",
};

type BlogPost = {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_image: string | null; tags: string[]; published_at: string | null;
  author: { full_name: string | null } | null;
};

export default async function BlogPage() {
  const supabase = await createSupabaseServer();
  const { data: rawPosts } = await supabase
    .from("blogs")
    .select("id, slug, title, excerpt, cover_image, tags, published_at, author:profiles(full_name)")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(12);

  const posts = (rawPosts ?? []) as unknown as BlogPost[];

  return (
    <div className="min-h-screen bg-palace-ivory">
      <div className="bg-gradient-to-r from-maroon-800 to-maroon-700 text-white py-16 pattern-overlay">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-royal-gold-400 text-sm font-medium tracking-widest uppercase mb-3">Stories & Recipes</p>
          <h1 className="font-display text-4xl font-bold">Spice Stories</h1>
          <p className="text-gray-300 mt-3 max-w-xl mx-auto">
            Explore the rich heritage of Rajasthani spices — recipes, traditions, and the people behind your favourite flavours.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border border-royal-gold-100 hover:shadow-gold transition-shadow duration-300 h-full flex flex-col">
                  <div className="aspect-video bg-desert-sand overflow-hidden flex-shrink-0">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl pattern-overlay">🌶</div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {post.tags.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-royal-gold-100 text-royal-gold-700 text-xs rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-lg font-semibold text-maroon-700 mb-2 group-hover:text-royal-gold-700 transition-colors line-clamp-2 flex-1">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                      <span>{post.author?.full_name || "Royal Rajasthan Team"}</span>
                      <span>{post.published_at ? formatDate(post.published_at) : ""}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
