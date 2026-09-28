ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, clarify_health';
NOTIFY pgrst, 'reload config';