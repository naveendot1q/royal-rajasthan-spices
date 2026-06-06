import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatDate } from "@rrs/shared";
import type { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServer();
  const { data: post } = await supabase
    .from("blogs")
    .select("title, excerpt, cover_image")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: { images: post.cover_image ? [post.cover_image] : [] },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();
  const { data: post } = await supabase
    .from("blogs")
    .select("*, author:profiles(full_name, avatar_url)")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .single();

  if (!post) notFound();

  const author = post.author as { full_name: string | null; avatar_url: string | null } | null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image,
    datePublished: post.published_at,
    author: { "@type": "Person", name: author?.full_name || "Royal Rajasthan Team" },
    publisher: {
      "@type": "Organization",
      name: "Royal Rajasthan Spice Market",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-palace-ivory">
        {post.cover_image && (
          <div className="w-full aspect-video max-h-[500px] overflow-hidden">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6 flex gap-2">
            <a href="/" className="hover:text-royal-gold-600">Home</a>
            <span>/</span>
            <a href="/blog" className="hover:text-royal-gold-600">Blog</a>
            <span>/</span>
            <span className="text-gray-700 truncate">{post.title}</span>
          </nav>

          {/* Tags */}
          {(post.tags as string[]).length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {(post.tags as string[]).map((tag) => (
                <span key={tag} className="px-3 py-1 bg-royal-gold-100 text-royal-gold-700 text-xs font-medium rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-display text-4xl font-bold text-maroon-700 mb-4 leading-tight">{post.title}</h1>

          {/* Author + date */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-royal-gold-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-600 flex items-center justify-center text-white font-bold text-sm">
              {author?.full_name?.[0]?.toUpperCase() || "R"}
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{author?.full_name || "Royal Rajasthan Team"}</p>
              <p className="text-xs text-gray-400">{post.published_at ? formatDate(post.published_at) : ""}</p>
            </div>
          </div>

          {/* Body */}
          {post.body && (
            <div
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-maroon-700 prose-a:text-royal-gold-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-royal-gold-100">
            <a href="/blog" className="text-royal-gold-600 hover:text-royal-gold-800 font-medium flex items-center gap-2">
              ← Back to Blog
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
