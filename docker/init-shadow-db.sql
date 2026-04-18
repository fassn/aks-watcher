-- Shadow database for Prisma migrations
CREATE DATABASE aks_watcher_shadow;
GRANT ALL PRIVILEGES ON DATABASE aks_watcher_shadow TO aks;
\c aks_watcher_shadow
GRANT ALL ON SCHEMA public TO aks;
