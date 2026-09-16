UPDATE oppgave SET prioritet = 'HOY' WHERE prioritet = 'HØY';
UPDATE oppgave SET prioritet = 'NORM' WHERE prioritet = 'NORMAL';
ALTER TABLE oppgave ALTER COLUMN prioritet SET DEFAULT 'NORM';
