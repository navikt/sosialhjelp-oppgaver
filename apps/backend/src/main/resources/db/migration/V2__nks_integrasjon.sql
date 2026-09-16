ALTER TABLE oppgave ADD COLUMN referanse BIGINT GENERATED ALWAYS AS IDENTITY;
ALTER TABLE oppgave ADD CONSTRAINT oppgave_referanse_key UNIQUE (referanse);

ALTER TABLE oppgave ADD COLUMN tilordnet_ressurs VARCHAR(7);
CREATE INDEX oppgave_tilordnet_ressurs_idx ON oppgave (tilordnet_ressurs);

ALTER TABLE oppgave ALTER COLUMN tittel DROP NOT NULL;
