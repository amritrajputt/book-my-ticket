CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name varchar(50) not null,
    last_name varchar(50) null,
    email varchar(200) not null unique,
    password varchar(200) not null,
    salt varchar(200) not null,
    email_verified boolean default false,
    refresh_token varchar(200) null,
    reset_password_token varchar(200) null,
    reset_password_token_expires_at timestamp with time zone null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
)    

