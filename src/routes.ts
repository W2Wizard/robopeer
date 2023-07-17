//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

/** A command that the "shell" can execute. */
export interface Route {
	methods: Methods[];
	/** The function that executes the command */
	handle?: RouteHandler;
}

/** A function to handle a request. */
export type RouteHandler = (request: Request, url: URL) => Response;

/** The available methods. */
export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** A Map of the commands that the shell can execute. */
export let Routes: { [name: string]: Route } = {};

// Router
//=============================================================================

/**
 * Handle a request.
 * @param request The request to handle.
 * @returns A response to the request.
 */
export default function (request: Request): Response {
	const url = new URL(request.url);
	const route = Routes[url.pathname];

	if (!route) {
		return new Response(`Route ${request.url} not found.`, {
			status: 404,
		});
	}
	if (!route.handle || !route.methods || route.methods.length === 0) {
		return new Response(`Route ${request.url} not implemented.`, {
			status: 501,
		});
	}

	// Handle the request if the method is allowed.
	if (route.methods.includes(request.method as Methods)) {
		return route.handle(request, url);
	} else {
		return new Response(`Method ${request.method} not allowed.`, {
			status: 405,
			headers: {
				"Allow": route.methods.join(", "),
			},
		});
	}
}
