# heartbeat-alert

Send **elastic heartbeat** status updates / alerts to your slack / discord channel with this simple deamon

## ⚡️ Quick start

> ❗️ Note: You have to have docker and docker-compose installed.

First, clone this repository to a machine you want to run the deamon from. The elasticsearch instance needs to be
reachable from there.

```bash
git clone https://github.com/triargos/heartbeat-alert.git
```

Next, copy the .env.example file to .env and assign the following variables:

- ```SLACK_WEBHOOK_URL```
- ```ELASTICSEARCH_URL```
- ```KIBANA_URL```
- ```ELASTICSEARCH_API_KEY```

You can either run this service standalone or within a docker-compose setup. We recommend the latter:

```yaml
...

slack-alert:
  container_name: heartbeat-alert
  build:
    context heartbeat-alert/
  env_file:
    - ./heartbeat-alert/.env
  restart: unless-stopped

...
```

This way, you could integrate the heartbeat-alert integration into your ELK stack docker setup.

Now you need to configure your alerts and intervals. Create a ```config``` folder in the project root.

### Configure intervals

The service configuration is created as a "service.json" file. Provide the intervals for the application in seconds

```json
{
  "watchMonitorInterval": 60,
  "watchEventsInterval": 60
}
````

### Configure alerting rules

Create a ```rules``` directory in the in the ```config```` folder. Here you can add as many rules in the JSON format as
you want. They have the following format:

```json
{
  "event": "STATUS_UP",
  "channels": [
    "SLACK",
    "DISCORD"
  ],
  "after_seconds": 60
}
```

The configuration supports the following events:

| Event Name        |
|-------------------|
| `STATUS_UP`       |
| `STATUS_DOWN`     |
| `ERROR`           |
| `ERROR_RECOVERED` |

The configuration supports the following channels:

| Channel Name |
|--------------|
| `SLACK`      |

### Start the service

To start, just start up your docker-compose project:

```bash
docker-compose up -d
```