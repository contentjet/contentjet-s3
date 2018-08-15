# contentjet-s3

AWS S3 storage backend for [contentjet-api](https://github.com/contentjet/contentjet-api).

To enable you MUST set the following environment variable.

```
STORAGE_BACKEND=contentjet-s3
```

You MUST also provide the follow values.

```
AWS_ACCESS_KEY_ID=<your access key>
AWS_SECRET_ACCESS_KEY=<your secret access key>
AWS_REGION=<your aws region>
AWS_S3_BUCKET=<your s3 bucket>
MEDIA_URL=<your media url>
```

Note `MEDIA_URL` is the public URL of where to access the files from. For example, if your bucket has static hosting enabled this would be your bucket's endpoint URL. If you are using a CDN in front of your bucket (like Cloudfront) this would be the URL of your CDN.

You MAY also set the following to override the defaults shown.

```
AWS_S3_STORAGE_CLASS=STANDARD
AWS_S3_CACHE_CONTROL='max-age=604800'
AWS_S3_KEY_PREFIX=''
```
