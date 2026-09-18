import { getServerClient } from "@/lib/supabase/server";
import PostCard from "@/app/components/PostCard";
import type { Post } from "@/app/lib/feed";

const postTypeToKind: Record<string, Post["kind"]> = {
  meal: "activity",
  nap: "activity",
  activity: "activity",
  achievement: "achievement",
  photo: "activity",
  announcement: "announcement",
};

export default async function FamilyFeedPage() {
  const supabase = await getServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  let childIds: string[] = [];
  let childNames: string[] = [];

  if (session) {
    const { data: parentChildren } = await supabase
      .from("parent_children")
      .select("child_id, children(full_name)")
      .eq("parent_id", session.user.id);

    childIds = parentChildren?.map((pc) => pc.child_id) || [];
    childNames = (parentChildren?.map((pc) => (pc.children as { full_name: string } | null)?.full_name).filter((name): name is string => Boolean(name))) || [];
  }

  let posts: Post[] = [];

  if (childIds.length > 0) {
    const { data: postsData, error } = await supabase
      .from("posts")
      .select(`
        id,
        type,
        body,
        published_at,
        room_id,
        title,
        users!author_id (full_name, role),
        post_children (
          children (full_name)
        ),
        post_photos (url, position, width, height)
      `)
      .in("post_children.child_id", childIds)
      .or("type.eq.announcement")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      posts = (postsData || []).map((post) => {
        const kind = postTypeToKind[post.type] || "activity";
        const children = post.post_children?.map((pc: { children: { full_name: string } }) => pc.children.full_name) || [];
        const firstChild = children[0] || "";
        const audience =
          kind === "announcement"
            ? "Para: toda la sala"
            : `Para: familia de ${children.join(", ")}`;
        const time = new Date(post.published_at).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          id: post.id,
          kind,
          author: kind === "announcement" ? "Anuncio general" : firstChild,
          time,
          audience,
          body: post.body,
          photoLabel:
            post.post_photos?.length
              ? `Foto · ${post.post_photos.length} ${post.post_photos.length === 1 ? "imagen" : "imágenes"}`
              : undefined,
          likes: 0,
          comments: 0,
        };
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
      <div className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
          GUARDERÍA · SALA SOLES
        </div>
        <h1 className="font-fredoka text-[30px] font-semibold text-[#3F362E]">
          Buenas, familia
        </h1>
        <p className="mt-[5px] text-[14.5px] text-[#94887B]">
          {childNames.length > 0 ? childNames.join(", ") : "Aún no tenés niños vinculados"}
        </p>
      </div>

      {childNames.length > 1 && (
        <div className="mb-6 flex gap-2">
          <button className="rounded-full bg-[#FBE3D8] px-4 py-1.5 text-sm font-bold text-[#D9583C]">
            Todos
          </button>
          {childNames.map((name) => (
            <button
              key={name}
              className="rounded-full border border-[#E7DAC8] bg-[#FFFDF9] px-4 py-1.5 text-sm font-semibold text-[#6E6359]"
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-[14px] flex items-center gap-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
          PUBLICADO HOY
        </span>
        <span className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-[15px] text-[#94887B]">
          No hay publicaciones aún.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
