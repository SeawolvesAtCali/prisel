#!/bin/sh

mkdir -p ./assets/Script
cd ..
dts-bundle --name @prisel/client --main packages/client/lib/index.d.ts --baseDir '.' --out 'assets/Script/@prisel/client.d.ts'
dts-bundle --name @prisel/common --main common/lib/index.d.ts --baseDir '.' --out 'assets/Script/@prisel/common.d.ts'

