#!/bin/sh

ENV_VARIABLES=$(echo "$(export)" | sed -nr "/REACT_APP/p" | sed "s/export /\t/" | sed "s/=/ : /" | sed "s/$/,/")

ENV="window._env_ = { ${ENV_VARIABLES} }"

echo $ENV > ./runtime/env.js