import {Message, Blocks} from 'slack-block-builder';
import {NotificationProps} from "./client";


export function getStatusChangedToDownBlock(props: NotificationProps) {
    return Message().blocks(
        Blocks.Header({text: "🚨 Alert! Monitor Status Change 🚨"}),
        Blocks.Section({text: `👀 Heads up team, we've got some changes on the radar. 🔄\n\n📊 *${props.appName}*`}),
        Blocks.Section({text: `➡️ Was: ✅ ${props.previousStatus}\n📈 Now: ❌ ${props.currentStatus}`}),
    ).getBlocks();
}

export function getStatusChangedToUpBlock(props: NotificationProps) {
    return Message().blocks(
        Blocks.Header({text: "✅ Recovery! Monitor Status Change ✅"}),
        Blocks.Section({text: `🎉 Great news team, the monitor is back up and running smoothly! 🚀\n\n📊 *${props.appName}*`}),
        Blocks.Section({text: `➡️ Was: ❌ ${props.previousStatus}\n📈 Now: ✅ ${props.currentStatus}`}),
    ).getBlocks();
}

