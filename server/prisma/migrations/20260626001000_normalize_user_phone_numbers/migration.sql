UPDATE "users"
SET "phone" = '+7' || RIGHT(REGEXP_REPLACE("phone", '\D', '', 'g'), 10)
WHERE REGEXP_REPLACE("phone", '\D', '', 'g') ~ '^(7|8)?7[0-9]{9}$';
