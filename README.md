# Redis service

### Interactive + Autoconf Install (for dev)

```
npm install --foreground-scripts --progress false  --save @backkit/redis
```

### Non-Interactive Install with Default Autoconf (for dev)

```
npm install --save @backkit/redis
```

### Non-Interactive Non-Autoconf install (for production)

```
NO_AUTOCONF=y \
npm install @backkit/redis --save
```


### Configuration

Starting with 0.2.0, you can use redis url connection string.

This is now the prefered way to connect. It supports all features like secured connection, user/password.

Most managed redis cloud providers give you a connection string to copy/paste.


```
url: "redis://localhost:6379"
```
