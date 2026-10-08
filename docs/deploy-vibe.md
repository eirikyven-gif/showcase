# Publisering av Vibe

Vibe bygges som statiske filer fra `vibe/` og publiseres på `https://yven.me/vibe/`. Deploymålet følger samme one.com-oppsett som nettstedene i `diverse-apper`:

- Servermappe: `/customers/3/3/f/yven.me/httpd.www/vibe/`
- Offentlig hub: `/vibe/`
- Smoke-kontroll: `/vibe/` og `/vibe/nedtelling/`
- Workflow: `.github/workflows/deploy-vibe-onecom.yml`

Workflowen har `workflow_dispatch` og starter med `dry_run=true`. En live-kjøring krever GitHub Actions-verdiene som brukes av den etablerte one.com-flyten: `ONECOM_HOST`, `ONECOM_USER` eller `ONECOM_SSH_USER`, `ONECOM_SSH_KNOWN_HOSTS`, og enten `ONECOM_SSH_KEY` eller `ONECOM_SSH_PASSWORD`. `ONECOM_PUBLIC_BASE_URL` kan settes; standarden er `https://yven.me`. `ONECOM_SSH_KNOWN_HOSTS` skal inneholde SSH-vertens offentlig verifiserte host key i OpenSSH known_hosts-format.

Deployen pakker kun `vibe/`-filer, pakker dem ut i en midlertidig sidemappe og bytter den nye katalogen atomisk på plass, med gjenoppretting hvis byttet feiler. Dette fjerner også gamle filer fra den dedikerte Vibe-mappen. Smoke-kontrollen kontrollerer HTTP 200 og sidetekst på huben og Nedtelling-direkteruten, samt status for katalogen og statiske CSS/JS-filer. Den bruker ingen apphemmeligheter, backend, kontoer eller serverlagring.

Kjør først dry-run. Dry-run kontrollerer lokale filer og den faste destinasjonsstien, men gjør ingen SSH-tilkobling. Etter live-deploy kontrolleres rutene på nytt som offentlig besøkende. Første publiserbare hubversjon er `0.1.0` i `VERSION`.
