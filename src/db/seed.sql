INSERT INTO
    tags (name)
VALUES
    ('Video games'),
    ('Music'),
    ('Film & TV'),
    ('Sport'),
    ('Tech'),
    ('Anime'),
    ('Art & Design'),
    ('Books'),
    ('Cooking'),
    ('Travel')
ON CONFLICT (name) DO NOTHING;
