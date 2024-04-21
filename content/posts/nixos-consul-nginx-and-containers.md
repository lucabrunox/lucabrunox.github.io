---
title: 'NixOS, Consul, Nginx and containers'
date: 2015-02-19T03:59:00.001-08:00
draft: false
url: /2015/02/nixos-consul-nginx-and-containers.html
tags: 
- containers
- consul
- nix
- nixos
---

This is a follow up post on [https://medium.com/@dan.ellis/you-dont-need-1mm-for-a-distributed-system-70901d4741e1](https://medium.com/@dan.ellis/you-dont-need-1mm-for-a-distributed-system-70901d4741e1) . I think the post was well written, so I decided to write a variant using [NixOS](http://nixos.org/).  
  
We'll be using [declarative nixos containers](https://nixos.org/releases/nixos/14.12/nixos-14.12.374.61adf9e/manual/ch-containers.html#sec-declarative-containers), which do not use docker but [systemd-nspawn](http://www.freedesktop.org/software/systemd/man/systemd-nspawn.html). Also systemd is started as init system inside containers.  
  
Please note that this configuration can be applied to any nixos machine, and also the containers configuration could be applied to real servers or other kinds of virtualization, e.g. via [nixops](http://nixos.org/nixops/). That is, the same syntax and configuration can be reused anywhere else within the nix world.  
  
For example, you could create docker containers with nixos, and keep running the host with another distribution.  
  
However for simplicity we'll use a NixOS system.  
  
Architecture: the host runs nginx and a consul server, then spawns several containers with a python service and a consul client. On the host, [consul-template](https://github.com/hashicorp/consul-template) will rewrite the nginx configuration when the health check status of container services change.  
  
Please use a recent unstable release of nixos at the time of this writing (19 Feb 2015, at least commit aec96d4), as it contains the recently packaged [consul-template](https://github.com/hashicorp/consul-template).  
  

### Step 1: write the service

  
Let's write our python service in `/root/work.py`:  
```
#!/usr/bin/env python

import random

from flask import Flask
app = Flask(__name__)

def find_prime(start):
    """
    Find a prime greater than `start`.
    """
    current = start
    while True:
        for p in xrange(2, current):
            if current % p == 0:
                break
        else:
            return current
        current += 1

@app.route("/")
def home():
    return str(find_prime(random.randint(2 ** 25, 2 ** 26)))

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True) 
```
The only difference with the original post is that we explicitly set the port to 8080 (who knows if a day flask changes the default port).  
  

### Step 2: write the nixos config

  
Write the following in `/etc/nixos/prime.nix`:  
```
{ lib, pkgs, config, ... }:

let

  pypkgs = pkgs.python27Packages;

  # Create a self-contained package for our service
  work = pkgs.stdenv.mkDerivation {
    name = "work";
    unpackPhase = "true";
    buildInputs = [ pkgs.makeWrapper pypkgs.python pypkgs.flask ];
    installPhase = ''
      mkdir -p $out/bin
      cp ${/root/work.py} $out/bin/work.py
      chmod a+rx $out/bin/work.py
      wrapProgram $out/bin/work.py --prefix PYTHONPATH : $PYTHONPATH
    '';
  };

  # Function which takes a network and the final octet, and returns a container
  mkContainer = net: octet: {
    privateNetwork = true;
    hostAddress = "${net}.1";
    localAddress = "${net}.${octet}";
```
```
 autoStart = true;

    config = { config, pkgs, ... }:
      {
        users.mutableUsers = false;
        # Use this only for debugging, login the machine with machinectl
        users.extraUsers.root.password = "root";
        # Let consul run check scripts
        users.extraUsers.consul.shell = "/run/current-system/sw/bin/bash";

        environment.etc."consul/prime.json".text = builtins.toJSON {
          service = {
            name = "prime";
            tags = [ "nginx" ];
            port = 8080;
            check = {
              script = "${pkgs.curl}/bin/curl localhost:8080 >/dev/null 2>&1";
              interval = "30s";
            };
          };
        };

        systemd.services.prime = {
          wantedBy = [ "multi-user.target" ];

          serviceConfig = {
            ExecStart = "${work}/bin/work.py";
          };
        };

        services.consul = {
          enable = true;
          extraConfig = { 
            server = false;
            start_join = [ "${net}.1" ];
          };
          extraConfigFiles = [ "/etc/consul/prime.json" ];
        };

        networking.firewall = {
          allowedTCPPorts = [ 8080 8400 ];
          allowPing = true;
        };
      };
  };

  nginxTmpl = pkgs.writeText "prime.conf" ''
    upstream primes {
        {{range service "prime"}}
        server {{.Address}}:8080;{{end}}
    }
  '';

in
{
  containers.prime1 = mkContainer "10.50.0" "2";
  containers.prime2 = mkContainer "10.50.0" "3";
  containers.prime3 = mkContainer "10.50.0" "4";
  containers.prime4 = mkContainer "10.50.0" "5";

  services.consul = {
    enable = true;
    extraConfig = {
      bootstrap = true;
      server = true;
    };
  };

  services.nginx = {
    enable = true;
    httpConfig = ''
      include /etc/nginx/prime.conf;

      server {
        listen 80;

        location / {
          proxy_pass http://primes;
        }
      }
    '';
  };

  systemd.services.nginx = {
    preStart = ''
      mkdir -p /etc/nginx
      touch -a /etc/nginx/prime.conf
    '';

    serviceConfig = {
      Restart = "on-failure";
      RestartSec = "1s";
    };
  };

  # Start order: consul -> consul-template -> nginx
  systemd.services.consul-template = {
    wantedBy = [ "nginx.service" ];
    before = [ "nginx.service" ];
    wants = [ "consul.service" ];
    after = [ "consul.service" ];

    serviceConfig = {
      Restart = "on-failure";
      RestartSec = "1s";
      ExecStart = "${pkgs.consul-template}/bin/consul-template -template '${nginxTmpl}:/etc/nginx/prime.conf:systemctl kill -s SIGHUP nginx'";
    };
  };

  boot.kernel.sysctl."net.ipv4.ip_forward" = true;
} 
```
Differences with the original post:  

*   We only create 4 containers instead of 10. I was lazy here. If you are lazy too, you can still automatize the process with nix functions (for example `map`).
*   We define some ordering in how services start and how they restart with systemd.
*   For simplicity we include the `prime.conf` nginx config instead of rewriting the whole nginx config with consul-template.
*   We create a self-contained package for our python service, so that anywhere it runs the dependencies will be satisfied.

Finally import this config in your `/etc/nixos/configuration.nix` with `imports = [ ./prime.nix ];`.  
  

### Step 3: apply the configuration

  
Type `nixos-rebuild switch` and then `curl http://localhost`. You may have to wait some seconds before consul writes the nginx config. In the while, nginx may have failed to start. If it exceeded the StartTime conditions, you can `systemctl start nginx` manually.  
Fixing this is about tweaking the systemd service values about the StartTime.  
  
Each container consumes practically no disk space at base. Everything else is shared through the host nix store, except logs, consul state, ecc. of course.  
  
Have fun!