//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { db } from "../main";

/**
 * Handle GET requests to /grade.
 *
 * @param id The id of the grading to get.
 * @returns JSON object with the grading details.
 */
export function GET(request: Request, url: URL): Response {
	const id = url.searchParams.get("id");
	if (!id) {
		return new Response("Missing ID param", { status: 400 });
	}

	let grade;
	try {
		grade = db.query("SELECT * FROM gradings WHERE id = ?").get(id);
	} catch (exception) {
		return new Response(`${exception}`, { status: 500 });
	}

	if (!grade)
		return new Response("Not found", { status: 404 });
	return new Response(JSON.stringify(grade), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
}

/**
 * Handle POST requests to /grade.
 * Grades a git repository and returns the results.
 *
 * @param git The git repository to grade.
 * @returns JSON object with the grading results.
 */
export function POST(request: Request, url: URL): Response {
	// 1. Create a docker container.
	// 2. Clone the git repository.
	// 3. Run the grading script.
	// 4. Return the results.
	return new Response("Not implemented", { status: 501 });
}
