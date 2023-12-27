#!/bin/bash

docker compose -f ./development/docker-compose.yml build
docker compose -f ./development/docker-compose.yml down
docker compose -f ./development/docker-compose.yml up -d
docker image prune -f
docker builder prune -f
