//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

/** A route is a path that the server can handle. */
export class Route {
	constructor(methods: Methods[], handle?: RouteHandler) {
		this.methods = methods;
		this.handle = handle;
	}

	/**
	 * The methods that the route can handle.
	 * @note If this is not set, the route returns a 405 Method Not Allowed.
	 */
	public methods: Array<Methods>;

	/**
	 * The function that is executed when the route is requested.
	 * @note If this is not set, the route returns a 501 Not Implemented.
	 */
	public handle?: RouteHandler;
}

/** A function to handle a request. */
export type RouteHandler = (request: Request, url: URL) => Promise<Response>;

/** The available methods. */
export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** A Map of the commands that the shell can execute. */
export let routes: { [name: string]: Route } = { };
export let mimes: { [name: string]: string } = {
	"html": "text/html",
	"css": "text/css",
	"js": "application/javascript",
	"json": "application/json",
	"png": "image/png",
	"jpg": "image/jpeg",
	"gif": "image/gif",
	"svg": "image/svg+xml",
	"ico": "image/x-icon",
	"pdf": "application/pdf",
	"zip": "application/zip",
	"gz": "application/gzip",
	"tar": "application/x-tar",
	"mp3": "audio/mpeg",
	"mp4": "video/mp4",
	"webm": "video/webm",
	"ogg": "audio/ogg",
	"ogv": "video/ogg",
	"ogx": "application/ogg",
	"txt": "text/plain",
	"md": "text/markdown",
	"xml": "application/xml",
	"csv": "text/csv",
	// ...
};

/**
 * Serve static files from a directory. Any general request will be handled by
 * this router.
 *
 * @param url The request URL.
 * @param dir The directory to serve files from.
 * @returns A response with the file contents.
 */
async function serveStatic(url: URL, dir: string) {
	if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
		url.pathname += "/";
	}
	if (url.pathname.endsWith("/")) {
		url.pathname += "index.html";
	}

	const file = Bun.file(`${process.cwd()}/${dir}/${url.pathname}`);
	if (!(await file.exists()))
		return null;

	return new Response(file.stream(), {
		status: 200,
		headers: {
			"Content-Type": mimes[url.pathname.split(".").pop() ?? "octet-stream"],
		}
	});
}

/**
 * Master request handler.
 * @param request The request to handle.
 * @returns A response to the request.
 */
export default async function (request: Request, dir?: string): Promise<Response> {
	const url = new URL(request.url);
	const route = routes[url.pathname];

	if (dir && !route) {
		// Try finding a static file.
		const staticDir = await serveStatic(url, dir);
		if (staticDir) return staticDir;
	}

	if (!route) {
		return new Response("Route not found", {
			status: 404,
		});
	}
	if (!route.handle) {
		return new Response(`Route ${request.url} not implemented.`, {
			status: 501,
		});
	}

	// Handle the request if the method is allowed.
	if (route.methods.includes(request.method as Methods)) {
		return await route.handle(request, url);
	} else {
		return new Response(`Method ${request.method} not allowed.`, {
			status: 405,
			headers: {
				"Allow": route.methods.join(", "),
			},
		});
	}
}
