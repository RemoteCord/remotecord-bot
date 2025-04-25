import { Logger } from "@/shared/Logger";
import { WebhookClient, EmbedBuilder, AttachmentBuilder } from "discord.js";

const errorRateLimit = new Set<string>();
const RateLimit = 10000;

export async function errorHandling(client: any, config: {
    webhookUrl: string;
    embedColor?: string;
    embedTitle?: string;
    webhookUsername?: string;
    embedAvatarUrl?: string;
}) {
    process.removeAllListeners();

    const { webhookUrl, embedColor = "ff0000", embedTitle = "Error", webhookUsername = "Error", embedAvatarUrl = "" } = config;

    if (!webhookUrl) {
        const error = new Error("Webhook URL is required.");
        Logger.error(error);
        throw error;
    }

    const webhook = new WebhookClient({ url: webhookUrl });

    const sendErrorMessage = async (error: Error | string, eventType: string, additionalInfo = ""): Promise<void> => {
        const errorKey = `${eventType}-${additionalInfo}`;
        if (errorRateLimit.has(errorKey)) return;

        errorRateLimit.add(errorKey);
        setTimeout(() => errorRateLimit.delete(errorKey), RateLimit);

        const errorMessage = error instanceof Error ? error.stack || "No stack available" : String(error);

        const embed = new EmbedBuilder()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .setColor(embedColor as unknown as any)
            .setTimestamp()
            .setTitle(`__${eventType.toUpperCase()}__ - ${embedTitle}`)
            .setAuthor({ name: "Discord.js ‣ Anticrash" })
            .setFooter({ text: "Powered by discord.js-anticrash" })
            .addFields([
                {
                    name: "__Event Type__",
                    value: `\`${eventType.slice(0, 1021) || "No types provided."}\``,
                    inline: true,
                },
                {
                    name: "__Message__",
                    value: `**\`${additionalInfo.slice(0, 1017) || "No Additional Info Provided"}\`**`,
                    inline: true,
                },
            ])
            .setDescription(`__Detailed__\n\`\`\`${errorMessage.slice(0, 4076) || "Nothing found here."}\`\`\``);

        try {
            await webhook.send({
                username: webhookUsername,
                avatarURL: embedAvatarUrl,
                embeds: [embed],
            });

            if (errorMessage.length > 4076) {
                await webhook.send({
                    username: webhookUsername,
                    avatarURL: embedAvatarUrl,
                    files: [
                        new AttachmentBuilder(Buffer.from(errorMessage, "utf-8"), { name: "error.txt" }),
                    ],
                });
            }
        } catch (sendError: any) {
            Logger.error(`Error sending error message: ${sendError?.message || "Unknown error"}`);
        }
    };

    const handleError = async (error: Error | string, eventType: string, additionalInfo = "") => {
        Logger.error(error);
        if (eventType === "warning") {
            Logger.warn(typeof error === "string" ? error : error.message);
        } else if (eventType === "exit") {
            Logger.info(`Exiting with code and signal: ${additionalInfo}`);
        } else {
            await sendErrorMessage(error, eventType, additionalInfo);
        }
    };

    const processEventListeners: Record<string, { listener: (...args: any[]) => void }> = {
        unhandledRejection: {
            // eslint-disable-next-line no-void
            listener: (reason, promise) => void handleError(reason instanceof Error ? reason : new Error(String(reason)), "unhandledRejection", `Promise: ${promise}`),
        },
        uncaughtException: {
            listener: async (error, origin) => handleError(error instanceof Error ? error : new Error(String(error)), "uncaughtException", `Origin: ${origin}`),
        },
        uncaughtExceptionMonitor: {
            listener: async (error, origin) => handleError(error instanceof Error ? error : new Error(String(error)), "uncaughtExceptionMonitor", `Origin: ${origin}`),
        },
        warning: {
            listener: async (warning) => handleError(warning instanceof Error ? warning : new Error(String(warning)), "warning"),
        },
        exit: {
            listener: async (code, signal) => handleError(new Error(`Exiting with code ${code} and signal ${signal}`), "exit", `Code: ${code}, Signal: ${signal}`),
        },
    };

    for (const [event, { listener }] of Object.entries(processEventListeners)) {
        process.on(event, async (...args) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                listener(...args);
            } catch (err) {
                void handleError(err instanceof Error ? err : new Error(String(err)), "listenerError", `Event: ${event}`);
            }
        });
    }
}