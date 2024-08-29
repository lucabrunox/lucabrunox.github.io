---
title: 'Cheap Docker images with Nix'
date: 2016-04-15T01:42:00.001-07:00
draft: false
url: /2016/04/cheap-docker-images-with-nix_15.html
tags: 
- nixpkgs
- docker
- nix
- nixos
---

Let's talk about [Docker](https://www.docker.com/) and [Nix](http://nixos.org/nix/) today. Before explaining what Nix is, if you don't know yet, and before going into the details, I will show you a snippet similar to a Dockerfile for creating a Redis image equivalent to the one in [docker hub](https://github.com/docker-library/redis/blob/master/3.0/Dockerfile).  
  
The final image will be around **42mb** (or **25mb**) in size, compared to 177mb.  
  
EDIT: as mentioned on HN, [alpine-based images](https://github.com/docker-library/redis/blob/7dec62fe6de187165dce3f771efa57ce4e5d7a32/3.0/alpine/Dockerfile) can even go around 15mb in size.  
  
If you want to try this, the first step is to [install Nix](http://nixos.org/nix/download.html).  
  
Here's the `redis.nix` snippet:  
  
```
{ pkgs ? import <nixpkgs> {} }:

with pkgs;
let
  entrypoint = writeScript "entrypoint.sh" ''
    #!${stdenv.shell}
    set -e
    # allow the container to be started with `--user`
    if [ "$1" = "redis-server" -a "$(${coreutils}/bin/id -u)" = "0" ]; then
      chown -R redis .
      exec ${goPackages.gosu.bin}/bin/gosu redis "$BASH_SOURCE" "$@"
    fi
    exec "$@"
  '';
in
dockerTools.buildImage {
  name = "redis";
  runAsRoot = ''
    #!${stdenv.shell}
    ${dockerTools.shadowSetup}
    groupadd -r redis
    useradd -r -g redis -d /data -M redis
    mkdir /data
    chown redis:redis /data
  '';

  contents = [ redis ];

  config = {
    Cmd = [ "redis-server" ];
    Entrypoint = [ entrypoint ];
    ExposedPorts = {
      "6379/tcp" = {};
    };
    WorkingDir = "/data";
    Volumes = {
      "/data" = {};
    };
  };
}
```
  
Build it with: `nix-build redis.nix`  
Load it with: `docker load < result`  
  
Once loaded, you can see with `docker images` that it takes about 42mb of space.  

Fundamental differences with classic docker builds
--------------------------------------------------

*   We do not use any base image, like it's done for most docker images including [redis from the hub](https://hub.docker.com/_/redis/). It starts from scratch. In fact, we set up some basic shadow-related files with the `shadowSetup` utility, enough to add the redis user and make `gosu` work.
*   The Redis package is not being compiled inside Docker. It's being done by Nix, just like any other package.
*   The built image has only one layer, compared to dozens usually spitted by a readable `Dockerfile`. In our case, having multiple layers is useless because caching is handled by Nix, and not by Docker.

A smaller image
---------------

We can cut the size down to **25mb** by avoid using id from coreutils. As an example we'll always launch redis without the entrypoint:  

```
{ pkgs ? import <nixpkgs> {} }:

with pkgs;
dockerTools.buildImage {
  name = "redis";
  runAsRoot = ''
    #!${stdenv.shell}
    ${dockerTools.shadowSetup}
    groupadd -r redis
    useradd -r -g redis -d /data -M redis
    mkdir /data
    chown redis:redis /data
  '';

  config = {
    Cmd = [ "${goPackages.gosu.bin}/bin/gosu" "redis" "${redis}/bin/redis-server" ];
    ExposedPorts = {
      "6379/tcp" = {};
    };
    WorkingDir = "/data";
    Volumes = {
      "/data" = {};
    };
  };
}
```
  
  
You might ask: but coreutils is still needed for the `chown`, `mkdir` and other commands like that!  
  
The secret is that those commands are only used at build time and are not required at runtime in the container. Nix is able to detect that automatically for us.  
  
It means we don't need to manually remove packages after the container is built, like with other package managers! See [this line](https://github.com/docker-library/redis/blob/master/3.0/Dockerfile#L40) in Redis `Dockerfile` for example.  

Using a different redis version
-------------------------------

Let's say we want to build a Docker image with Redis 2.8.23. First we want to write a package (or _derivation_ in Nix land) for it, and then use that inside the image:  

```
{ pkgs ? import <nixpkgs> {} }:

with pkgs;
let
  redis = pkgs.redis.overrideDerivation (attrs: rec {
    name = "redis-2.8.23";
    src = fetchurl {
      url = "http://download.redis.io/releases/${name}.tar.gz";
      sha256 = "1kjsx79jhhssh5k9v17s9mifaclkl6mfsrsv0cvi583qyiw9gizk";
    };
  });
in
dockerTools.buildImage {
  name = "redis";
  tag = "2.8.23";

  runAsRoot = ''
    #!${stdenv.shell}
    ${dockerTools.shadowSetup}
    groupadd -r redis
    useradd -r -g redis -d /data -M redis
    mkdir /data
    chown redis:redis /data
  '';

  config = {
    Cmd = [ "${goPackages.gosu.bin}/bin/gosu" "redis" "${redis}/bin/redis-server" ];
    ExposedPorts = {
      "6379/tcp" = {};
    };
    WorkingDir = "/data";
    Volumes = {
      "/data" = {};
    };
  };
}
```
  
  
Note we also added the tag 2.8.23 to the resulting image. And that's it. The beauty is that we reuse the same redis expression from nixpkgs, but we override only the version to build.  

A generic build
---------------

There's more you can do with Nix. Being a language, it's possible to create a generic function for building Redis images given a specific package:  

```
{ pkgs ? import <nixpkgs> {} }:

with pkgs;
let
  redis_3_0_7 = pkgs.redis.overrideDerivation (attrs: rec {
    version = "3.0.7";
    name = "redis-${version}";
    src = fetchurl {
      url = "http://download.redis.io/releases/${name}.tar.gz";
      sha256 = "08vzfdr67gp3lvk770qpax2c5g2sx8hn6p64jn3jddrvxb2939xj";
    };
  });

  redis_2_8_23 = pkgs.redis.overrideDerivation (attrs: rec {
    version = "2.8.23";
    name = "redis-${version}";
    src = fetchurl {
      url = "http://download.redis.io/releases/${name}.tar.gz";
      sha256 = "1kjsx79jhhssh5k9v17s9mifaclkl6mfsrsv0cvi583qyiw9gizk";
    };
  });

  redisImage = redis: dockerTools.buildImage {
    name = "redis";
    tag = redis.version;

    runAsRoot = ''
      #!${stdenv.shell}
      ${dockerTools.shadowSetup}
      groupadd -r redis
      useradd -r -g redis -d /data -M redis
      mkdir /data
      chown redis:redis /data
    '';

    config = {
      Cmd = [ "${goPackages.gosu.bin}/bin/gosu" "redis" "${redis}/bin/redis-server" ];
      ExposedPorts = {
        "6379/tcp" = {};
      };
      WorkingDir = "/data";
      Volumes = {
        "/data" = {};
      };
    };
  };

in {
  redisDocker_3_0_7  = redisImage redis_3_0_7;
  redisDocker_2_8_23 = redisImage redis_2_8_23;
}
```
  
  
We created a "redisImage" function that takes a "redis" parameter as input, and returns a Docker image as output.  
  
Build it with:  

*   `nix-build redis-generic.nix -A redisDocker_3_0_7` 
*   `nix-build redis-generic.nix -A redisDocker_2_8_23`

  

Building off a base image
-------------------------

One of the selling points of Docker is reusing an existing image to add more stuff on top of it.  
  
Nix comes with a completely different set of packages compared to other distros, with its own toolchain and glibc version. This doesn't mean it's not possible to base a new image off an existing Debian image for instance.  
  
By using `dockerTools.pullImage` it's also possible to pull images from the Docker hub.  

```
{ pkgs ? import <nixpkgs> {} }:

with pkgs;
let
  redis_3_0_7 = pkgs.redis.overrideDerivation (attrs: rec {
    version = "3.0.7";
    name = "redis-${version}";
    src = fetchurl {
      url = "http://download.redis.io/releases/${name}.tar.gz";
      sha256 = "08vzfdr67gp3lvk770qpax2c5g2sx8hn6p64jn3jddrvxb2939xj";
    };
  });

  redis_2_8_23 = pkgs.redis.overrideDerivation (attrs: rec {
    version = "2.8.23";
    name = "redis-${version}";
    src = fetchurl {
      url = "http://download.redis.io/releases/${name}.tar.gz";
      sha256 = "1kjsx79jhhssh5k9v17s9mifaclkl6mfsrsv0cvi583qyiw9gizk";
    };
  });

  redisImage = redis: baseImage: dockerTools.buildImage {
    name = "redis";
    tag = redis.version;
    fromImage = baseImage;

    runAsRoot = ''
      #!${stdenv.shell}
      export PATH=/bin:/usr/bin:/sbin:/usr/sbin:$PATH
      ${if baseImage == null then dockerTools.shadowSetup else ""}
      groupadd -r redis
      useradd -r -g redis -d /data -M redis
      mkdir /data
      chown redis:redis /data
    '';

    config = {
      Cmd = [ "${goPackages.gosu.bin}/bin/gosu" "redis" "${redis}/bin/redis-server" ];
      ExposedPorts = {
        "6379/tcp" = {};
      };
      WorkingDir = "/data";
      Volumes = {
        "/data" = {};
      };
    };
  };

  debianImage = dockerTools.pullImage {
    imageName = "debian";
    sha256 = "08w22gx6hmmq75rybqzrxs03nzq2k39lrcj291yhsc08p9d9l9cj";
  };

in {
  redisDocker_3_0_7  = redisImage redis_3_0_7 null;
  redisDocker_2_8_23 = redisImage redis_2_8_23 null;
  redisOnDebian = redisImage redis_3_0_7 debianImage;
}
```
  
  
Build it with: `nix-build redis-generic.nix -A redisOnDebian`.  
  
Note that we added a couple of things. We pass the base image (`debianImage`), to our generic `redisImage` function, and that we only initialize shadow-utils if the base image is null.  
  
The result is a Docker image based off latest Debian but running Redis compiled with nixpkgs toolchain and using nixpkgs glibc. It's about 150mb. It has all the layers from the base image, plus the new single layer for Redis.  
  
That said, it's as well possible to use one of the previously defined Redis images as base image. The result of \`pullImage\` and \`buildImage\` is a .tar.gz docker image in both cases.  
  
You realize it's possible to build something quite similar to [docker-library](https://github.com/docker-library) using only Nix expressions. It might be an interesting project.  
  
_Be aware that things like PAM configurations, or other stuff, created to be suitable for Debian may not work with Nix programs that use a different glibc._  

Other random details
--------------------

The code above has been made possible by using nixpkgs commit 3ae4d2afe (2016-04-14) onwards, commit at which I've finally packaged `gosu` and since the size of the derivations have been notably reduced.  
  
Building the image is done without using any of the Docker commands. The way it works is as follows:  

1.  Create a layer directory with all the produced contents inside. This includes the filesystem as well as the json metadata. This process will use certain build dependencies (like `coreutils`, `shadow-utils`, `bash`, `redis`, `gosu`, ...).
2.  Ask Nix what are the runtime dependencies of the layer directory (like `redis`, `gosu`). Such dependencies will be always a subset of the build dependencies.
3.  Add such runtime dependencies to the layer directory.
4.  Pack the layer in a .tar.gz by following the [Docker specification](https://github.com/docker/docker/blob/master/image/spec/v1.md).

I'd like to state that **Nix has a safer and easier caching** of operations while building the image.  
As for Docker, great care has to be taken in order to use the layer cache correctly, because such caching is solely based on the `RUN` command string. This [blog post](http://thenewstack.io/understanding-the-docker-cache-for-faster-builds/) explains it well.  
This is not the case for Nix, because every output depends on a set of exact inputs. If any of the inputs change, the output will be rebuilt.  

So what is Nix?
---------------

[Nix](http://nixos.org/nix/) is a language and deployment tool, often used as package manager or configuration builder and system provisioning. The operating system [NixOS](http://nixos.org/nixos) is based on it.  
  
The code shown above is Nix. We have used the [nixpkgs](https://github.com/NixOS/nixpkgs) repository which provides several reusable Nix expressions like [redis](https://github.com/NixOS/nixpkgs/blob/master/pkgs/servers/nosql/redis/default.nix) and [dockerTools](https://github.com/NixOS/nixpkgs/blob/master/pkgs/build-support/docker/default.nix).  
  
The Nix concept is simple: write a Nix expression, build it. This is how the building process works at a high-level:  

1.  Read a Nix expression
2.  Evaluate it and determine the thing (called _derivation_) to be built.
3.  By evaluating the code, Nix is able to determine exactly the build inputs needed for such derivation.
4.  Build (or fetch from cache) all the needed inputs.
5.  Build (or fetch from the cache) the final derivation.

Nix stores all such derivations in a common nix store (usually `/nix/store`), identified by an hash. Each derivation may have dependencies to other paths in the same store. Each derivation is stored in a separate directory from other derivations.  
  
Won't go deeper as there's plenty of documentation about how Nix works and how its storage works.  
  
Hope you enjoyed the reading, and that you may give Nix a shot.
