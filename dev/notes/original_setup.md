# Original Setup

## Pre-requisites
[Deno](https://deno.com/) for Windows

1. Run this in a terminal.
    ```shell
    irm https://deno.land/install.ps1 | iex
    ```
2. Choose to add Deno to PATH during the installation.
3. Verify that it was installed, possibly in a new terminal, with `deno -v` that should show the version.

## Project
The whole bot runs in [Fresh](https://fresh.deno.dev/) by Deno, it's a full stack framework.

What I used to initialize it in the project:
```shell
deno run -A -r https://fresh.deno.dev
```
