CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS registrations (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id          VARCHAR(255) NOT NULL,
    member_type_id   VARCHAR(255) NOT NULL,
    member_type_name VARCHAR(255) NOT NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    phone            VARCHAR(50)  NOT NULL,
    birth_date       DATE         NOT NULL,
    submitted_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_email_form UNIQUE (email, form_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_form_id ON registrations (form_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email   ON registrations (email);
