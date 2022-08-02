# /src/api

This directory holds modules in connection with api calls: calling backend application or potentially a third-party api.

## Naming Convention

`TODO:`

- Refactor the underlying server call logic (fetch currently) and add error handling
- standard response object for all methods {success, status, body, msg} ?
- refactor csvParser / text-encoding ...
- The exported api functions/methods are prefixed with `api`.
- `api.visualization.getTableStats` still uses `/dataretrieval/` endpoint!
- remove `community` from api endpoints
