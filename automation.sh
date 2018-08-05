#!/usr/bin/env sh

echo START AUTOMATION
alias flow-node="./node_modules/.bin/flow-node"

env DEBUG=debug flow-node automation/smokeTest.js