#!/bin/sh

# https://github.com/stephenh/ts-proto
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=gen_ts --ts_proto_opt=oneof=unions --experimental_allow_proto3_optional **/*.proto