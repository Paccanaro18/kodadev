CREATE TABLE users (
                       id          BIGSERIAL PRIMARY KEY,
                       github_id   BIGINT       NOT NULL UNIQUE,
                       login       VARCHAR(100) NOT NULL,
                       name        VARCHAR(255),
                       avatar_url  VARCHAR(500),
                       created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                       updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);