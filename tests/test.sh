#!/usr/bin/env bash
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q2555445 > Q2555445.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q118396084 > Q118396084.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q22811618 > Q22811618.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q51498768 > Q51498768.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q51513600 > Q51513600.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q5545908 > Q5545908.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q6978910 > Q6978910.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q19055497 > Q19055497.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q19055771 > Q19055771.html &
sleep "0.${RANDOM:1:1}" && curl -s http://localhost:3000/http://localhost:3005/entity/Q19065267 > Q19065267.html &

wait