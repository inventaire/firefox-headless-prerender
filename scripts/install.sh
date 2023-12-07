#!/usr/bin/env bash

openssl req -x509 -sha256 -nodes -days 1095 -newkey rsa:2048 -keyout keys/self-signed.key -out keys/self-signed.crt -subj "/C=/ST=/L=/O=/OU=/CN=."
