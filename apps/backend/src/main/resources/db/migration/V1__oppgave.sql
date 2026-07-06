CREATE TABLE oppgave
(
    id           UUID        NOT NULL PRIMARY KEY,
    tittel       VARCHAR(500) NOT NULL,
    beskrivelse  TEXT        NOT NULL,
    opprettet_av VARCHAR(20) NOT NULL,
    enhet        VARCHAR(10) NOT NULL,
    status       VARCHAR(20) NOT NULL,
    opprettet_at TIMESTAMP WITH TIME ZONE NOT NULL,
    oppdatert_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX oppgave_enhet_idx ON oppgave (enhet);
CREATE INDEX oppgave_status_idx ON oppgave (status);
