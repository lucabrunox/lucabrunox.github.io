---
title: 'Debian+Apache+Tomcat+Axis'
date: 2009-10-09T06:08:00.001-07:00
draft: false
url: /2009/10/debianapachetomcataxis.html
tags: 
- unical
- web services
- apache
- development
- axis
- java
- tomcat
---

Hello,  
one of the courses I'm following at the university is "Laboratorio di reti  
di calcolatori" which uses the technologies (really technologies?????)  
listed in the post title. This is a little tutorial for making them works,  
with a little script for registering .wsdd files.  
  
\- aptitude install apache2 tomcat6  
\- download the binaries of axis 1.x (latest is 2.x, it's not used in our course) and xerces then unpack them.  
\- copy \*.jar of xerces into the "lib" dir of axis.  
\- create "/etc/tomcat6/policy.d/99axis.policy" with:  

> grant codeBase "file:/var/lib/tomcat6/webapps/-" {  
> permission java.security.AllPermission;  
> };

  
\- copy the "axis" directory found under webapps of the axis binaries into /var/lib/tomcat6/webapps  
\- invoke-rc.d apache2 restart  
\- invoke-rc.d tomcat6 restart  
  
Now go to http://localhost:8080 to make sure that Apache-Axis works.  
  
Finally, this is the script for deploying web services (call it deploy.sh):  

> export AXIS\_HOME="/home/lethal/ingegneria/reti/axis/axis-1\_4"  
> export AXIS\_LIB="$AXIS\_HOME/lib"  
> export AXISCLASSPATH="$AXIS\_LIB/axis.jar:$AXIS\_LIB/commons-discovery-0.2.jar:$AXIS\_LIB/commons-logging-1.0.4.jar:$AXIS\_LIB/jaxrpc.jar:$AXIS\_LIB/saaj.jar:$AXIS\_LIB/log4j-1.2.8.jar:$AXIS\_LIB/xml-apis.jar:$AXIS\_LIB/xercesImpl.jar"  
> java -cp "$AXISCLASSPATH" org.apache.axis.client.AdminClient -lhttp://localhost:8080/axis/services/AdminService "$1"  

  
In the script, you must tweak the AXIS\_HOME variable to point to the unpacked axis binaries: avoid using spaces in this variable or you'll encounter several errors in terms of classpath.  
Usage of the script:  

> sh deploy.sh file.wsdd

  
We're done!