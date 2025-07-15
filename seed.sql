DROP DATABASE IF EXISTS messages;

CREATE DATABASE messages;

\c messages

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS direct_conversations;
DROP TABLE IF EXISTS direct_conversations_messages;
DROP TABLE IF EXISTS blocker_user_to_blocked_user;
DROP TABLE IF EXISTS group_conversations;
DROP TABLE IF EXISTS group_conversations_messages;
DROP TABLE IF EXISTS users_to_group_conversations;
DROP TABLE IF EXISTS blocked_users_to_group_conversations;
DROP TABLE IF EXISTS reports;


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email_address TEXT NOT NULL UNIQUE CHECK (position('@' IN email_address) > 1),
    favorite_color TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE direct_conversations(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    user_1_id INTEGER NOT NULL REFERENCES users,
    user_2_id INTEGER NOT NULL REFERENCES users,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE direct_conversations_messages(
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users,
    direct_conversation_id  INTEGER NOT NULL REFERENCES direct_conversations,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE blocker_user_to_blocked_user(
    id SERIAL PRIMARY KEY,
    blocker_user_id INTEGER NOT NULL REFERENCES users,
    blocked_user_id INTEGER NOT NULL REFERENCES users
);

CREATE TABLE group_conversations(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    host_id INTEGER NOT NULL REFERENCES users,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE group_conversations_messages(
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users,
    group_conversation_id  INTEGER NOT NULL REFERENCES group_conversations,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE user_to_group_conversations(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users,
    group_conversation_id  INTEGER NOT NULL REFERENCES group_conversations
);

CREATE TABLE blocked_user_to_group_conversations(
    id SERIAL PRIMARY KEY,
    blocked_user_id INTEGER NOT NULL REFERENCES users,
    group_conversation_id  INTEGER NOT NULL REFERENCES group_conversations
);

CREATE TABLE reports(
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    reporter_user_id INTEGER NOT NULL REFERENCES users,
    reported_user_id INTEGER NOT NULL REFERENCES users,
    checked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);