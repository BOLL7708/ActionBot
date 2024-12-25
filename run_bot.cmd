@echo off
echo ----- BOT -----
pushd bot
@echo on
deno task run:live
popd bot