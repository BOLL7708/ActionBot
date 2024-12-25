@echo off
echo ----- BUILD -----
pushd web
deno task build
popd