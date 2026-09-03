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

export default async function Home() {
  const supabase = await getServerClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
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
    `
    )
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const mappedPosts: Post[] = (posts || []).map((post) => {
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

  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
      <div className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
          GUARDERÍA · SALA SOLES
        </div>
        <h1 className="font-fredoka text-[30px] font-semibold text-[#3F362E]">
          Buenas, Caro
        </h1>
        <p className="mt-[5px] text-[14.5px] text-[#94887B]">
          12 niños · martes 17 jun
        </p>
      </div>

      <a
        href="#"
        className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
      >
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#F2937A] font-fredoka text-base font-semibold text-white">
          C
        </div>
        <span className="flex-1 text-[15px] text-[#A89A8B]">
          Compartí un momento…
        </span>
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#FBE3D8] text-[#E0654A]">
          <CameraIcon />
        </span>
      </a>

      <div className="mb-[14px] flex items-center gap-[14px]">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
          PUBLICADO HOY
        </span>
        <span className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      <div className="flex flex-col gap-4">
        {mappedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
