interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare function sendEmail(opts: SendEmailOptions): Promise<void>;
export {};
//# sourceMappingURL=email.utils.d.ts.map