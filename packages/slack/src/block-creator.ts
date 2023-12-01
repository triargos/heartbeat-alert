import {Message, Blocks} from 'slack-block-builder';
import {NotificationProps} from "./client";


export function getStatusChangedToDownBlock(props: NotificationProps) {
    return Message().blocks(
        Blocks.Divider(),
        Blocks.Header({text: "🚨  Monitor is down"}),
        Blocks.Section({text: `👀 Heads up team, something is wrong with the monitor!`}),
        Blocks.Divider(),
        Blocks.Section({text: `🖥️🔴  *${props.appName}*`}),
        Blocks.Divider(),
    ).getBlocks();
}

export function getStatusChangedToUpBlock(props: NotificationProps) {
    return Message().blocks(
        Blocks.Divider(),
        Blocks.Header({text: "✅ Monitor is up"}),
        Blocks.Section({text: `🚀  Great news team, the monitor is up and running smoothly!`}),
        Blocks.Divider(),
        Blocks.Section({text: `🖥️🟢  *${props.appName}*`}),
        Blocks.Divider(),
    ).getBlocks();
}

