#!/bin/bash

CONFIG_PATH= "$(pwd)/mosquitto.conf"
docker run -it -p 1883:1883 -p 9001:9001 -v $CONFIG_PATH:/mosquitto/config/mosquitto.conf eclipse-mosquitto
