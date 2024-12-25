@echo off
echo ----- INSTALL -----
echo 1/3 Installing bot dependencies
pushd bot
deno install
popd
echo 2/3 Installing web dependencies
pushd web
deno install
popd
echo 3/3 Done installing dependencies