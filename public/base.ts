//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import * as elements from "typed-html";

//=============================================================================

/** The base HTML template for the entire application. */
const Root = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset='utf-8'>
	<meta http-equiv='X-UA-Compatible' content='IE=edge'>
	<title>Grader Dashboard</title>
	<meta name='viewport' content='width=device-width, initial-scale=1'>
	<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧪</text></svg>">
	<link rel='stylesheet' type='text/css' media='screen' href='/assets/styles.css'>
	<script src="https://unpkg.com/htmx.org@1.9.4"></script>
</head>

${children}
`;

export { elements, Root };
