# Production VPS access

Hetzner VPS running the production stack. No secrets are stored in this file;
private keys stay outside the repo.

| Item | Value |
|------|-------|
| IP | `91.99.71.169` |
| User | `root` |
| Repo path on server | `/var/www/vps-femsportiva` |
| Uploads path | `/var/www/vps-blog/uploads` |
| VS Code Remote-SSH host | `femsportiva-vps` (defined in the Windows-side `C:\Users\litov\.ssh\config`) |
| Windows key | `C:\Users\litov\.ssh\id_rsa` |
| WSL key (copy) | `~/.ssh/femsportiva_rsa` (mode 600) |

## Connecting from WSL / terminal

```bash
ssh -i ~/.ssh/femsportiva_rsa root@91.99.71.169
```

The host key for the IP must be in `~/.ssh/known_hosts`. If it is missing, copy
the line from `/mnt/c/Users/litov/.ssh/known_hosts`, or connect once manually and
verify the fingerprint against the Hetzner console.

Optional, in `~/.ssh/config` on WSL:

```
Host femsportiva-vps
  HostName 91.99.71.169
  User root
  IdentityFile ~/.ssh/femsportiva_rsa
  IdentitiesOnly yes
```

## Notes

- Compose commands on the server use the `docker-compose` (v1 style) binary in
  the server's `Makefile`; check which is installed before running `make prod`.
- The server checkout was behind `main` and had local edits (as of 2026-10-19):
  do not `git pull` blindly. See the SSL notes below.
- Let's Encrypt cert lineage on the server is `www.femsportiva.com`
  (`certbot/conf/live/www.femsportiva.com/`). Nginx loads certs only at start, so
  it needs a reload after each renewal (about every 60 days).
- Quick manual fix after a renewal:
  `docker exec vps-femsportiva-nginx-1 nginx -s reload`

## Cron jobs on the server (root crontab, set up 2026-10-19)

| Schedule | Job |
|----------|-----|
| `0 */6 * * *` | `docker exec vps-femsportiva-nginx-1 nginx -s reload` — picks up renewed Let's Encrypt certs (log: `/var/log/nginx-reload.log`) |
| `15 3 * * *` | `/usr/local/bin/femsportiva-db-backup.sh` — mysqldump of `wordpress_prod` to `/var/backups/femsportiva/backup_prod_*.sql.gz`, keeps 14 days (log: `/var/log/femsportiva-backup.log`) |

Backups live on the same disk as the site; copy them off-server for real
disaster recovery. The server disk was 88% full on 2026-10-19.
