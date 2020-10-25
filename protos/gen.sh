#!/usr/bin/env bash

# generate typescript definition of the proto using a fork of 
# https://github.com/stephenh/ts-proto
# at https://github.com/yiochen/ts-proto
# installed globally
# The fork adds typeUrl to each generated type.
protoc --plugin=proto-gen-ts_proto \
    --ts_proto_opt=oneof=unions  \
    --ts_proto_out=gen_ts  \
    --ts_proto_opt=unrecognizedEnum=false \
    --ts_proto_opt=outputClientImpl=false \
    --experimental_allow_proto3_optional **/*.proto