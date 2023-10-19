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
|------------------------|---------|-----------|
| `watchMonitorInterval` | `30`    | `seconds` |
| `watchEventsInterval`  | `30`    | `seconds` |

To assign the configuration, create a json file with the following structure and mount it to `/app/config/service.json`

````json
{
  "watchMonitorInterval": 60,
  "watchEventsInterval": 60
}

````

### Configure alerting rules

You decide when you want to be alerted by creating rule entries in the "rules" directory. You can decide where you
create it, just mount it as a volume to ```/app/config/rules```.

> ❗️ Note: You can name the file however you want

To create a rule that triggers when a monitor reports the `DOWN` status, you can create a `down.json` file in the rules
directory that looks like this:

````json
{
  "event": "STATUS_DOWN",
  "channels": [
    "SLACK",
    "DISCORD"
  ],
  "after_seconds": 60
}
````
The `after_seconds ` rule specifies how long the service should wait until it notifies the channel (for example if you have a service that reports down for 10 seconds when updating)


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
    ./config:/app/config
  
...
```

This way, you could integrate the heartbeat-alert integration into your ELK stack docker setup.
To start, just start up your docker-compose project:

```bash
docker-compose up -d
```