-- A single grading session for grading some sort of code.
CREATE TABLE IF NOT EXISTS gradings(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    gitSha varchar(256) NOT NULL,
    gitRepo varchar(256) NOT NULL,
    gitBranch varchar(256) DEFAULT 'master',
    projectID INTEGER NOT NULL,
    gradingStatus INTEGER DEFAULT 0, -- 0 = not started, 1 = started, 2 = finished

    -- The time the grading session was started.
    started_at INTEGER DEFAULT (datetime('now', 'localtime'))
);

-- Users that took part in an exam session.
CREATE TABLE IF NOT EXISTS user(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	userLogin varchar(16) NOT NULL
);

-- Insert new grading session.
--INSERT INTO gradings(userID, gitSha, gitRepo, projectID) VALUES(912304, 'demo', 'git:demo', 1018);

-- Migrate from old schema to new schema.
--ALTER TABLE gradings ADD COLUMN gradingStatus INTEGER DEFAULT 0;
