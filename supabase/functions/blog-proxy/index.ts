import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { action, marca_id } = body;

    if (!marca_id) {
      return new Response(JSON.stringify({ error: "marca_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch brand's blog credentials
    const { data: marca, error: marcaErr } = await supabase
      .from("marcas")
      .select("blog_url, blog_key, nome_da_marca")
      .eq("id", marca_id)
      .single();

    if (marcaErr || !marca) {
      return new Response(JSON.stringify({ error: "Marca não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!marca.blog_url || !marca.blog_key) {
      return new Response(JSON.stringify({ error: "Blog não configurado para esta marca" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const blogUrl = marca.blog_url.replace(/\/+$/, "");
    const blogKey = marca.blog_key;
    const headers = {
      apikey: blogKey,
      Authorization: `Bearer ${blogKey}`,
      "Content-Type": "application/json",
    };

    // ========== TEST CONNECTION ==========
    if (action === "test") {
      try {
        const res = await fetch(`${blogUrl}/rest/v1/posts?limit=1`, {
          headers: { apikey: blogKey, Authorization: `Bearer ${blogKey}` },
        });
        if (res.ok) {
          return new Response(JSON.stringify({ status: "connected" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ status: "error", message: `HTTP ${res.status}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ status: "error", message: e.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ========== LIST POSTS ==========
    if (action === "list") {
      const res = await fetch(`${blogUrl}/rest/v1/posts?order=published_at.desc&limit=20`, {
        headers: { apikey: blogKey, Authorization: `Bearer ${blogKey}` },
      });
      if (!res.ok) {
        return new Response(JSON.stringify({ error: `HTTP ${res.status}` }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const posts = await res.json();
      return new Response(JSON.stringify({ posts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== PUBLISH POST ==========
    if (action === "publish") {
      const { title, description, content, category, read_time, author_name, author_initials, cover_image, cover_image_data, cover_image_type, cover_image_name } = body;

      let finalCoverImage = cover_image || null;

      // Upload cover image if binary data provided
      if (cover_image_data && cover_image_name) {
        try {
          const imgBytes = Uint8Array.from(atob(cover_image_data), c => c.charCodeAt(0));
          const timestamp = Date.now();
          const path = `blog-images/${timestamp}-${cover_image_name}`;
          const uploadRes = await fetch(`${blogUrl}/storage/v1/object/${path}`, {
            method: "POST",
            headers: {
              apikey: blogKey,
              Authorization: `Bearer ${blogKey}`,
              "Content-Type": cover_image_type || "image/jpeg",
            },
            body: imgBytes,
          });
          if (uploadRes.ok) {
            finalCoverImage = `${blogUrl}/storage/v1/object/public/${path}`;
          }
        } catch (e) {
          console.error("Image upload error:", e);
        }
      }

      const postBody = {
        title: title || "Sem título",
        description: description || "",
        content: content || "",
        category: category || "conteudo",
        read_time: read_time || 2,
        status: "publicado",
        published_at: new Date().toISOString(),
        author_name: author_name || marca.nome_da_marca || "Autor",
        author_initials: author_initials || (author_name || marca.nome_da_marca || "A").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
        cover_image: finalCoverImage,
        slug: "",
      };

      const res = await fetch(`${blogUrl}/rest/v1/posts`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(postBody),
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ error: `HTTP ${res.status}: ${errText}` }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await res.json();
      return new Response(JSON.stringify({ success: true, post: Array.isArray(result) ? result[0] : result }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== REPUBLISH (PATCH) ==========
    if (action === "republish") {
      const { post_id, title, description, content, category, read_time, cover_image } = body;

      if (!post_id) {
        return new Response(JSON.stringify({ error: "post_id required for republish" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const patchBody: Record<string, unknown> = {};
      if (title) patchBody.title = title;
      if (description) patchBody.description = description;
      if (content) patchBody.content = content;
      if (category) patchBody.category = category;
      if (read_time) patchBody.read_time = read_time;
      if (cover_image) patchBody.cover_image = cover_image;
      patchBody.published_at = new Date().toISOString();

      const res = await fetch(`${blogUrl}/rest/v1/posts?id=eq.${post_id}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(patchBody),
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ error: `HTTP ${res.status}: ${errText}` }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await res.json();
      return new Response(JSON.stringify({ success: true, post: Array.isArray(result) ? result[0] : result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("blog-proxy error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
