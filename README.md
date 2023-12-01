# heartbeat-alert

Send **elastic heartbeat** status updates / alerts to your slack / discord channel with this simple deamon

## ⚡️ Quick start

> ❗️ Note: You have to have docker and docker-compose installed.

### Configure environment variables

In order to run the service, you need to configure the following environment variables:

- ```SLACK_WEBHOOK_URL```
- ```ELASTICSEARCH_URL```
- ```KIBANA_URL```
- ```ELASTICSEARCH_API_KEY```

> You can copy the .env.example file to .env and assign the variables there.

### Configure the service

Next, you (can) configure the service intervals. The following configurations are supported:

| Name                   | Default | Unit      |
|------------------------|--------|-----------|
| `watchMonitorInterval` | `60`    | `seconds` |

To assign the configuration, create a json file with the following structure and mount it to `/app/.heartbeat.json`

````json
{
  "watchMonitorInterval": 60
}

````

### Configure alerting rules

To be alerted on specific events, append the "rules" array to the .heartbeat.json file you created in the previous step.

````json
{
  "watchMonitorInterval": 60,
  "rules": [
    {
      "event": "STATUS_DOWN",
      "channels": [
        "SLACK",
        "DISCORD"
      ]
    }
  ]
}
````

#### Available event triggers

| Trigger name      |
|-------------------|
| `STATUS_UP`       |
| `STATUS_DOWN`     |
| `ERROR`           |
| `ERROR_RECOVERED` |

#### Available channels

| Channel name |
|--------------|
| `SLACK`      |

(more channels are planned)


### Running the project

You can either run this service standalone or within a docker-compose setup. We recommend the latter:

```yaml
...

slack-alert:
  container_name: heartbeat-alert
  image: triargos/heartbeat-alert:latest
  env_file:
    - ./heartbeat-alert/.env
  restart: unless-stopped
  volumes:
    ./heartbeat.json:/app/.heartbeat.json

...
```

This way, you could integrate the heartbeat-alert integration into your ELK stack docker setup.
To start, just start up your docker-compose project:

```bash
docker-compose up -d
```