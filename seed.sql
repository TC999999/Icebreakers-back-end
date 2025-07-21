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
    username VARCHAR(30) NOT NULL UNIQUE PRIMARY KEY,
    password TEXT NOT NULL,
    email_address TEXT NOT NULL UNIQUE CHECK (position('@' IN email_address) > 1),
    biography VARCHAR(200),
    favorite_color VARCHAR(7),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE direct_conversations(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    user_1_id INTEGER NOT NULL REFERENCES users,
    user_2_id INTEGER NOT NULL REFERENCES users,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE direct_conversations_messages(
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users,
    direct_conversation_id  INTEGER NOT NULL REFERENCES direct_conversations,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE direct_conversation_requests(
    id SERIAL PRIMARY KEY,
    requester_user_id INTEGER NOT NULL REFERENCES users,
    requested_user_id INTEGER NOT NULL REFERENCES users,
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_conversations_messages(
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users,
    group_conversation_id INTEGER NOT NULL REFERENCES group_conversations,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_to_group_conversations(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users,
    group_conversation_id INTEGER NOT NULL REFERENCES group_conversations
);

CREATE TABLE group_conversation_requests(
    id SERIAL PRIMARY KEY,
    requester_user_id INTEGER NOT NULL REFERENCES users,
    group_conversation_id INTEGER NOT NULL REFERENCES group_conversations
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interests(
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE
);

CREATE TABLE interests_to_users(
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES interests,
    user_id INTEGER NOT NULL REFERENCES users
);