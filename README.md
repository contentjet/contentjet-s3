# contentjet-s3

AWS S3 storage backend for [contentjet-api](https://github.com/contentjet/contentjet-api).

The following environment variables MUST be set.

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET
```

You MAY also set the following to override the defaults shown.

```
AWS_S3_STORAGE_CLASS=STANDARD
AWS_S3_CACHE_CONTROL='max-age=604800'
AWS_S3_KEY_PREFIX=''
```
