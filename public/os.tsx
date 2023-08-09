//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import os from "os";
import { elements } from "./base";

//=============================================================================

export function OsInfo(): JSX.Element {
	const info = {
		Platform: process.platform,
		Arch: process.arch,
		BunVersion: Bun.version,
		CPU: os.cpus()[0].model,
		Cores: os.cpus().length,
		Uptime: process.uptime().toPrecision(4),

	};

	return (
		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th>Key</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(info).map(([key, value]) => (
						<tr>
							<td>{key}</td>
							<td>{value}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
