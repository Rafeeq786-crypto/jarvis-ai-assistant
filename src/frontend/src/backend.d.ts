import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    role: Role;
    timestamp: bigint;
}
export enum Role {
    user = "user",
    assistant = "assistant"
}
export interface backendInterface {
    addMessage(role: Role, content: string): Promise<void>;
    clearHistory(): Promise<void>;
    getMessages(): Promise<Array<Message>>;
}
