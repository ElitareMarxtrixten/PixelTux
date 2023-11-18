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

    private swapCoordinates(originalArray: number[][]) {
        const newArray = [];
      
        for (let y = 0; y < originalArray[0].length; y++) {
          newArray[y] = [] as number[];
          
          for (let x = 0; x < originalArray.length; x++) {
            newArray[y][x] = originalArray[x][y];
          }
        }
      
        return newArray;
      }

    public sendMessages(messages: PixelsMsg) {
        this.client.publish(this.topic + "/pixels", JSON.stringify(messages), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    public sendAllPixels(messages: number[][]) {

        const allpixels = this.swapCoordinates(messages);

        const data = {
            data: allpixels.flat().flat().join("")
        }
        
        console.log(allpixels.flat().flat());

        this.client.publish(this.topic + "/allpixels", JSON.stringify(data), (err) => {
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
