#!/usr/bin/env bash

if ! command -v protoc &> /dev/null
then
    echo "Not generating ts definitions for protos, if you made change to proto files, make sure you install protoc and rerun build locally."
else
    echo "Generating ts definitions for protos"
    # generate typescript definition of the proto using a fork of 
    # https://github.com/stephenh/ts-proto
    # at https://github.com/yiochen/ts-proto
    # installed globally
    # The fork adds typeUrl to each generated type.
    protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
        --ts_proto_opt=oneof=unions  \
        --ts_proto_out=gen_ts  \
        --ts_proto_opt=unrecognizedEnum=false \
        --ts_proto_opt=outputClientImpl=false \
        --experimental_allow_proto3_optional **/*.proto

    ./node_modules/.bin/barrelsby -c barrelsby.json --delete
fi