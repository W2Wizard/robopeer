// ============================================================================
// Copyright (C) 2024 W2Wizard
// See README in the root of the project for license details.
// ============================================================================

import Container from './docker/container'
import Git from './git'
import { AutoRouter, json, type IRequest, type ResponseHandler, error, status, StatusError } from 'itty-router'
import type { FileBody, GitBody } from './types'
import { $ } from 'bun'
import Single from './single'

// Middleware
// ============================================================================

const withHeaders: ResponseHandler = (response: IRequest) => {
	response.headers.set('X-Server', Bun.env.SERVER ?? 'robopeer')
	response.headers.set('X-Powered-By', 'itty-router')
	response.headers.set('X-Runtime', `Bun ${Bun.version}`)
}

// ============================================================================

const router = AutoRouter({
	port: Bun.env.PORT,
	finally: [withHeaders],
	format: json,
	catch: error,
})

router.post('/evaluate/git/:project', async (req) => {
	let body: GitBody = await req.json()
		.catch(() => { throw new StatusError(400, 'Invalid JSON body.') })
		.then((data) => data);

	if (!body.data.branch || !body.data.commit || !body.data.repo) {
		throw new StatusError(400, 'Invalid JSON body.')
	}

	if (!await Bun.file(`./projects/${req.params.project}/index.test.ts`).exists()) {
		throw new StatusError(404, 'Project not found.')
	}

	return await Git.run(req.params.project, body)
})

router.post('/evaluate/code', async (req) => {
	let body: FileBody = await req.json()
		.catch(() => { throw new StatusError(400, 'Invalid JSON body.') })
		.then((data) => data);

	if (
		!body.data.args ||
		!body.data.content ||
		!body.data.flags ||
		!body.data.lang
	) {
		throw new StatusError(400, 'Invalid JSON body.')
	}

	return await Single.run(body)
})

console.log(`Running: https://localhost:${Bun.env.PORT ?? 8080}`);

// ============================================================================

export default router
