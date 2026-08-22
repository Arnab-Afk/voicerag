const UPSTREAM = "https://voiceraghhgoa.arnabbhowmik.in"

type RouteContext = { params: Promise<{ path: string[] }> }

async function relay(req: Request, path: string[]) {
  const url = `${UPSTREAM}/api/${path.join("/")}`
  const contentType = req.headers.get("content-type") ?? ""

  const init: RequestInit = {
    method: req.method,
    cache: "no-store",
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType.includes("multipart/form-data")) {
      init.body = await req.formData()
    } else {
      init.headers = { "Content-Type": "application/json" }
      init.body = await req.text()
    }
  }

  const upstream = await fetch(url, init)
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  })
}

export async function GET(req: Request, context: RouteContext) {
  const { path } = await context.params
  return relay(req, path)
}

export async function POST(req: Request, context: RouteContext) {
  const { path } = await context.params
  return relay(req, path)
}
