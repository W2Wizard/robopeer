//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

/** Body in regards to a git project test / execution. */
export interface GitData {
	/** The repository URL */
	repo: string;
	/** The branch */
	branch: string;
	/** The commit to be tested */
	commit: string;
}

/** Body in regards to a single file test / execution */
export interface FileData {
	/** The language of the program */
	lang: "c" | "cpp";
	/** The content of the file */
	content: string;
	/** Flags to be passed to the compiler */
	flags: string[];
	/** Arguments to be passed to the program */
	args: string[];
}

/** Shared body between POST request */
export interface RequestBody {
	type: "git" | "file";
	envs: Record<string, string>;
}

//=============================================================================

export interface GitBody extends RequestBody {
	type: "git";
	data: GitData;
}

export interface FileBody extends RequestBody {
	type: "file";
	data: FileData;
}

//=============================================================================

/** Union of all possible request bodies. */
export type Body<T = GitData | FileData> =
	T extends GitData ? GitBody :
	T extends FileData ? FileBody :
	never