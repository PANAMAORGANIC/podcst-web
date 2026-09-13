# Contributing

World Audio Repository is a **catalogue**, not a player. Please discuss
large changes before opening a pull request.

## Pull request process

1. Update `README.md` and/or `PRODUCT.md` when you change the interface,
   environment variables, or ingest rules.
2. Keep ingest metadata-only. Do not add code that downloads or hosts
   copyrighted audio or video.
3. Do not commit API keys. Document new variables in `.env.example`.
4. `npm run typecheck`, `npm run lint`, and `npm test` should stay clean.
5. Merge after one reviewer sign-off.
