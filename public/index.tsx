//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { OsInfo } from "./os";
import { hostname } from "os";
import { Root, elements } from "./base";

//=============================================================================

export default async function index(html: (value: string) => Response) {
	return html(
		<Root>
			<body>
				<header>
					<h1>Grader: {`${hostname()}@${process.pid}`}</h1>
				</header>
				<main>
					<p>Welcome to the Dashboard</p>
					<hr />
					<div class="toolbar">

						{/* Container counter */}
						<div id="counter">
							<span>Containers:</span>
							<pre
								hx-get="/api/count"
								hx-trigger="load, every 5s"
								hx-swap="innerHTML"
							>
								0
							</pre>
						</div>

						{/* Kill */}
						<button hx-confirm="Are you sure?" id="kill-button" hx-post="/api/stop">
							Kill Me
						</button>
					</div>
					<OsInfo />
				</main>
			</body>
		</Root>
	);
}
