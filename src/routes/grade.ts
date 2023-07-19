//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { on } from "stream";
import { Socket } from "bun";

/**
 * Handle POST requests to /grade.
 * Grades a git repository and returns the results.
 *
 * @param git The git repository to grade.
 * @returns JSON object with the grading results.
 */
export async function POST(request: Request, url: URL): Promise<Response> {
	return new Response("Not implemented", { status: 501 });
}
