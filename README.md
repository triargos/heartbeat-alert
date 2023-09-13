
# slack-alert
Send **elastic heartbeat** status updates / alerts to your slack channel with this simple deamon

## ⚡️ Quick start
> ❗️ Note: You have to have docker and docker-compose installed.

First, clone this repository to a machine you want to run the deamon from. The elasticsearch instance needs to be reachable from there.


```bash
git clone https://github.com/triargos/slack-alert.git
```

Next, copy the .env.example file to config/.env and assign the following variables:
- ```SLACK_WEBHOOK_URL```
- ```ELASTICSEARCH_URL```
- ```KIBANA_URL```
- ```ELASTICSEARCH_API_KEY```


You can either run this service standalone or within a docker-compose setup. We recommend the latter:

```yaml
...

slack-alert: 
  container_name: slack-alert
  build:
    context slack-alert/
  env_file:
    - ./slack-alert/config/.env
  restart: unless-stopped

...
```
This way, you could integrate the slack-alert integration into your ELK stack docker setup.

To start, just start up your docker-compose project:

```bash
docker-compose up -d
```

The bot should now post its startup message and supply the first status update in 20 seconds.

