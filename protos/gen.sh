#!/usr/bin/env bash

if ! command -v protoc &> /dev/null
then
    echo "Not generating ts definitions for protos, if you made change to proto files, make sure you install protoc and rerun build locally."
else
    echo "Generating ts definitions for protos"
    rm -rf gen_ts
    mkdir gen_ts
    # generate typescript definition of the proto using a fork of 
    # https://github.com/stephenh/ts-proto
    # at https://github.com/yiochen/ts-proto
    # installed globally
    # The fork adds typeUrl to each generated type.
    protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
        --ts_proto_opt=oneof=unions,env=browser,unrecognizedEnum=false,outputClientImpl=false \
        --ts_proto_out=gen_ts  \
        --experimental_allow_proto3_optional **/*.proto

    ./node_modules/.bin/barrelsby -c barrelsby.json --delete
fi