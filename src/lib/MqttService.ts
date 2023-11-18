import type { MqttClient } from "mqtt";
import mqtt from "mqtt";
import type { AllPixelsMsg, PixelsMsg } from "./MessageTypes";


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
        this.client.publish(this.topic + "/pixels", JSON.stringify(messages), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    public sendAllPixels(messages: number[][]) {
        const allpixels = {
            data: messages.map((row) => row.join("")).join("")
        }
        
        console.log(allpixels);

        this.client.publish(this.topic + "/allpixels", JSON.stringify(allpixels), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    public clear() {
        this.client.publish(this.topic + "/clear", "{}", (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
