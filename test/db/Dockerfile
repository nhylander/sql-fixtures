# This script is only required to build a local version of the Containerised DB
# The inital image created in the ECR will be built with this dockerfile

FROM mysql/mysql-server:5.7
RUN cp -r /var/lib/mysql /var/lib/mysql-no-volume

COPY test/db/baseline.sql /docker-entrypoint-initdb.d/a.sql

CMD ["--datadir", "/var/lib/mysql-no-volume", "--sql-mode", ""]