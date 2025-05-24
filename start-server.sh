#!/bin/bash
export NODE_ENV=production
export PORT=3000
pm2 startOrReload ecosystem.config.js --env production
