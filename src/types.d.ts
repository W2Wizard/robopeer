//=============================================================================
// W2Wizard, Amsterdam @ 2024
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

export interface GitBody extends RequestBody {
	data: GitData;
	envs: Record<string, string>?;
}

export interface FileBody extends RequestBody {
	data: FileData;
	envs: Record<string, string>?;
}

//=============================================================================
