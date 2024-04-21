---
title: 'OpenVPN configuration for server and multiple clients'
date: 2018-08-14T12:16:00.001-07:00
draft: false
url: /2018/08/openvpn-server-with-multiple-clients.html
tags: 
- linux
- openvpn
---

This is a simple post showing a basic configuration for setting up OpenVPN server accepting multiple clients with TLS.  
  
First of all generate self-signed server and client private key and certificates, and dh params. **Make sure to write the Organization Name AND Common Name (CN) when asked**, otherwise openvpn will fail to verify the certificates.  
  
`openssl req -newkey rsa:2048 -nodes -keyout serverkey.pem -x509 -days 365000 -out servercert.pem  
openssl req -newkey rsa:2048 -nodes -keyout clientkey.pem -out client.csr  
openssl x509 -req -days 365000 -in client.csr -CA servercert.pem -CAkey serverkey.pem -set_serial 01 -out clientcert.pem  
openssl dhparam -outform PEM -out dh.pem 1024  
`  

  

Server configuration:  
  
`dev tun  
mode server  
tls-server  
server 10.8.0.0 255.255.255.0  
ca servercert.pem  
cert servercert.pem  
key serverkey.pem  
dh dh.pem  
duplicate-cn  
topology subnet  
keepalive 10 60  
ping-timer-rem  
persist-tun  
persist-key  
`

  
If you plan to use the server as gateway like configured below, don't forget to enable IP forwarding and masquerading:  
  
`sysctl net.ipv4.ip_forward=1  
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -j MASQUERADE  
`  
Client configuration:  
  
`client  
redirect-gateway  
tls-client  
key clientkey.pem  
cert clientcert.pem  
ca servercert.pem  
keepalive 10 60  
dev tun  
`  
  
Have fun, tune as needed.