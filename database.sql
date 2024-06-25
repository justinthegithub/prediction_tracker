-- USER is a reserved keyword with Postgres
-- You must use double quotes in every query that user is in:
-- ex. SELECT * FROM "user";
-- Otherwise you will have errors!


CREATE TABLE IF NOT EXISTS "user" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(80) UNIQUE NOT NULL,
    "password" VARCHAR(1000) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Favorite_Markets" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
    "user_id" BIGINT NOT NULL,
    "market_id" BIGINT NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "Favorite_Markets_fk1" FOREIGN KEY ("user_id") REFERENCES "user"("id")
);

CREATE TABLE IF NOT EXISTS "Market_Notes" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
    "favorite_market_id" BIGINT NOT NULL,
    "note_body" TEXT NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "Market_Notes_fk1" FOREIGN KEY ("favorite_market_id") REFERENCES "Favorite_Markets"("id")
);

INSERT INTO "user" (username, password) VALUES
('user_1', 'password_1'),
('user_2', 'password_2'),
('user_3', 'password_3'),
('user_4', 'password_4'),
('user_5', 'password_5'),
('user_6', 'password_6'),
('user_7', 'password_7'),
('user_8', 'password_8'),
('user_9', 'password_9'),
('user_10', 'password_10');

INSERT INTO "Favorite_Markets" (user_id, market_id) VALUES
(3, 25),
(2, 10),
(7, 17),
(7, 26),
(4, 21),
(6, 7),
(1, 50),
(9, 46),
(9, 7),
(1, 3),
(3, 26),
(9, 11),
(3, 40),
(9, 34),
(6, 24),
(7, 24),
(2, 4),
(4, 4),
(1, 12),
(2, 48);

INSERT INTO "Market_Notes" (favorite_market_id, note_body) VALUES
(17, 'Note body content 1'),
(6, 'Note body content 2'),
(6, 'Note body content 3'),
(15, 'Note body content 4'),
(12, 'Note body content 5'),
(2, 'Note body content 6'),
(10, 'Note body content 7'),
(1, 'Note body content 8'),
(15, 'Note body content 9'),
(12, 'Note body content 10'),
(19, 'Note body content 11'),
(6, 'Note body content 12'),
(13, 'Note body content 13'),
(16, 'Note body content 14'),
(11, 'Note body content 15'),
(9, 'Note body content 16'),
(16, 'Note body content 17'),
(1, 'Note body content 18'),
(5, 'Note body content 19'),
(3, 'Note body content 20'),
(9, 'Note body content 21'),
(14, 'Note body content 22'),
(15, 'Note body content 23'),
(2, 'Note body content 24'),
(4, 'Note body content 25'),
(8, 'Note body content 26'),
(12, 'Note body content 27'),
(14, 'Note body content 28'),
(16, 'Note body content 29'),
(7, 'Note body content 30');
