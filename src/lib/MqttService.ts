import type { MqttClient } from "mqtt";
import mqtt from "mqtt";
import type { PixelsMsg } from "./MessageTypes";


export type MqttSubscription = {
    close(): void
}

export class MqttService {
    private client: MqttClient;
    private topic: string;

    constructor(address: string, topic: string) {
        this.client = mqtt.connect("mqtt://" + address);
        this.topic = topic;

        this.client.on("connect", () => {
            this.client.subscribe(topic);
        });
    }

    public sendMessages(messages: PixelsMsg) {
        this.client.publish(this.topic, JSON.stringify(messages), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
