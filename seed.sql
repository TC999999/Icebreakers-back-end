DROP DATABASE IF EXISTS messages;

CREATE DATABASE messages;

\c messages

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS interests;
DROP TABLE IF EXISTS interests_to_users;
DROP TABLE IF EXISTS direct_conversations;
DROP TABLE IF EXISTS users_to_direct_conversations;
DROP TABLE IF EXISTS direct_conversations_messages;
DROP TABLE IF EXISTS blocker_user_to_blocked_user;
DROP TABLE IF EXISTS direct_conversations_requests;
DROP TABLE IF EXISTS group_conversations;
DROP TABLE IF EXISTS group_conversations_messages;
DROP TABLE IF EXISTS users_to_group_conversations;
DROP TABLE IF EXISTS blocked_users_to_group_conversations;
DROP TABLE IF EXISTS group_conversations_requests;
DROP TABLE IF EXISTS blocked_users_to_group_conversations;
DROP TABLE IF EXISTS group_conversations_invitations;
DROP TABLE IF EXISTS interests_to_group_conversations;


CREATE TABLE users(
    username VARCHAR(30) NOT NULL UNIQUE PRIMARY KEY,
    password TEXT NOT NULL,
    email_address TEXT NOT NULL UNIQUE CHECK (position('@' IN email_address) > 1),
    biography VARCHAR(200),
    favorite_color VARCHAR(7) CHECK (position('#' IN favorite_color) = 1),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    reporter_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    reported_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    checked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interests(
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE
);

CREATE TABLE interests_to_users(
    topic_id INTEGER NOT NULL REFERENCES interests ON DELETE CASCADE,
    username VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    PRIMARY KEY (topic_id, username)
);

CREATE TABLE direct_conversations(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT '',
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_to_direct_conversations(
    username VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    direct_conversation_id UUID NOT NULL REFERENCES direct_conversations ON DELETE CASCADE,
    unread_messages INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (username, direct_conversation_id)
);

CREATE TABLE direct_conversations_messages(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    username VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    direct_conversation_id UUID NOT NULL REFERENCES direct_conversations ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocker_user_to_blocked_user(
    blocker_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    blocked_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_user, blocked_user)
);

CREATE TABLE direct_conversation_requests(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    requester_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    content VARCHAR(100) NOT NULL,
    is_removed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_conversations(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    CHECK (LENGTH(description) <= 400),
    host_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_conversations_messages(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    username VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    group_conversation_id UUID NOT NULL REFERENCES group_conversations ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_to_group_conversations(
    username VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    group_conversation_id UUID NOT NULL REFERENCES group_conversations ON DELETE CASCADE, 
    unread_messages INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocked_user_to_group_conversations(
    blocked_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    group_conversation_id UUID NOT NULL REFERENCES group_conversations ON DELETE CASCADE,
    PRIMARY KEY (blocked_user, group_conversation_id)
);

CREATE TABLE group_conversation_requests(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    group_conversation_id UUID NOT NULL REFERENCES group_conversations ON DELETE CASCADE,
    content VARCHAR(100) NOT NULL,
    is_removed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_conversation_invitations(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    invited_user VARCHAR(30) NOT NULL REFERENCES users ON DELETE CASCADE,
    group_conversation_id UUID NOT NULL REFERENCES group_conversations ON DELETE CASCADE,
    content VARCHAR(100) NOT NULL,
    is_removed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interests_to_group_conversations(
    topic_id INTEGER NOT NULL REFERENCES interests ON DELETE CASCADE,
    group_conversation_id UUID NOT NULL REFERENCES group_conversations ON DELETE CASCADE,
    PRIMARY KEY (topic_id, group_conversation_id)
);

INSERT INTO users ("username","password", "email_address", "biography", "favorite_color") VALUES
('testuser1','$2b$12$WS.iDEiC6IUjjcf/.YzMROm8cYDyUBWHILEGqYxq3ObeXdl.VyXeq','testemail1@gmail.com','first test biography', '#162ee9'),
('testuser2','$2b$12$gIyS8OFeKKOZmptFGxUsGetXSqp9XJpZJifAeeQARIFK.qbLwt23W','testemail2@gmail.com','second test biography', '#eb1414'),
('testuser3','$2b$12$yhUkB1qiDpgCWn3Ujh2uJu3aqJhu0AEYjOjlpXH9XRXPxwthSqIz6','testemail3@gmail.com','third test biography', '#4d2aed'),
('testuser4','$2b$12$67KHDtYqh9vvoCqYROJMbOd82nV.DE25t3wvDE99cy1S6qsTrjA9a','testemail4@gmail.com','fourth test biography', '#35ed5a ');

INSERT INTO interests ("topic") VALUES
('sci-fi'),
('anime/manga'),
('superhero movies'),
('disney movies'),
('comics'),
('pop music'),
('cooking'),
('video games'),
('board games'),
('hiking'),
('traveling'),
('football'),
('coding'),
('STEM'),
('history'),
('astronomy'),
('literature'),
('theatre'),
('golf'),
('ice cream'),
('gardening'),
('art'),
('horseback riding'),
('karaoke'),
('card games'),
('card tricks');

INSERT INTO interests_to_users ("topic_id", "username") VALUES
(1,'testuser1'),
(2,'testuser1'),
(3,'testuser1'),
(4,'testuser2'),
(5,'testuser2'),
(6,'testuser2'),
(1,'testuser3'),
(3,'testuser3'),
(5,'testuser3'),
(2,'testuser4'),
(4,'testuser4'),
(6,'testuser4');