Walkin lambda for xml cron job

Create an achive to upload to AWS Lambda:
```bash
zip -r walkin-lambda-$(date +%Y%m%d%H%M%S).zip ./handler.js ./node_modules/ ./package-lock.json ./package.json ./serverless.yml
```
