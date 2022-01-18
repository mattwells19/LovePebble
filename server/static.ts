export async function serveStatic(url: URL): Promise<Response | null> {
  if (url.pathname.includes("/assets/")) {
    try {
      const file = await Deno.readFile(`./build/${url.pathname}`);
      return new Response(file, {
        headers: {
          "content-type": "text/javascript",
        },
      });
    } catch (e) {
      console.error(e);
      return new Response(null, {
        status: 404,
      });
    }
  } else if (url.pathname === "/" || url.pathname === "/name" || url.pathname.startsWith("/room/")) {
    try {
      const file = await Deno.readFile("./build/index.html");
      return new Response(file, {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    } catch (e) {
      console.error(e);
      return new Response(null, {
        status: 404,
      });
    }
  } else {
    return null;
  }
}
